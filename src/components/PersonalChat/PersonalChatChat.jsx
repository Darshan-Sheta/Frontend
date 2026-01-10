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
import { getChatKeyFromIdb } from "../../config/IndexDb";
import { getUserPrivateKey } from "../../config/fileFunctions";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// AES helpers
const importAESKey = async (base64Key) => {
  const rawKey = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return window.crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

const encryptAES = async (message, base64Key) => {
  const key = await importAESKey(base64Key);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
};

const decryptAES = async (encryptedBase64, base64Key) => {
  const key = await importAESKey(base64Key);
  const data = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
};

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
        const secretKey = await getChatKeyFromIdb(username, memberName);
        if (!secretKey) throw new Error("Secret key missing");

        const { data } = await axios.get(
          `${API_BASE}/api/v1/personal_chat/all_messages/${sortedChatId}`,
          { withCredentials: true }
        );

        if (Array.isArray(data)) {
          const decrypted = await Promise.all(
            data.map(async (msg) => {
              if (typeof msg.content !== 'string') return { ...msg, content: '[Invalid]' };
              try {
                const text = await decryptAES(msg.content, secretKey);
                return { ...msg, content: text };
              } catch {
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
  }, [isReady, currentUserId, member2Id, memberName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup WebSocket for live messages
  useEffect(() => {
    if (!currentUserId || !member2Id) return;
    let isMounted = true;
    const sortedChatId = [currentUserId, member2Id].sort().join("/");
    const socket = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(() => socket, {
      reconnectDelay: 5000, // Enable auto-reconnect with 5-second delay
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.connect({}, () => {
      stompClientRef.current = client;
      client.subscribe(
        `/api/v1/topic/personal_chat/${sortedChatId}`,
        async (frame) => {
          if (!isMounted) return;
          const newMsg = JSON.parse(frame.body);
          try {
            const key = await getChatKeyFromIdb(username, memberName);
            if (key) {
              try {
                newMsg.content = await decryptAES(newMsg.content, key);
              } catch (innerErr) {
                console.error("decryptAES function failed:", innerErr);
                throw innerErr;
              }
            } else {
              newMsg.content = '[Decryption Failed - Key Missing]';
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
    });

    return () => {
      isMounted = false;
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [currentUserId, member2Id, memberName]);

  // Send a message
  const sendMessage = async () => {
    if (!stompClientRef.current || !input.trim()) return;

    // Check if key setup is complete
    if (!isKeySetupComplete) {
      toast.info('Setting up encryption keys... Please wait a moment and try again.');
      return;
    }

    try {
      const key = await getChatKeyFromIdb(username, memberName);
      if (!key) {
        toast.error('Chat encryption key not available. Please wait for key setup to complete, or the chat needs to be re-established.');
        return;
      }

      const messageText = input.trim();
      const encrypted = await encryptAES(messageText, key);
      const sortedChatId = [currentUserId, member2Id].sort().join("/");

      // Create optimistic message (decrypted version for immediate display)
      const optimisticMsg = {
        sender: currentUser,
        content: messageText, // Show decrypted text immediately
        timestamp: new Date().toISOString()
      };

      // Add message optimistically to UI
      setMessages((prev) => [...prev, optimisticMsg]);
      setInput('');

      // Send encrypted message via WebSocket
      const msg = { sender: currentUser, content: encrypted, timestamp: optimisticMsg.timestamp };
      stompClientRef.current.send(
        `/app/personal_chat/send_message/${sortedChatId}`,
        {},
        JSON.stringify(msg)
      );
    } catch (err) {
      console.error("Send message error:", err);
      const errorMessage = err.message || 'Failed to send message';
      toast.error(errorMessage);
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] relative">
      {/* Background Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
          backgroundSize: "400px"
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#202c33] py-3 px-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/chat`} className="text-gray-400 hover:text-white md:hidden">
            <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="" fill="currentColor" enableBackground="new 0 0 24 24"><path d="M12,4l1.4,1.4L7.8,11H20v2H7.8l5.6,5.6L12,20l-8-8L12,4z"></path></svg>
          </Link>
          <Link to={`/dashboard/profile/${memberName}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
              <img
                src={`https://github.com/${memberName}.png`}
                alt={memberName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-100 font-medium text-base leading-tight">{memberName}</h1>
              <span className="text-xs text-gray-400">online</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Messages container */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-auto p-4 z-0 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00a884]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <span className="bg-[#182229] text-[#ffd279] text-xs px-4 py-2 rounded-lg shadow-sm text-center">
              Messages are end-to-end encrypted. No one outside of this chat, not even CodeAmigos, can read or listen to them.
            </span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === currentUser;
            return (
              <div
                key={idx}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
              >
                <div
                  className={`
                  relative max-w-[65%] md:max-w-[50%] px-3 py-1.5 rounded-lg shadow-sm text-[0.93rem] leading-relaxed
                  ${isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                    }
                `}
                >
                  {/* Tail for bubbles - simulated with CSS borders if needed, or simplistic rounded corners */}

                  {!isMe && idx > 0 && messages[idx - 1].sender !== msg.sender && (
                    <div className="absolute top-0 -left-2 w-3 h-3 bg-[#202c33] [clip-path:polygon(100%_0,0_0,100%_100%)]" />
                  )}
                  {isMe && idx > 0 && messages[idx - 1].sender !== msg.sender && (
                    <div className="absolute top-0 -right-2 w-3 h-3 bg-[#005c4b] [clip-path:polygon(0_0,100%_0,0_100%)]" />
                  )}

                  <div className="break-words whitespace-pre-wrap">{msg.content}</div>

                  <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isMe ? '-mr-1' : ''}`}>
                    <span className="text-[11px] text-[hsla(0,0%,100%,0.6)] min-w-fit">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                    </span>
                    {isMe && (
                      // Double Tick Icon (Blue if read, Grey if delivered - static blue for now as requested)
                      <span className="text-[#53bdeb] text-[15px] -mt-0.5">
                        <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="" fill="currentColor" enableBackground="new 0 0 16 11"><path d="M11.057 9.224l-3.321 3.3-3.32-3.3 1.066-1.07 2.254 2.25 5.86-5.86 1.07 1.07z" opacity=".55"></path><path d="M13.682 9.224l-3.32 3.3-1.07-1.07 2.26-2.25 4.79-4.79 1.07 1.07z"></path></svg>
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
      <div className="sticky bottom-0 bg-[#202c33] py-2 px-4 flex items-center gap-2 z-20">
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="text-[#8696a0] hover:text-[#aebac1] p-1 transition-colors"
        >
          <MdEmojiEmotions size={26} />
        </button>

        <button className="text-[#8696a0] hover:text-[#aebac1] p-1 transition-colors">
          <MdAttachFile size={26} />
        </button>

        <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center">
          <input
            ref={messageInputRef}
            className="w-full bg-transparent text-[#d1d7db] px-4 py-2.5 outline-none placeholder-[#8696a0] text-[15px]"
            type="text"
            value={input}
            placeholder="Type a message"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>

        <button
          onClick={sendMessage}
          className="p-2.5 rounded-full text-[#8696a0] hover:text-[#aebac1] transition-colors"
        >
          {input.trim() ? <MdSend size={26} className="text-[#00a884]" /> : <MdSend size={26} />}
          {/* Note: WhatsApp usually shows Mic icon when empty, Send when typed. Keeping Send for simplicity or we can add Mic logic later */}
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-30 shadow-2xl rounded-lg overflow-hidden">
            <EmojiPicker
              theme="dark"
              onEmojiClick={(emojiObject) => setInput(i => i + emojiObject.emoji)}
              height={400}
              width={320}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { encryptAES, decryptAES };
export default PersonalChatChat;