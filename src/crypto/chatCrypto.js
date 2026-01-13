import { generateAESKey, encryptAES, decryptAES } from "./aesCrypto";

/* Utils */
export const toBase64 = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)));

export const fromBase64 = (b64) => {
    // Strip PEM headers and whitespace if present
    const cleanB64 = b64
        .replace(/-----BEGIN.*?-----/g, '')
        .replace(/-----END.*?-----/g, '')
        .replace(/\s/g, '');
    return Uint8Array.from(atob(cleanB64), (c) => c.charCodeAt(0)).buffer;
};

/* Encrypt message for receiver (and optionally sender) */
export async function encryptChatMessage(message, receiverPublicKey, senderPublicKey = null) {
    const aesKey = await generateAESKey();

    const { encrypted, iv } = await encryptAES(aesKey, message);

    const rawAESKey = await crypto.subtle.exportKey("raw", aesKey);

    const encryptedAESKey = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        receiverPublicKey,
        rawAESKey
    );

    let encryptedAESKeySender = null;
    if (senderPublicKey) {
        const encryptedRawSender = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            senderPublicKey,
            rawAESKey
        );
        encryptedAESKeySender = toBase64(encryptedRawSender);
    }

    return {
        encryptedMessage: toBase64(encrypted),
        encryptedAESKey: toBase64(encryptedAESKey),
        encryptedAESKeySender,
        iv: toBase64(iv),
    };
}

/* Decrypt message (receiver or sender side) */
export async function decryptChatMessage(payload, privateKey) {
    const encryptedMessage = fromBase64(payload.encryptedMessage);
    const iv = new Uint8Array(fromBase64(payload.iv));

    let rawAESKey;
    try {
        // Try receiver key first
        const encryptedAESKey = fromBase64(payload.encryptedAESKey);
        rawAESKey = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedAESKey
        );
    } catch (err) {
        // If receiver key fails, try sender key if available
        if (payload.encryptedAESKeySender) {
            const encryptedAESKeySender = fromBase64(payload.encryptedAESKeySender);
            rawAESKey = await crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encryptedAESKeySender
            );
        } else {
            throw err;
        }
    }

    const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAESKey,
        "AES-GCM",
        true,
        ["decrypt"]
    );

    return decryptAES(aesKey, encryptedMessage, iv);
}
