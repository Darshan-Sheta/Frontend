import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { exportKeyAsPem } from "../../config/pemutils";
import { log } from "sockjs-client/dist/sockjs";
// Imports removed as they are no longer needed
// import { privateKeyFileName, passwordFileName } from "../../config/fileFunctions";
import { encryptWithAesKey, exportKeyToBase64, generateAesKey, deriveKeyFromPassword } from "../../config/passwordEncrypt";
import { setPrivateKeyInIdb } from "../../config/IndexDb";
import { ensureBrowserKeys } from "../../config/keyManagement";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const RegistrationForm = () => {
  const { username, userId } = useAuth();
  // const features = [
  //   "Real-time Group Chats",
  //   "Hackathon Team Formation",
  //   "Event Announcements",
  //   "Resource Sharing",
  //   "Personalized Learning Communities",
  // ];

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState({
    username: '',
    id: ''
  });

  useEffect(() => {
    const username = searchParams.get("username");
    const id = searchParams.get("id");

    setUser({ username });

    setFormData((prev) => ({
      ...prev,
      githubUsername: username || "",
      username: username || "",
      displayName: username || "",
      id: id || ""
    }));
  }, [searchParams]);

  // Form state
  const [formData, setFormData] = useState({
    id: user.id,
    username: user.username,
    displayName: user.username,
    password: "",
    email: "",
    collegeName: "",
    githubUsername: user.username,
    leetcodeUsername: "",
    codechefUsername: "",
    hackerrankUsername: "",
    codeforcesUsername: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Ensure browser keys exist
      const { publicPem, privatePem } = await ensureBrowserKeys(formData.username);

      // 2. Store publicKey in localStorage for quick access
      localStorage.setItem('rsaPublicKey', publicPem);

      // 3. Build registration payload
      const registrationData = {
        ...formData,
        publicKey: publicPem,
        // No longer sending encrypted private key to server for security
      };

      // 4. Call backend
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
      }

      // 5. Encrypt and backup the private key immediately
      try {
        console.log("🔐 Backing up private key for new user...");
        const { KeyBackupService } = await import("../../services/KeyBackupService");
        await KeyBackupService.backupKey(formData.username, formData.password);
      } catch (backupErr) {
        console.error("Failed to backup initial private key:", backupErr);
        // We don't block registration success, but this is a risk
      }

      setSuccess(true);

      // 7. Recovery Code Flow
      try {
        const { KeyBackupService } = await import("../../services/KeyBackupService");
        const code = KeyBackupService.generateRecoveryCode();
        setRecoveryCode(code);

        console.log("🔐 Backing up with recovery code...");
        await KeyBackupService.backupWithRecoveryCode(formData.username, code);

        setShowRecoveryModal(true);
        // We do NOT navigate yet. User must click "I saved it" in modal.
      } catch (recErr) {
        console.error("Recovery code generation failed:", recErr);
        // Fallback if recovery fails (should unlikely fail locally)
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-y-auto relative flex items-center justify-center py-20">

      {/* Recovery Code Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border-2 border-accent relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-orange-400"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                🛡️
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Save Your Recovery Code</h2>
              <p className="text-gray-600 mb-6 text-sm">
                This code is the <strong>ONLY</strong> way to restore your access if you forget your password. We cannot recover it for you.
              </p>

              <div className="w-full bg-gray-50 p-5 rounded-xl border border-dashed border-gray-300 mb-6 relative group">
                <p className="font-mono text-xl font-bold text-accent tracking-wide select-all break-words">
                  {recoveryCode}
                </p>
                <div className="absolute top-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to copy
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCode);
                    // Optional: show copied toast
                  }}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 bg-gradient-to-r from-accent to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
                >
                  ✅ I have saved this code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Close button */}
      <Link to="/">
        <button className="fixed top-6 right-6 z-50 bg-white/50 hover:bg-white text-text-main rounded-full w-12 h-12 flex items-center justify-center border border-border/50 hover:shadow-md transition-all text-xl">
          ✕
        </button>
      </Link>

      {/* Main content */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="relative z-10 glass-card p-10 w-full max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400 mb-4 tracking-tight">
              <Typewriter
                words={["Welcome to TeamBond"]}
                loop={1}
                cursor
                cursorStyle="|"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={500}
              />
            </h1>
            <p className="text-text-muted text-lg">
              Let's set up your account and start your journey!
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl text-green-700 text-center text-sm font-medium">
              Registration successful! Welcome to TeamBond!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm leading-relaxed text-center">
            During registration, you'll need to select a directory for your personal secure chats, which rely on end-to-end encryption. This directory will safely store your private key. Please avoid modifying this directory. <br /> In case of loss, email <a href="mailto:codeamigoes7@gmail.com" className="underline font-semibold hover:text-blue-900">codeamigoes7@gmail.com</a>.
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              {
                label: "Password",
                name: "password",
                type: "password",
                placeholder: "Enter a strong password",
                required: true,
              },
              {
                label: "GitHub Username",
                name: "githubUsername",
                type: "text",
                placeholder: "e.g., Jay-thummar",
                readOnly: true,
              },
              {
                label: "LeetCode Username",
                name: "leetcodeUsername",
                type: "text",
                placeholder: "e.g., jay-thummar",
                required: true,
              },
              {
                label: "CodeChef Username",
                name: "codechefUsername",
                type: "text",
                placeholder: "e.g., jay-thummar",
                required: true,
              },
              {
                label: "GitHub email",
                name: "email",
                type: "email",
                placeholder: "e.g., rajeshthummar1978@gmail.com",
              },
            ].map((field) => (
              <div
                key={field.name}
                className={`${field.label === "GitHub email" ? "md:col-span-2" : "col-span-1"
                  } group`}
              >
                <label className="block text-sm font-medium text-text-main mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly || false}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 text-text-main placeholder-text-muted/50 border border-border focus:ring-2 focus:ring-accent/50 focus:border-accent focus:outline-none transition-all hover:bg-white/80 ${field.readOnly ? "cursor-not-allowed opacity-70" : ""
                    }`}
                />
              </div>
            ))}
            <div className="col-span-1 md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-gradient-to-r from-accent to-orange-400 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      {/* Scrolling Text */}
      <div className="fixed w-full bottom-10 overflow-hidden pointer-events-none">
        <motion.div
          className="whitespace-nowrap text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-300 to-accent"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {/* Scrolling text content here if needed */}
        </motion.div>
      </div>
    </div>
  );
}
export default RegistrationForm;