import { getPrivateKeyFromIdb, setPrivateKeyInIdb } from "./IndexDb";
import { exportKeyAsPem } from "./pemutils";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Ensures that the browser has a persistent RSA keypair.
 * If keys exist in IndexedDB, returns them.
 * If not, generates them, stores them, and registers the public key with the backend.
 */
export async function ensureBrowserKeys(username) {
    try {
        console.log("🔐 Checking for browser-level E2EE keys...");

        // 1. Check IndexedDB for existing private key
        let privatePem = await getPrivateKeyFromIdb();
        let publicPem = localStorage.getItem("rsaPublicKey");

        if (privatePem && publicPem) {
            console.log("✅ Existing keys found in browser.");
            return { privatePem, publicPem };
        }

        console.warn("⚠️ Keys missing in browser. Generating once-per-browser keys...");

        // 2. Generate new RSA key pair (Generate only once per browser lifetime)
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256'
            },
            true,
            ['encrypt', 'decrypt']
        );

        // 3. Export to PEM format
        publicPem = await exportKeyAsPem(keyPair.publicKey, 'PUBLIC');
        privatePem = await exportKeyAsPem(keyPair.privateKey, 'PRIVATE');

        // 4. Store Public Key in localStorage (for quick access)
        localStorage.setItem("rsaPublicKey", publicPem);

        // 5. Store Private Key in IndexedDB (securely persistent across logout)
        await setPrivateKeyInIdb(privatePem);

        // 6. Register Public Key with Backend
        // This ensures the backend always has the latest public key for this browser session.
        if (username) {
            console.log("📡 Registering new public key with backend...");
            await registerPublicKeyWithBackend(username, publicPem);
        }

        console.log("✅ New browser keys generated and stored.");
        return { privatePem, publicPem };
    } catch (error) {
        console.error("❌ Failed to ensure browser keys:", error);
        throw error;
    }
}

/**
 * Registers the public key with the backend server.
 */
async function registerPublicKeyWithBackend(username, publicKey) {
    try {
        const response = await fetch(`${API_BASE}/api/users/update_public_key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, publicKey })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn("Could not update public key on server:", errorText);
            // We don't throw here to allow local operation, 
            // but in a real app, you might want more robust error handling.
        }
    } catch (err) {
        console.error("Network error updating public key:", err);
    }
}

/**
 * Robustly converts an ArrayBuffer to a Base64 string.
 * Uses a chunked approach to avoid "Maximum call stack size exceeded".
 */
export function arrayBufferToBase64Robust(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const len = bytes.byteLength;
    const chunkSize = 0x8000; // 32KB chunks

    for (let i = 0; i < len; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, len)));
    }
    return btoa(binary);
}

/**
 * Robustly converts a Base64 string to an ArrayBuffer.
 */
export function base64ToArrayBufferRobust(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
