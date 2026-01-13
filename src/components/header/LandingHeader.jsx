import React, { StrictMode } from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const LandingHeader = () => {
  const handleGithubLogin = () => {
    window.location.href = `${API_BASE}/oauth2/authorization/github`;
  };

  return (
    <header id="about" className="relative w-full">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <img src="/modern_logo.png" alt="logo" className="w-10 h-10" />
            <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">
              TeamBond
            </span>
          </motion.div>

          <motion.button
            onClick={handleGithubLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative px-6 py-2.5 rounded-xl bg-white/50 border border-border/50 hover:border-accent/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative font-medium text-sm text-text-main group-hover:text-amber-900 flex items-center gap-2">
              <span>Login with GitHub</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </span>
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20 text-center min-h-[90vh] flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-300 rounded-2xl blur-xl opacity-20" />
            <img
              src="/modern_logo.png"
              alt="TeamBond Logo"
              className="relative w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 tracking-tight leading-tight text-text-main">
            Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Collaborate.</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Conquer.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Showcase your coding profiles, find your dream team with AI-matching, and chat securely.
            Elevate your hackathon journey with TeamBond.
          </p>
        </motion.div>
      </div>
    </header>
  );
};

export default LandingHeader;
