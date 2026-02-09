export async function generateAESKey() {
    return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptAES(aesKey, message) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(message);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encoded
    );

    return { encrypted, iv };
}

export async function decryptAES(aesKey, encrypted, iv) {
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encrypted
    );

    return new TextDecoder().decode(decrypted);
}
