
import axios from 'axios';
import { deriveKeyFromPassword, encryptWithAesKey, decryptWithAesKey, exportKeyToBase64, importKeyFromBase64, generateAesKey } from '../config/passwordEncrypt';
import { getOrCreateRSAKeys, importPrivateKey, importPublicKey } from '../crypto/rsaKeys';
import { saveToDB, getFromDB } from '../crypto/indexedDb';
import { toBase64, fromBase64 } from '../crypto/chatCrypto';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const KeyBackupService = {
    /**
     * Backs up the local private key to the server, encrypted with the user's password.
     * @param {string} username 
     * @param {string} password 
     */
    async backupKey(username, password) {
        try {
            console.log('🛡️ Starting key backup process...');

            // 1. Get local private key
            const privateKeyPem = await getFromDB("privateKey");
            if (!privateKeyPem) {
                console.warn('⚠️ No private key found in local storage to backup.');
                return;
            }

            // 2. Derive key from password
            const passwordKey = await deriveKeyFromPassword(password, username); // Use username as salt
            // console.log('🔑 Derived encryption key from password');

            // 3. Encrypt the private key PEM
            const privateKeyStr = toBase64(privateKeyPem); // PEM is already binary-ish, but let's base64 it for safety
            const { cipherText, iv } = await encryptWithAesKey(privateKeyStr, passwordKey);
            // console.log('🔒 Encrypted private key');

            // 4. Send to server
            await axios.post(`${API_BASE}/api/users/update_private_key`, {
                username,
                encryptedPrivateKey: cipherText,
                privateKeyIv: iv
            }, { withCredentials: true });

            console.log('✅ Private key backed up successfully to server.');
        } catch (error) {
            console.error('❌ Key backup failed:', error);
        }
    },

    /**
     * Restores the private key from the server using the user's password.
     * @param {string} username 
     * @param {string} password 
     * @param {string} encryptedPrivateKey 
     * @param {string} iv 
     */
    async restoreKey(username, password, encryptedPrivateKey, iv, publicKeyB64 = null) {
        try {
            console.log('♻️ Starting key restoration process...');

            // 1. Derive key from password
            const passwordKey = await deriveKeyFromPassword(password, username);

            // 2. Decrypt the private key
            const privateKeyB64 = await decryptWithAesKey(encryptedPrivateKey, iv, passwordKey);
            const privateKeyPem = fromBase64(privateKeyB64);

            // 3. Save to local IndexedDB
            await importPrivateKey(privateKeyPem); // Verify validity
            await saveToDB("privateKey", privateKeyPem);
            console.log('✅ Private key restored to local storage.');

            // 4. Restore Public Key if provided
            if (publicKeyB64) {
                const publicKeySpki = fromBase64(publicKeyB64);
                await importPublicKey(publicKeySpki); // Verify validity
                await saveToDB("publicKey", publicKeySpki);
                console.log('✅ Public key restored to local storage.');
            } else {
                console.warn('⚠️ Public key not provided during restore. System may regenerate keys if not handled carefully.');
            }

            return true;
        } catch (error) {
            console.error('❌ Key restoration failed:', error);
            return false;
        }
    },

    /**
     * Generates a random recovery code (e.g., "apple-river-house-sky")
     */
    generateRecoveryCode() {
        const words = [
            'apple', 'river', 'house', 'mountain', 'sky', 'blue', 'falcon', 'eagle', 'tiger', 'ocean',
            'forest', 'star', 'moon', 'sun', 'cloud', 'fire', 'earth', 'water', 'stone', 'tree',
            'flower', 'bird', 'horse', 'lion', 'book', 'code', 'key', 'lock', 'door', 'road',
            'path', 'walk', 'run', 'jump', 'swift', 'lazy', 'happy', 'brave', 'calm', 'wise',
            'delta', 'echo', 'alpha', 'omega', 'solar', 'lunar', 'orbit', 'galaxy', 'comet', 'planet'
        ];
        const code = [];
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            code.push(words[randomIndex]);
        }
        return code.join('-');
    },

    /**
     * Backs up the private key using the Recovery Code.
     */
    async backupWithRecoveryCode(username, recoveryCode) {
        try {
            console.log('🛡️ Backing up with Recovery Code...');
            const privateKeyPem = await getFromDB("privateKey");
            if (!privateKeyPem) return;

            // Use Recovery Code as the password
            const recoveryKey = await deriveKeyFromPassword(recoveryCode, username);
            const privateKeyStr = toBase64(privateKeyPem);
            const { cipherText, iv } = await encryptWithAesKey(privateKeyStr, recoveryKey);

            await axios.post(`${API_BASE}/api/users/update_recovery_key`, {
                username,
                encryptedRecoveryPrivateKey: cipherText,
                recoveryKeyIv: iv
            }, { withCredentials: true });

            console.log('✅ Recovery key backed up successfully.');
            return true;
        } catch (error) {
            console.error('❌ Recovery backup failed:', error);
            return false;
        }
    },

    /**
     * Restores private key using Recovery Code.
     */
    async restoreWithRecoveryCode(username, recoveryCode, encryptedRecoveryKey, iv, publicKeyB64 = null) {
        console.log('♻️ Restoring with Recovery Code...');
        // Reuse the logic from restoreKey since it's the same decryption process
        return this.restoreKey(username, recoveryCode, encryptedRecoveryKey, iv, publicKeyB64);
    }
};
