import React, { useEffect, useState, useCallback } from "react";
import Navigation from "../navigation/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import GradientBackground from "../background/GradientBackground";
import { timeAgo } from "../../config/helper";
import PersonalChatChat from "../PersonalChat/PersonalChatChat";
import { useAuth } from "../../context/AuthContext";
import { generateBase64AesKey } from "../../config/secretKeyGenerator";
import { set as idbSet, get as idbGet, createStore, clear as idbClear } from "idb-keyval";
import { getChatKeyFromIdb, storeSecretChatKeyInIdb, setDirectoryInIdb, getDirectoryFromIdb } from "../../config/IndexDb";
import { encryptMessage, decryptMessage } from "../../config/rasCrypto";
import { checkKeyFilesExist, privateKeyFileName, passwordFileName, getUserPrivateKey } from "../../config/fileFunctions";
import { exportKeyAsPem } from "../../config/pemutils";
import { encryptWithAesKey, exportKeyToBase64, generateAesKey } from "../../config/passwordEncrypt";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Create a dedicated IndexedDB store for public keys
const publicKeyStore = createStore("public-key", "documents");
const chatSecretKeyStore = createStore("chat-secret-key-store", "chat-secret-key");

function ChatDropDown() {
    const [personalChats, setPersonalChats] = useState([]);
    const [filteredPersonalChats, setFilteredPersonalChats] = useState([]);
    const [member2Id, setMember2Id] = useState("");
    const [member2Name, setMember2Name] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [personalChatOpen, setPersonalChatOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isKeySetupComplete, setIsKeySetupComplete] = useState(false); // New state to track key setup
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, username } = useAuth();
    const [directorySet, setDirectorySet] = useState(false);
    const [keyFilesExist, setKeyFilesExist] = useState(false);

    // Check if directory is set and key files exist when the component mounts
    const checkDirectory = async () => {
        console.log("checkDirectory called");
        const directory = await getDirectoryFromIdb();
        if (directory) {
            setDirectorySet(true);
            // Also check if key files exist
            const filesExist = await checkKeyFilesExist(directory);
            setKeyFilesExist(filesExist);
            if (!filesExist) {
                console.warn("Directory is set but key files are missing!");
            }
        } else {
            setDirectorySet(false);
            setKeyFilesExist(false);
        }
        setLoading(false);
    };

    // Run the check when the component mounts
    useEffect(() => {
        checkDirectory();
    }, []);

    // Function to handle directory selection on user action (e.g., button click)
    const handleSetDirectory = async () => {
        try {
            const baseDir = await window.showDirectoryPicker({ mode: "readwrite" });
            await setDirectoryInIdb(baseDir);
            setDirectorySet(true);
            // Check if key files exist in the selected directory
            const filesExist = await checkKeyFilesExist(baseDir);
            setKeyFilesExist(filesExist);
            if (!filesExist) {
                console.log("Directory selected, but key files are missing or empty");
            } else {
                console.log("Directory set successfully with key files:", baseDir);
            }
        } catch (error) {
            console.error("Error selecting directory:", error);
            if (error.name !== 'AbortError') {
                alert("Failed to select directory. Please try again.");
            }
        }
    };

    // Function to regenerate keys (WARNING: This will break old encrypted messages)
    const handleRegenerateKeys = async () => {
        if (!window.confirm(
            "⚠️ WARNING: Regenerating keys will make you unable to decrypt old encrypted messages!\n\n" +
            "Are you sure you want to regenerate keys? This action cannot be undone.\n\n" +
            "Only proceed if:\n" +
            "1. Your current key files are empty/corrupted\n" +
            "2. You don't need to access old encrypted messages\n" +
            "3. You understand you'll need to start fresh with new chats"
        )) {
            return;
        }

        try {
            const directory = await getDirectoryFromIdb();
            if (!directory) {
                alert("Please select a directory first!");
                return;
            }

            // Generate new RSA keypair
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

            // Export PEMs
            const publicPem = await exportKeyAsPem(keyPair.publicKey, 'PUBLIC');
            const privatePem = await exportKeyAsPem(keyPair.privateKey, 'PRIVATE');

            // Get current user data first to preserve it
            const userResponse = await fetch(`${API_BASE}/api/users/me`, {
                method: 'GET',
                credentials: 'include'
            });

            let userData = {};
            if (userResponse.ok) {
                userData = await userResponse.json();
            }

            // Update public key on backend (preserve existing user data)
            const response = await fetch(`${API_BASE}/api/users/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userId,
                    username: userData.username || username,
                    displayName: userData.displayName || username,
                    email: userData.email || '',
                    publicKey: publicPem
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update public key on server');
            }

            // Clear old encrypted chat keys from IndexedDB since they were encrypted with old public key
            try {
                await idbClear(chatSecretKeyStore);
                console.log('Cleared old encrypted chat keys from IndexedDB');
            } catch (clearError) {
                console.warn('Could not clear old chat keys:', clearError);
                // Continue anyway - the keys will fail to decrypt and be cleared on access
            }

            // Create directory structure if it doesn't exist
            const dataDir = await directory.getDirectoryHandle('data.codeamigoes', { create: true });
            const privDir = await dataDir.getDirectoryHandle('privateData', { create: true });

            // Generate AES key and encrypt private key
            const secretPassword = await generateAesKey();
            const exportedPassword = await exportKeyToBase64(secretPassword);
            const encryptedPrivateKey = await encryptWithAesKey(privatePem, secretPassword);

            // Write encrypted private key
            const privFH = await privDir.getFileHandle(privateKeyFileName, { create: true });
            const privW = await privFH.createWritable();
            await privW.write(JSON.stringify(encryptedPrivateKey, null, 2));
            await privW.close();

            // Write AES password
            const pwFH = await privDir.getFileHandle(passwordFileName, { create: true });
            const pwW = await pwFH.createWritable();
            await pwW.write(exportedPassword);
            await pwW.close();

            // Verify files were written
            const filesExist = await checkKeyFilesExist(directory);
            setKeyFilesExist(filesExist);

            if (filesExist) {
                alert("✅ Keys regenerated successfully! You can now use personal chat. Note: You won't be able to decrypt old messages.");
                // Refresh the page to reload everything
                window.location.reload();
            } else {
                throw new Error('Keys were written but verification failed');
            }
        } catch (error) {
            console.error("Error regenerating keys:", error);
            alert(`Failed to regenerate keys: ${error.message}`);
        }
    };

    // Initialize user and fetch chats
    useEffect(() => {
        const initialize = async () => {
            if (!username) {
                navigate("/");
                return;
            }
            setCurrentUserId(userId);

            if (userId) {
                try {
                    const response = await axios.get(`${API_BASE}/api/v1/personal_chat/all_personal_chats/${userId}`, {
                        withCredentials: true,
                    });
                    const sortedPersonalChat = response.data.sort((a, b) => {
                        const latestA = a.messages?.length ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
                        const latestB = b.messages?.length ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
                        return latestB - latestA;
                    });
                    setPersonalChats(sortedPersonalChat);
                    setFilteredPersonalChats(sortedPersonalChat);

                    // Process query parameter after chats are loaded
                    const queryParams = new URLSearchParams(location.search);
                    const leaderName = queryParams.get("leader");
                    if (leaderName && sortedPersonalChat.length > 0) {
                        const matchingChat = sortedPersonalChat.find(
                            (chat) => chat.githubUserName.toLowerCase() === leaderName.toLowerCase()
                        );
                        if (matchingChat) {
                            setMember2Id(matchingChat.id);
                            setMember2Name(matchingChat.githubUserName);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch personal chats:", error);
                }
            }
        };
        initialize();
    }, [navigate, location.search]);

    // Setup chat keys when member2Id and member2Name are set
    useEffect(() => {
        if (member2Id && member2Name) {
            setIsKeySetupComplete(false); // Reset before setup
            setupChatKeys(member2Name, member2Id).then(() => {
                setIsKeySetupComplete(true); // Mark as complete
            }).catch((err) => {
                console.error("Key setup failed:", err);
                setIsKeySetupComplete(false);
            });
        }
    }, [member2Id, member2Name]);

    // Open chat when member2Id and member2Name are set
    useEffect(() => {
        if (member2Id && member2Name) {
            setPersonalChatOpen(true);
        }
    }, [member2Id, member2Name]);

    // Function to setup chat keys
    const setupChatKeys = async (partnerName, chatId) => {
        try {
            let publicKeyPem = await idbGet(partnerName, publicKeyStore);
            let pkResp;
            if (!publicKeyPem) {
                pkResp = await axios.get(`${API_BASE}/api/users/public_key/${partnerName}`, { withCredentials: true });
                if (!pkResp.data) throw new Error("Public key not found for partner");
                await idbSet(partnerName, pkResp.data, publicKeyStore);
            }
            console.log("Fetched public key for chat setup");
            let secretB64;
            let chatSecretKey = await getChatKeyFromIdb(username, partnerName, chatSecretKeyStore);
            console.log("Called getChatKey from Idb", chatSecretKey);

            if (!chatSecretKey) {
                const getRes = await axios.get(`${API_BASE}/api/secret_key/${chatId}/${userId}/`, {
                    withCredentials: true,
                    validateStatus: (s) => s < 500,
                });
                if (getRes.status === 200 && getRes.data) {
                    // Try to decrypt the key from backend to verify it works with current private key
                    try {
                        const privateKey = await getUserPrivateKey();
                        if (privateKey) {
                            const decryptedKey = await decryptMessage(getRes.data, privateKey);
                            // If decryption succeeds, store it
                            secretB64 = decryptedKey;
                            await storeSecretChatKeyInIdb(username, partnerName, getRes.data, chatSecretKeyStore);
                            console.log("Successfully decrypted and stored chat key from backend");
                        } else {
                            throw new Error("Private key not available");
                        }
                    } catch (decryptError) {
                        // If decryption fails, the key was encrypted with old public key
                        // Create a new key instead
                        console.warn("Backend key cannot be decrypted (likely encrypted with old key). Creating new key.", decryptError);
                        secretB64 = await generateBase64AesKey();
                        const encryptedSecretKey = await encryptMessage(secretB64, pkResp?.data || publicKeyPem);
                        const publicKey = await getPublicKey(username, API_BASE);
                        const encryptedSecretKey1 = await encryptMessage(secretB64, publicKey);
                        await axios.post(
                            `${API_BASE}/api/secret_key/${chatId}/${userId}/`,
                            { secretKey: encryptedSecretKey, secretKey1: encryptedSecretKey1 },
                            { headers: { "Content-Type": "application/json" }, withCredentials: true }
                        );
                        await storeSecretChatKeyInIdb(username, partnerName, encryptedSecretKey1, chatSecretKeyStore);
                    }
                } else {
                    // No key in backend, create new one
                    secretB64 = await generateBase64AesKey();
                    const encryptedSecretKey = await encryptMessage(secretB64, pkResp?.data || publicKeyPem);
                    const publicKey = await getPublicKey(username, API_BASE);
                    const encryptedSecretKey1 = await encryptMessage(secretB64, publicKey);
                    await axios.post(
                        `${API_BASE}/api/secret_key/${chatId}/${userId}/`,
                        { secretKey: encryptedSecretKey, secretKey1: encryptedSecretKey1 },
                        { headers: { "Content-Type": "application/json" }, withCredentials: true }
                    );
                    await storeSecretChatKeyInIdb(username, partnerName, encryptedSecretKey1, chatSecretKeyStore);
                }
            }
            console.log("Chat keys setup completed");
        } catch (err) {
            console.error("Error setting up chat key:", err);
            throw err; // Re-throw to handle in useEffect
        }
    };

    // Handler for selecting a chat from the dropdown
    const handlePersonalChatClick = async (partnerName, chatId) => {
        setMember2Id(chatId);
        setMember2Name(partnerName);
        // setupChatKeys will be called via useEffect
    };

    const debouncedSearch = useCallback(
        debounce((query) => {
            const filteredChats = personalChats.filter((chat) =>
                chat.githubUserName.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredPersonalChats(filteredChats);
        }, 300),
        [personalChats]
    );

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        debouncedSearch(event.target.value);
    };

    const getPublicKey = async (username, API_BASE) => {
        let publicKey = localStorage.getItem("rsaPublicKey");
        if (!publicKey) {
            try {
                const response = await fetch(`${API_BASE}/api/users/public_key/${username}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    publicKey = await response.text();
                    localStorage.setItem("rsaPublicKey", publicKey);
                } else {
                    console.error("Public key not found in backend");
                    return null;
                }
            } catch (error) {
                console.error("Error fetching public key:", error);
                return null;
            }
        }
        return publicKey;
    };

    if (loading) {
        return (
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center text-white">
                    <div className="animate-pulse text-2xl">
                        Loading Personal Chats...
                    </div>
                </div>
            </GradientBackground>
        );
    }

    // Render the directory selection prompt if directory is not set or key files are missing
    if (!directorySet || !keyFilesExist) {
        return (
            <GradientBackground>
                <div className="flex flex-col h-screen text-white justify-center items-center px-4">
                    <div className="fixed top-0 left-0 w-full z-50">
                        <Navigation />
                    </div>
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-semibold mb-3">
                            {!directorySet ? "Set Your Directory to Continue" : "Key Files Missing"}
                        </h2>
                        {!directorySet ? (
                            <>
                                <p className="text-lg mb-4 leading-relaxed">
                                    <strong>Important:</strong> Aapne registration ke time jo directory select ki thi, wahi directory select karein.
                                    Us directory mein automatically <code className="bg-gray-700 px-1 rounded">data.codeamigoes</code> folder create hua hoga.
                                </p>
                                <p className="text-sm text-gray-300 mb-4">
                                    <span className="font-medium">Example:</span> Agar aapne registration ke time <code className="bg-gray-700 px-1 rounded">Documents</code> folder select kiya tha,
                                    to ab bhi wahi <code className="bg-gray-700 px-1 rounded">Documents</code> folder select karein.
                                    Usmein <code className="bg-gray-700 px-1 rounded">data.codeamigoes</code> folder automatically hoga.
                                </p>
                                <p className="text-sm text-blue-300 mb-6">
                                    <strong>Note:</strong> Aapko manually kuch bhi create karne ki zarurat nahi hai.
                                    Bas wahi directory select karein jahan aapne registration ke time select ki thi.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg mb-4 leading-relaxed text-red-300">
                                    Directory set hai, lekin key files missing ya empty hain. Yeh files zaroori hain:
                                </p>
                                <ul className="text-sm text-gray-300 mb-4 text-left list-disc list-inside space-y-2 bg-gray-800 p-4 rounded">
                                    <li><code className="bg-gray-700 px-1 rounded">data.codeamigoes/privateData/rsaPrivateEncryptedKey.json</code></li>
                                    <li><code className="bg-gray-700 px-1 rounded">data.codeamigoes/privateData/aesPassword.key</code></li>
                                </ul>
                                <div className="text-sm text-yellow-300 mb-4 bg-yellow-900 bg-opacity-30 p-3 rounded">
                                    <p className="font-semibold mb-2">Possible Issues:</p>
                                    <ul className="list-disc list-inside space-y-1 text-left">
                                        <li>Files empty ya corrupt ho gayi hain</li>
                                        <li>Registration process incomplete rahi</li>
                                        <li>Galat directory select ki hai</li>
                                    </ul>
                                </div>
                                <div className="text-sm text-yellow-300 mb-4 bg-red-900 bg-opacity-30 p-3 rounded border border-red-500">
                                    <p className="font-semibold mb-2 text-red-300">⚠️ Important Warning:</p>
                                    <p className="mb-2">
                                        Agar aap keys regenerate karte hain, to aap purane encrypted messages decrypt nahi kar sakte.
                                    </p>
                                    <p>
                                        Sirf tab regenerate karein jab aapke paas old messages access karne ki zarurat nahi hai.
                                    </p>
                                </div>
                                <div className="flex gap-4 justify-center mb-4">
                                    <button
                                        onClick={handleRegenerateKeys}
                                        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-semibold transition-colors transform hover:scale-105 duration-200 shadow-lg"
                                    >
                                        🔑 Regenerate Keys
                                    </button>
                                    <button
                                        onClick={handleSetDirectory}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors transform hover:scale-105 duration-200 shadow-lg"
                                    >
                                        📁 Reselect Directory
                                    </button>
                                </div>
                                <p className="text-sm text-yellow-300 mb-2">
                                    <strong>Alternative:</strong> Agar aapko old messages access chahiye, to support se contact karein.
                                </p>
                                <p className="text-sm text-yellow-300 mb-6">
                                    Contact: <a href="mailto:codeamigoes7@gmail.com" className="underline hover:text-yellow-200">codeamigoes7@gmail.com</a> for assistance.
                                </p>
                            </>
                        )}
                        <button
                            onClick={handleSetDirectory}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors transform hover:scale-105 duration-200 shadow-lg"
                        >
                            {!directorySet ? "Select Directory" : "Reselect Directory"}
                        </button>
                    </div>
                </div>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <div className="flex flex-col h-screen text-white">
                <div className="fixed top-0 left-0 w-full z-50">
                    <Navigation />
                </div>
                <div className="flex flex-1 pt-20">
                    <div className="w-1/4 p-4 border-r bg-gray-900 border-gray-700 h-[calc(100vh-4rem)]">
                        <div className="mb-4 flex items-center bg-gray-800 px-3 py-2 rounded-lg">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="bg-transparent outline-none text-white w-full"
                                placeholder="Search chats..."
                            />
                        </div>
                        <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                            {filteredPersonalChats.length > 0 ? (
                                filteredPersonalChats.map((personalChat) => (
                                    <div
                                        key={personalChat.id}
                                        className="p-3 bg-gray-700 shadow-lg rounded-lg flex items-center cursor-pointer hover:bg-gray-600 transition-all"
                                        onClick={() => handlePersonalChatClick(personalChat.githubUserName, personalChat.id)}
                                    >
                                        <img
                                            src={`https://github.com/${personalChat.githubUserName}.png`}
                                            alt={personalChat.githubUserName}
                                            className="w-12 h-12 rounded-full object-cover mr-3"
                                        />
                                        <div>
                                            <h3 className="text-md font-bold text-gray-200">{personalChat.githubUserName}</h3>
                                            <div className="text-sm text-gray-400"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No Personal Chats found.</p>
                            )}
                        </div>
                    </div>
                    <div className="w-3/4 flex flex-col h-[calc(100vh-4rem)] text-center overflow-hidden justify-center">
                        {personalChatOpen ? (
                            <PersonalChatChat
                                memberId={member2Id}
                                memberName={member2Name}
                                isKeySetupComplete={isKeySetupComplete} // Pass key setup status
                            />
                        ) : (
                            <p className="text-lg text-gray-500">Select a Personal chat to continue</p>
                        )}
                    </div>
                </div>
            </div>
        </GradientBackground>
    );
}

export { publicKeyStore, chatSecretKeyStore };
export default ChatDropDown;