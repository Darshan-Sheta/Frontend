import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Utility to clean unwanted starter phrases from messages
function cleanMessage(text) {
  if (!text) return "";
  return text.replace(/^(Type something\.{0,3}|Start typing\.{0,3}|Start type of something\.{0,3})/i, '').trim();
}

// Utility to format message with clickable links and preserve line breaks
function formatMessageWithLinks(text) {
  if (!text) return "";
  // Convert line breaks to <br> tags
  const withBreaks = text.replace(/\n/g, '<br>');
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,!?])/g;
  // Replace URLs with clickable links
  return withBreaks.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-blue-400 hover:text-blue-300">${url}</a>`);
}

const gradientHeader = "text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400";

// Custom open button inspired by your image
function ChatbotOpenButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, boxShadow: "0 0 0 8px rgba(249, 115, 22, 0.15)" }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label="Open chatbot"
      className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-none outline-none focus:outline-none bg-gradient-to-r from-accent to-orange-400"
    >
      <span className="block text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Head */}
          <rect x="3" y="6" width="18" height="13" rx="3" />
          <path d="M9 18 L2 24 L15 18" fill="currentColor" stroke="none" />
          {/* Antennas */}
          <path d="M9 6L6 3" />
          <circle cx="6" cy="3" r="1" fill="currentColor" stroke="none" />
          <path d="M15 6L18 3" />
          <circle cx="18" cy="3" r="1" fill="currentColor" stroke="none" />
          {/* Ears */}
          <path d="M1 10h2v4H1z" fill="currentColor" stroke="none" />
          <path d="M21 10h2v4h-2z" fill="currentColor" stroke="none" />
          {/* Eyes */}
          <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
          {/* Headset Mic */}
          <path d="M22 13v2a6 6 0 0 1-6 6h-2" />
          <circle cx="14" cy="21" r="2" fill="currentColor" stroke="none" />
        </svg>
      </span>
    </motion.button>
  );
}

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isBotTyping]);

  const chatbotVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const typingVariants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    console.log("inside handlesned ")
    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsBotTyping(true);

    try {
      const payload = {
        session_id: "user124-session",
        query: userInput,
        user_id: "default_user"
      };
      console.log("before api hit ")
      const response = await fetch(`${API_BASE}/api/hackathons/jen-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const text = await response.text();
      let botReplyText;
      try {
        botReplyText = JSON.parse(text)?.response || "Sorry, I couldn't understand.";
      } catch {
        botReplyText = text || "Sorry, I couldn't understand.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReplyText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <ChatbotOpenButton onClick={() => setIsOpen(true)} />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chatbotVariants}
          className="w-[380px] h-auto min-h-[300px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-accent/10 overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center p-1">
                <motion.img
                  src='/modern_logo.png'
                  alt="logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={`text-lg font-bold ${gradientHeader}`}>TeamBond AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close chatbot"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-gray-50/50">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl max-w-[85%] relative shadow-sm leading-relaxed ${msg.sender === "user"
                  ? "bg-gradient-to-r from-accent to-orange-400 text-white self-end ml-auto rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-700 self-start rounded-tl-sm"
                  }`}
              >
                <div
                  className={`prose prose-sm max-w-none ${msg.sender === "user" ? "text-white prose-a:text-white/90" : "text-gray-700"}`}
                  dangerouslySetInnerHTML={{ __html: formatMessageWithLinks(cleanMessage(msg.text)) }}
                />
              </motion.div>
            ))}
            {isBotTyping && (
              <motion.div
                variants={typingVariants}
                animate="animate"
                className="p-3.5 rounded-2xl max-w-[85%] bg-white border border-gray-100 text-gray-500 self-start flex items-center gap-2 rounded-tl-sm shadow-sm"
              >
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-accent/20 placeholder-gray-400 transition-all"
                placeholder="Ask anything..."
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!userInput.trim()}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent to-orange-400 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                aria-label="Send"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 ml-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot;