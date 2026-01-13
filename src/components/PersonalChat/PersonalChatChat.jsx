import React, { useState, useEffect, useRef } from "react";
import { MdAttachFile, MdSend, MdEmojiEmotions } from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import { baseURL } from "../../config/AxiosHelper";
import { timeAgo } from "../../config/helper";
import { toast } from "react-toastify";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../../context/AuthContext";
import { getOrCreateRSAKeys, importPublicKey } from "../../crypto/rsaKeys";
import { encryptChatMessage, decryptChatMessage, fromBase64, toBase64 } from "../../crypto/chatCrypto";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Old AES helpers removed

const PersonalChatChat = ({ memberId, memberName, isKeySetupComplete }) => {
  const { username, userId } = useAuth();
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [member2Id, setMember2Id] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [keys, setKeys] = useState({ privateKey: null, publicKey: null });
  const [partnerPubKey, setPartnerPubKey] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const stompClientRef = useRef(null);
  const messageInputRef = useRef(null); // Ref for the message input field
  const navigate = useNavigate();

  // Initialize user and member IDs
  useEffect(() => {
    setCurrentUser(username);
    setCurrentUserId(userId);
    setMember2Id(memberId);
  }, [memberId, username, userId]);

  // Check if all required data is ready
  useEffect(() => {
    if (currentUserId && member2Id && memberName && isKeySetupComplete) {
      setIsReady(true);
    } else {
      setIsReady(false);
      console.log('Waiting for data:', { currentUserId, member2Id, memberName, isKeySetupComplete });
    }
  }, [currentUserId, member2Id, memberName, isKeySetupComplete]);

  // Focus the input field when the chat opens
  useEffect(() => {
    if (isReady && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isReady]);

  // Redirect if no chat target
  useEffect(() => {
    if (!member2Id) navigate("/dashboard/chat");
  }, [member2Id, navigate]);

  // Fetch and decrypt past messages when ready
  useEffect(() => {
    if (!isReady) return;

    let isMounted = true;
    const sortedChatId = [currentUserId, member2Id].sort().join("/");
    console.log("Fetch messages called");

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const myKeys = await getOrCreateRSAKeys();
        setKeys(myKeys);

        // Fetch partner's public key
        // Fetch partner's public key
        // First try API
        let partnerKeyData = null;
        try {
          // Add timestamp to prevent caching
          const pkResp = await axios.get(`${API_BASE}/api/users/public_key/${memberName}?t=${Date.now()}`, { withCredentials: true });
          if (pkResp.data) {
            partnerKeyData = pkResp.data;
            // Update IDB with fresh key to prevent stale cache issues
            const { saveToDB } = await import("../../crypto/indexedDb");
            await saveToDB(`publicKey:${memberName}`, partnerKeyData);
            console.log("✅ Partner public key refreshed from server and cached.");
          }
        } catch (apiErr) {
          console.warn("API Public key fetch failed, trying DB...", apiErr);
        }

        // Fallback to IDB (populated by ChatDropDown or previous fetch)
        if (!partnerKeyData) {
          const { getFromDB } = await import("../../crypto/indexedDb");
          partnerKeyData = await getFromDB(`publicKey:${memberName}`);
          console.log("⚠️ Loaded partner public key from local cache (offline mode).");
        }

        if (partnerKeyData) {
          const importedPk = await importPublicKey(fromBase64(partnerKeyData));
          setPartnerPubKey(importedPk);
        } else {
          console.error("Partner public key not found anywhere.");
          toast.error("Could not load encryption keys for this user.");
        }

        const { data } = await axios.get(
          `${API_BASE}/api/v1/personal_chat/all_messages/${sortedChatId}`,
          { withCredentials: true }
        );

        if (Array.isArray(data)) {
          const decrypted = await Promise.all(
            data.map(async (msg) => {
              if (typeof msg.content !== 'string') return { ...msg, content: '[Invalid]' };
              try {
                // Try to parse the content as JSON payload
                const payload = JSON.parse(msg.content);
                const text = await decryptChatMessage(payload, myKeys.privateKey);
                return { ...msg, content: text };
              } catch (err) {
                console.warn("Decryption failed for msg", err);
                return { ...msg, content: '[Decryption Failed]' };
              }
            })
          );
          isMounted && setMessages(decrypted);
        } else {
          isMounted && setMessages([]);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
        isMounted && setMessages([]);
        toast.error('Failed to load messages');
      } finally {
        isMounted && setLoading(false);
      }
    };

    fetchMessages();
    return () => { isMounted = false; };
  }, [isReady, currentUserId, member2Id, memberName, retryTrigger]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // State for connection status
  const [isConnected, setIsConnected] = useState(false);

  // Setup WebSocket for live messages
  useEffect(() => {
    if (!currentUserId || !member2Id) return;
    let isMounted = true;
    const sortedChatId = [currentUserId, member2Id].sort().join("/");    // Use full absolute URL for SockJS
    const socketUrl = `${API_BASE}/api/v1/chat`;
    console.log("Connecting to WebSocket at:", socketUrl);
    const socket = new SockJS(socketUrl);
    const client = Stomp.over(() => socket, {
      reconnectDelay: 5000, // Enable auto-reconnect with 5-second delay
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.connect({}, () => {
      console.log("WebSocket connected successfully");
      stompClientRef.current = client;
      isMounted && setIsConnected(true); // Update status
      client.subscribe(
        `/api/v1/topic/personal_chat/${sortedChatId}`,
        async (frame) => {
          if (!isMounted) return;
          const newMsg = JSON.parse(frame.body);
          try {
            if (keys.privateKey) {
              const payload = JSON.parse(newMsg.content);
              newMsg.content = await decryptChatMessage(payload, keys.privateKey);
            } else {
              newMsg.content = '[Decryption Failed - Private Key Missing]';
            }
          } catch (err) {
            console.error("Decryption error in WebSocket:", err);
            newMsg.content = '[Decryption Failed]';
          }

          // Check for duplicates (same sender, same timestamp within 1 second)
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) =>
                msg.sender === newMsg.sender &&
                msg.content === newMsg.content &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 1000
            );

            if (isDuplicate) {
              console.log("Duplicate message detected, skipping");
              return prev;
            }

            return [...prev, newMsg];
          });
        }
      );
    }, (error) => {
      console.error("WebSocket connection error:", error);
      isMounted && setIsConnected(false);
    });

    return () => {
      isMounted = false;
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [currentUserId, member2Id, memberName, keys.privateKey]); // Added keys.privateKey dependancy to ensure decryption uses loaded key

  // Send a message
  const sendMessage = async () => {
    // alert("Send Clicked!"); // Debug trigger
    if (!input.trim()) return;

    if (!isConnected || !stompClientRef.current) {
      alert("Error: Chat is NOT connected to server.");
      return;
    }

    try {
      // JIT Key Loading: Ensure keys are present even if state is stale
      let currentPartnerKey = partnerPubKey;
      let currentMyKeys = keys;

      if (!currentPartnerKey) {
        console.warn("⚠️ Partner key missing in state. Attempting JIT load...");
        // Try loading from IDB
        const { getFromDB } = await import("../../crypto/indexedDb");
        const rawKey = await getFromDB(`publicKey:${memberName}`);
        if (rawKey) {
          currentPartnerKey = await importPublicKey(fromBase64(rawKey));
          setPartnerPubKey(currentPartnerKey); // Update state for next time
          console.log("✅ JIT Partner key loaded from DB.");
        } else {
          // Try fetching from API as last resort
          try {
            const { data } = await axios.get(`${API_BASE}/api/users/public_key/${memberName}`, { withCredentials: true });
            if (data) {
              currentPartnerKey = await importPublicKey(fromBase64(data));
              setPartnerPubKey(currentPartnerKey);
              console.log("✅ JIT Partner key loaded from API.");
              // Also save to DB for consistency
              const { saveToDB } = await import("../../crypto/indexedDb");
              await saveToDB(`publicKey:${memberName}`, data);
            }
          } catch (e) { console.error("JIT API fetch failed", e); }
        }
      }

      if (!currentPartnerKey) {
        console.error("❌ Partner public key Missing after JIT.");
        toast.error(`Cannot send: Public key for ${memberName} not found.`);
        return;
      }

      if (!currentMyKeys.privateKey || !currentMyKeys.publicKey) {
        console.warn("⚠️ My keys missing in state. Refreshing...");
        currentMyKeys = await getOrCreateRSAKeys();
        setKeys(currentMyKeys);
      }

      console.log("🔒 Encrypting message...", { hasPartnerKey: !!currentPartnerKey, hasMyKey: !!currentMyKeys.privateKey });
      const messageText = input.trim();

      const payload = await encryptChatMessage(messageText, currentPartnerKey, currentMyKeys.publicKey);
      const encryptedStr = JSON.stringify(payload);

      console.log("📤 Message encrypted, sending via WebSocket...");

      const sortedChatId = [currentUserId, member2Id].sort().join("/");

      // Create optimistic message (decrypted version for immediate display)
      const optimisticMsg = {
        sender: currentUser,
        content: messageText,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInput('');

      // Send encrypted message payload via WebSocket
      const msg = { sender: currentUser, content: encryptedStr, timestamp: optimisticMsg.timestamp };
      stompClientRef.current.send(
        `/app/personal_chat/send_message/${sortedChatId}`,
        {},
        JSON.stringify(msg)
      );
      console.log("✅ Message sent to WebSocket");
    } catch (err) {
      console.error("❌ Send message error:", err);
      toast.error('Failed to send message: ' + err.message);
      // Remove optimistic message on failure
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-orange-200/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50 py-3 px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/chat`} className="text-text-muted hover:text-text-main md:hidden transition-colors">
            <svg viewBox="0 0 24 24" height="24" width="24" className="" fill="currentColor"><path d="M12,4l1.4,1.4L7.8,11H20v2H7.8l5.6,5.6L12,20l-8-8L12,4z"></path></svg>
          </Link>
          <Link to={`/dashboard/profile/${memberName}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-accent/20 group-hover:border-accent transition-colors">
              <img
                src={`https://github.com/${memberName}.png`}
                alt={memberName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-text-main font-bold text-base leading-tight group-hover:text-accent transition-colors">{memberName}</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                  {isConnected ? 'Secure Connection' : 'Disconnected'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Messages container */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-auto p-4 z-0 space-y-4 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <span className="bg-surface/80 backdrop-blur-sm border border-accent/20 text-text-muted text-xs px-6 py-3 rounded-2xl shadow-sm text-center max-w-md leading-relaxed">
              Messages are end-to-end encrypted. No one outside of this chat, not even TeamBond, can read or listen to them.
            </span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === currentUser;
            const isDecryptionFailed = msg.content === '[Decryption Failed]' || msg.content === '[Decryption Failed - Key Missing]';

            return (
              <div
                key={idx}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`
                  relative max-w-[85%] md:max-w-[85%] px-4 py-2.5 shadow-sm text-[0.95rem] leading-relaxed transition-all duration-200 hover:shadow-md
                  ${isMe
                      ? 'bg-gradient-to-r from-accent to-orange-400 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white/80 backdrop-blur-sm border border-white/50 text-text-main rounded-2xl rounded-tl-sm'
                    }
                  ${isDecryptionFailed ? 'border-red-200 bg-red-50 text-red-600' : ''}
                `}
                >
                  <div className="break-words whitespace-pre-wrap">
                    {isDecryptionFailed ? (
                      <span className="flex items-center gap-2 italic text-sm">
                        <span>⚠️</span> {msg.content}
                      </span>
                    ) : msg.content}
                  </div>

                  <div className={`flex items-center justify-end gap-1 mt-1 select-none opacity-70 ${isMe ? 'text-white/90' : 'text-text-muted/70'}`}>
                    <span className="text-[10px] min-w-fit font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                    </span>
                    {isMe && (
                      <span className="text-white/90 text-[14px] -mt-0.5">
                        <svg viewBox="0 0 16 11" height="11" width="16" fill="currentColor"><path d="M11.057 9.224l-3.321 3.3-3.32-3.3 1.066-1.07 2.254 2.25 5.86-5.86 1.07 1.07z" opacity=".7"></path><path d="M13.682 9.224l-3.32 3.3-1.07-1.07 2.26-2.25 4.79-4.79 1.07 1.07z"></path></svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <div className="sticky bottom-0 glass border-t border-white/20 py-3 px-4 flex items-center gap-3 z-20 backdrop-blur-xl">
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="text-text-muted hover:text-accent p-2 rounded-full hover:bg-accent/10 transition-all duration-300"
        >
          <MdEmojiEmotions size={24} />
        </button>

        <button className="text-text-muted hover:text-accent p-2 rounded-full hover:bg-accent/10 transition-all duration-300">
          <MdAttachFile size={24} />
        </button>

        <div className="flex-1 bg-white/60 focus-within:bg-white border border-transparent focus-within:border-accent/30 rounded-2xl flex items-center transition-all duration-300 shadow-inner">
          <input
            ref={messageInputRef}
            className="w-full bg-transparent text-text-main px-4 py-3 outline-none placeholder-text-muted/50 text-[15px]"
            type="text"
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>

        <button
          onClick={sendMessage}
          className={`p-3 rounded-full transition-all duration-300 shadow-md ${input.trim()
            ? 'bg-gradient-to-r from-accent to-orange-400 text-white hover:shadow-lg transform hover:scale-105'
            : 'bg-surface text-text-muted hover:bg-white'
            }`}
        >
          <MdSend size={22} className={input.trim() ? "translate-x-0.5" : ""} />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-30 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
            <EmojiPicker
              theme="light"
              onEmojiClick={(emojiObject) => setInput(i => i + emojiObject.emoji)}
              height={400}
              width={320}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalChatChat;