import { getDirectoryFromIdb } from "./IndexDb";
import { decryptWithAesKey, importKeyFromBase64 } from "./passwordEncrypt";

export const privateKeyFileName = "rsaPrivateEncryptedKey.json";
export const passwordFileName = "aesPassword.key";

export const getUserPrivateKey = async () => {
  try {
    const directory = await getDirectoryFromIdb();
    if (!directory) {
      console.log('Please select a directory first');
      return null;
    }
    console.log(`directory: ${directory}`);
    const encryptedPrivateKey1 = await getContentFromFile(directory, privateKeyFileName);
    
    if (!encryptedPrivateKey1 || encryptedPrivateKey1.trim().length === 0) {
      console.error(`Failed to load ${privateKeyFileName}. File not found, empty, or cannot be read.`);
      console.error(`File content: "${encryptedPrivateKey1}" (length: ${encryptedPrivateKey1?.length || 0})`);
      return null;
    }
    
    console.log(`encryptedPrivateKey: ${encryptedPrivateKey1}`);
    
    let encryptedPrivateKey;
    try {
      encryptedPrivateKey = JSON.parse(encryptedPrivateKey1);
    } catch (parseError) {
      console.error(`Failed to parse ${privateKeyFileName}:`, parseError);
      return null;
    }
    
    const passwordBase64 = await getContentFromFile(directory, passwordFileName);
    
    if (!passwordBase64 || passwordBase64.trim().length === 0) {
      console.error(`Failed to load ${passwordFileName}. File not found, empty, or cannot be read.`);
      console.error(`File content: "${passwordBase64}" (length: ${passwordBase64?.length || 0})`);
      return null;
    }
    
    // Import the Base64-encoded AES key as a CryptoKey
    const aesKey = await importKeyFromBase64(passwordBase64);

    const decryptedPrivateKey = await decryptWithAesKey(
      encryptedPrivateKey.cipherText,
      encryptedPrivateKey.iv,
      aesKey
    );

    console.log(`decryptedPrivateKey: ${decryptedPrivateKey}`);
    return decryptedPrivateKey;
  } catch (error) {
    console.error('Error getting user private key:', error);
    return null;
  }
};

// Check if key files exist and are not empty in the directory
export const checkKeyFilesExist = async (baseHandle) => {
  try {
    // Try to access the directory structure (without creating)
    const dataDir = await baseHandle.getDirectoryHandle('data.codeamigoes');
    const privDir = await dataDir.getDirectoryHandle('privateData');
    
    // Check if both files exist and are not empty
    try {
      const keyFileHandle = await privDir.getFileHandle(privateKeyFileName);
      const passwordFileHandle = await privDir.getFileHandle(passwordFileName);
      
      // Check file sizes
      const keyFile = await keyFileHandle.getFile();
      const passwordFile = await passwordFileHandle.getFile();
      
      if (keyFile.size === 0 || passwordFile.size === 0) {
        console.error('Key files exist but are empty!');
        console.error(`${privateKeyFileName} size: ${keyFile.size} bytes`);
        console.error(`${passwordFileName} size: ${passwordFile.size} bytes`);
        return false;
      }
      
      return true;
    } catch (fileErr) {
      console.error('Key files not found in directory structure:', fileErr);
      return false;
    }
  } catch (err) {
    // Directory structure doesn't exist
    console.error('Directory structure (data.codeamigoes/privateData) not found:', err);
    return false;
  }
};

const getContentFromFile = async (baseHandle, fileName) => {
  try {
    const dataDir = await baseHandle.getDirectoryHandle('data.codeamigoes');
    const privDir = await dataDir.getDirectoryHandle('privateData');
    const fileHandle = await privDir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    
    // Check file size
    if (file.size === 0) {
      console.error(`File ${fileName} is empty (size: 0 bytes)`);
      return null;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder();
    const text = decoder.decode(arrayBuffer);
    
    // Check if text is empty or just whitespace
    if (!text || text.trim().length === 0) {
      console.error(`File ${fileName} exists but content is empty`);
      return null;
    }
    
    console.log(`Extracted text from ${fileName}: ${text.substring(0, 50)}... (length: ${text.length})`);
    return text;
  } catch (err) {
    console.error(`Loading wrapped key failed for ${fileName}:`, err);
    return null; // Return null instead of undefined
  }
};