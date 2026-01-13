// passwordEncrypter.js



// Generate a new 256-bit AES-GCM key and return it as a CryptoKey
export async function generateAesKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
      tagLength: 128
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

// Derive a key from a password string using PBKDF2
export async function deriveKeyFromPassword(password, saltB64 = "default-salt-value") {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const salt = saltB64 === "default-salt-value" ? encoder.encode(saltB64) : Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export the CryptoKey to a Base64-encoded string (for storage or transmission)
export async function exportKeyToBase64(key) {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

// Import a Base64-encoded key string back into a CryptoKey
export async function importKeyFromBase64(base64Key) {
  const binary = atob(base64Key);
  const rawKey = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data using AES-GCM and return Base64 encoded ciphertext + IV
export async function encryptWithAesKey(plainText, cryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(plainText);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encoded
  );
  console.log("CryptoKey in encrypt" + cryptoKey);

  return {
    cipherText: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

// Decrypt Base64 encrypted data with AES-GCM
export async function decryptWithAesKey(cipherTextB64, ivB64, cryptoKey) {
  const encryptedData = Uint8Array.from(atob(cipherTextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  console.log(`cipherText : ${cipherTextB64} ivB64 : ${ivB64} cryptoKey : ${cryptoKey} `);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encryptedData
  );
  console.log("CryptoKey in decrypt" + cryptoKey);
  return new TextDecoder().decode(decrypted);
}
