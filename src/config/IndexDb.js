import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { decryptMessage } from './rasCrypto';
import { chatSecretKeyStore, publicKeyStore } from './ChatDropDownStores'; // Moving stores to a shared file to avoid circular dep
import { createStore } from 'idb-keyval';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
// Create directory handler store globally
export const directoryHandlerStore = createStore('directory-handler-store', 'directory-handler');

export const storeSecretChatKeyInIdb = async (username, partnerName, encryptedSecretKey1, storeName) => {
  const keyName = username + ':' + partnerName
  console.log("Storing in indexDb", partnerName, encryptedSecretKey1);
  await idbSet(keyName, encryptedSecretKey1, storeName);
};

export const getPublicKeyFromIdb = async (key) => {
  return await idbGet(key, publicKeyStore);
};

export const getChatKeyFromIdb = async (username, key) => {
  try {
    const keyName = username + ':' + key;
    const encryptedChatKey = await idbGet(keyName, chatSecretKeyStore);
    if (!encryptedChatKey) {
      console.warn(`No encrypted chat key found for ${keyName}`);
      return null;
    }

    const privateKey = await getPrivateKeyFromIdb();
    if (!privateKey) {
      console.error("Private key not available in IndexedDB.");
      return null;
    }

    try {
      const decryptedSecretKey = await decryptMessage(encryptedChatKey, privateKey);
      return decryptedSecretKey;
    } catch (decryptError) {
      console.error(`Failed to decrypt chat key for ${keyName}.`, decryptError);
      await idbDel(keyName, chatSecretKeyStore);
      return null;
    }
  } catch (error) {
    console.error(`Error getting chat key from IndexDB for ${username}:${key}:`, error);
    return null;
  }
};

export const setPrivateKeyInIdb = async (privateKey) => {
  try {
    await idbSet('user-private-key', privateKey, directoryHandlerStore);
    console.log('Private key stored in IndexedDB');
  } catch (error) {
    console.error("Error storing private key in IndexedDB", error);
  }
};

export const getPrivateKeyFromIdb = async () => {
  try {
    return await idbGet('user-private-key', directoryHandlerStore);
  } catch (err) {
    console.warn('Error retrieving private key from IndexedDB', err);
    return null;
  }
};