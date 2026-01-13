import { saveToDB, getFromDB } from "./indexedDb";

export async function getOrCreateRSAKeys() {
    const storedPrivate = await getFromDB("privateKey");

    if (storedPrivate) {
        try {
            // Self-healing: if private key exists, ALWAYS derive public key from it
            // This ensures 100% consistency and fixes any mismatch
            const privateKey = await importPrivateKey(storedPrivate);

            // Derive Public Key from Private Key (via JWK)
            const jwk = await crypto.subtle.exportKey("jwk", privateKey);
            const { kty, n, e } = jwk;
            const publicKey = await crypto.subtle.importKey(
                "jwk",
                { kty, n, e, alg: "RSA-OAEP-256", ext: true },
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );

            // Update stored public key to match
            const exportedPublic = await crypto.subtle.exportKey("spki", publicKey);
            await saveToDB("publicKey", exportedPublic);

            return { privateKey, publicKey };
        } catch (err) {
            console.error("Error preventing key mismatch, regenerating...", err);
            // If derived failed (corrupt key?), fall through to regenerate
        }
    }

    // If no private key (or failed to load), generate new pair
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const exportedPrivate = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
    );
    const exportedPublic = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );

    await saveToDB("privateKey", exportedPrivate);
    await saveToDB("publicKey", exportedPublic);

    return keyPair;
}

export async function importPrivateKey(data) {
    return crypto.subtle.importKey(
        "pkcs8",
        data,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
    );
}

export async function importPublicKey(data) {
    return crypto.subtle.importKey(
        "spki",
        data,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
    );
}
