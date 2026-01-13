import { getPrivateKeyFromIdb } from "./IndexDb";

export const getUserPrivateKey = async () => {
  try {
    const privateKey = await getPrivateKeyFromIdb();
    if (!privateKey) {
      console.log('Private key not found in IndexedDB');
      return null;
    }
    console.log('Successfully retrieved private key from IndexedDB');
    return privateKey;
  } catch (error) {
    console.error('Error getting user private key:', error);
    return null;
  }
};

// This function is now deprecated but kept for compatibility for now
export const checkKeyFilesExist = async () => {
  const key = await getPrivateKeyFromIdb();
  return !!key;
};