import React, { useState } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Link, useNavigate } from "react-router-dom";
import { httpClient } from "../../config/AxiosHelper";
import useChatContext from "../../context/ChatContext";
import { deriveKeyFromPassword, decryptWithAesKey, exportKeyToBase64 } from "../../config/passwordEncrypt";
console.log("Loaded passwordEncrypt functions:", { deriveKeyFromPassword, decryptWithAesKey });
import { setPrivateKeyInIdb } from "../../config/IndexDb";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const LoginForm = () => {
  const navigate = useNavigate();
  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const features = [
    "Real-time Group Chats",
    "Hackathon Team Formation",
    "Event Announcements",
    "Resource Sharing",
    "Personalized Learning Communities",
  ];

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Recovery State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [loginResponseData, setLoginResponseData] = useState(null);

  // Handle Recovery Submission
  const handleRecoverySubmit = async () => {
    if (!recoveryCodeInput || !loginResponseData) return;

    try {
      const { KeyBackupService } = await import("../../services/KeyBackupService");
      const restored = await KeyBackupService.restoreWithRecoveryCode(
        loginResponseData.username,
        recoveryCodeInput,
        loginResponseData.encryptedRecoveryPrivateKey,
        loginResponseData.recoveryKeyIv,
        loginResponseData.publicKey
      );

      if (restored) {
        console.log("✅ Chat unlocked with Recovery Code!");

        // AUTO-RE-ENCRYPTION LOGIC
        console.log("🔄 Auto-syncing private key with current password...");
        await KeyBackupService.backupKey(loginResponseData.username, formData.password);
        console.log("✅ Keys updated to new password successfully.");

        setShowRecoveryModal(false);
        navigate("/dashboard");
      } else {
        alert("Invalid Recovery Code. Please try again.");
      }
    } catch (err) {
      console.error("Recovery failed:", err);
      alert("Error occurred during recovery.");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // <-- This line enables cookies!
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if the backend response contains a message
        throw new Error("Invalid username or password");
      }
      console.log(data);


      setSuccess(true);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("githubUsername", data.githubUsername);
      httpClient.defaults.headers.common['username'] = data.username;
      localStorage.setItem("college", data.collegeName);
      setCurrentUser(data.username);
      setConnected(true);
      setRoomId(data.collegeName);
      setRoomId(data.collegeName);

      // --- Key Backup/Restore Logic ---
      try {
        console.log("🔐 Checking for private key backup...");
        const { KeyBackupService } = await import("../../services/KeyBackupService"); // Dynamic import

        if (data.encryptedPrivateKey && data.privateKeyIv) {
          // Case 1: Server has backup -> Restore it
          const restored = await KeyBackupService.restoreKey(
            data.username,
            formData.password,
            data.encryptedPrivateKey,
            data.privateKeyIv,
            data.publicKey // Pass the public key from the server response
          );
          if (restored) {
            console.log("Chat keys restored successfully!");
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            console.error("Failed to restore chat keys.");

            // Check if we can recover using code
            if (data.encryptedRecoveryPrivateKey) {
              console.log("⚠️ Prompting for Recovery Code...");
              setLoginResponseData(data);
              setShowRecoveryModal(true);
              return; // Stop navigation
            }

            // If no recovery possible, proceed
            setTimeout(() => navigate("/dashboard"), 1000);
          }
        } else {
          // Case 2: No backup on server -> Check local and backup if exists, or generate new
          console.log("⚠️ No backup found on server. Checking local keys...");
          await KeyBackupService.backupKey(data.username, formData.password);
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      } catch (keyError) {
        console.error("Key backup/restore error:", keyError);
        setTimeout(() => navigate("/dashboard"), 1000);
      }
      // -------------------------------

      // Navigation moved inside restore logic blocks
      // setTimeout(() => {
      //   navigate("/dashboard");
      // }, 1000);
    } catch (err) {
      // Ensure that error message is properly displayed
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-y-auto relative flex items-center justify-center">
      {/* Close button */}
      <Link to="/">
        <button className="fixed top-6 right-6 z-50 bg-white/50 hover:bg-white text-text-main rounded-full w-12 h-12 flex items-center justify-center border border-border/50 hover:shadow-md transition-all text-xl">
          ✕
        </button>
      </Link>

      {/* Main content */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          className="relative z-10 glass-card p-10 w-full max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400 mb-4 tracking-tight">
              <Typewriter
                words={["Login to TeamBond"]}
                loop={1}
                cursor
                cursorStyle="|"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="text-text-muted">
              Enter your credentials to access your account.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl text-green-700 text-center text-sm font-medium">
              Login successful!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-text-main mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="e.g., om_patel_22"
                className="w-full px-4 py-3 rounded-xl bg-white/50 text-text-main placeholder-text-muted/50 border border-border focus:ring-2 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all hover:bg-white/80"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-text-main mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white/50 text-text-main placeholder-text-muted/50 border border-border focus:ring-2 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all hover:bg-white/80"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r from-accent to-orange-400 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-8 text-center text-text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent font-medium hover:underline hover:text-orange-500 transition-colors">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Recovery Code Restoration Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-red-400"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">⚠️ Key Restoration Failed</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Your password could not unlock your chat history (it might have changed).
              <br />Do you have a <strong>Recovery Code</strong>?
            </p>

            <input
              type="text"
              value={recoveryCodeInput}
              onChange={(e) => setRecoveryCodeInput(e.target.value)}
              placeholder="apple-river-house-..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-accent mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleRecoverySubmit()}
                className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90"
              >
                Unlock with Code
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default LoginForm;
