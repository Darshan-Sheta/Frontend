import React, { useEffect, useState, useCallback } from "react";
import Navigation from "../navigation/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";
import { FaSearch } from "react-icons/fa";
import { timeAgo } from "../../config/helper";
import PersonalChatChat from "../PersonalChat/PersonalChatChat";
import { useAuth } from "../../context/AuthContext";
import { generateBase64AesKey } from "../../config/secretKeyGenerator";
import { getOrCreateRSAKeys, importPublicKey } from "../../crypto/rsaKeys";
import { toBase64, fromBase64 } from "../../crypto/chatCrypto";
import { getFromDB, saveToDB } from "../../crypto/indexedDb";
const API_BASE = import.meta.env.VITE_API_BASE_URL;



function ChatDropDown() {
    const [personalChats, setPersonalChats] = useState([]);
    const [filteredPersonalChats, setFilteredPersonalChats] = useState([]);
    const [member2Id, setMember2Id] = useState("");
    const [member2Name, setMember2Name] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [personalChatOpen, setPersonalChatOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isKeySetupComplete, setIsKeySetupComplete] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, username, user } = useAuth(); // Get full user object
    const [keyFilesExist, setKeyFilesExist] = useState(true);





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
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
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

    // Function to setup chat keys (Simplified: only fetch partner public key)
    const setupChatKeys = async (partnerName, chatId) => {
        try {
            // Fetch public key from backend or DB
            let pkData = await getFromDB(`publicKey:${partnerName}`);
            if (!pkData) {
                const pkResp = await axios.get(`${API_BASE}/api/users/public_key/${partnerName}`, { withCredentials: true });
                if (!pkResp.data) throw new Error("Public key not found for partner");
                pkData = pkResp.data;
                await saveToDB(`publicKey:${partnerName}`, pkData);
            }
            console.log("Chat setup completed (Partner key available)");
        } catch (err) {
            console.error("Error setting up chat key:", err);
            throw err;
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
        // First try to get from current user context if it matches
        if (user && user.username === username && user.rsaPublicKey) {
            localStorage.setItem("rsaPublicKey", user.rsaPublicKey);
            return user.rsaPublicKey;
        }

        // Fallback to fetching
        try {
            const response = await fetch(`${API_BASE}/api/users/public_key/${username}`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const publicKey = await response.text();
                // Only cache if it's our own key
                if (user && user.username === username) {
                    localStorage.setItem("rsaPublicKey", publicKey);
                }
                return publicKey;
            } else {
                console.error("Public key not found in backend");
                return null;
            }
        } catch (error) {
            console.error("Error fetching public key:", error);
            return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">
                    Loading Personal Chats...
                </div>
            </div>
        );
    }


    const handleResetKeys = async () => {
        if (!confirm("⚠️ RESET SECURE CHAT?\n\nThis will DELETE your local keys. You will need to Setup/Unlock again.\n\nUse this ONLY if you are stuck.")) return;
        try {
            // Clear new secure-chat-db
            const deleteReq = indexedDB.deleteDatabase("secure-chat-db");
            deleteReq.onsuccess = () => {
                localStorage.removeItem("rsaPublicKey");
                alert("Keys Reset! Reloading...");
                window.location.reload();
            };
            deleteReq.onerror = () => {
                throw new Error("Could not delete IndexedDB");
            };
        } catch (e) {
            console.error("Reset failed:", e);
            alert("Reset failed: " + e.message);
        }
    };

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <div className="fixed top-0 left-0 w-full z-50">
                <Navigation />
            </div>
            <div className="flex flex-1 pt-24 pb-4 px-4 container mx-auto overflow-hidden">
                <div className="w-1/4 flex flex-col h-full pr-4">
                    <div className="glass-card h-full flex flex-col overflow-hidden rounded-2xl">
                        <div className="p-4">
                            <div className="flex items-center bg-white/50 border border-border px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <FaSearch className="text-text-muted mr-2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="bg-transparent outline-none text-text-main w-full placeholder-text-muted/50"
                                    placeholder="Search chats..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2 overflow-y-auto flex-1 p-2 custom-scrollbar">
                            {filteredPersonalChats.length > 0 ? (
                                filteredPersonalChats.map((personalChat) => (
                                    <div
                                        key={personalChat.id}
                                        className={`p-3 rounded-xl flex items-center cursor-pointer transition-all border ${member2Id === personalChat.id
                                            ? "bg-accent/10 border-accent/30"
                                            : "bg-white/30 border-transparent hover:bg-white/60 hover:shadow-sm"
                                            }`}
                                        onClick={() => handlePersonalChatClick(personalChat.githubUserName, personalChat.id)}
                                    >
                                        <img
                                            src={`https://github.com/${personalChat.githubUserName}.png`}
                                            alt={personalChat.githubUserName}
                                            className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <h3 className={`text-sm font-bold ${member2Id === personalChat.id ? "text-accent" : "text-text-main"}`}>
                                                {personalChat.githubUserName}
                                            </h3>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-text-muted text-center py-4">No Personal Chats found.</p>
                            )}
                        </div>


                    </div>
                </div>
                <div className="w-3/4 h-full pl-2">
                    <div className={`glass-card h-full rounded-2xl overflow-hidden relative ${personalChatOpen ? 'w-full' : 'flex flex-col items-center justify-center text-center'}`}>
                        {personalChatOpen ? (
                            <PersonalChatChat
                                memberId={member2Id}
                                memberName={member2Name}
                                isKeySetupComplete={isKeySetupComplete} // Pass key setup status
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
                                <div className="relative z-10 p-10">
                                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-4xl">💬</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-main mb-2">Select a Conversation</h3>
                                    <p className="text-text-muted">Choose a chat from the sidebar to start messaging securely.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatDropDown;