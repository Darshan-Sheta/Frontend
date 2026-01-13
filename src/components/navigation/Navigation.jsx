import { Link, useNavigate, NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUsers, FaComments, FaCode } from "react-icons/fa";
import Username from "./Username";
import NavItem from "./NavItem";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Navigation = () => {
  const { username, status } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPaymentSuccessCard, setShowPaymentSuccessCard] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigate("/");
  };

  const handleRedirect = () => {
    navigate(`/`);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20 py-3 shadow-sm bg-white/70 backdrop-blur-xl"
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src="/modern_logo.png"
                  alt="logo"
                  className="w-10 h-10 drop-shadow-md"
                />
              </motion.div>
              <span className="text-2xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500 group-hover:opacity-80 transition-opacity">
                TeamBond
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "paid" ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-accent/10 to-orange-500/10 border border-accent/20 text-accent font-bold rounded-full shadow-sm"
              >
                <span className="text-xs tracking-wider">PREMIUM MEMBER</span> 💎
              </motion.div>
            ) : (
              <motion.button
                onClick={async () => {
                  try {
                    console.log("Upgrading user:", username);
                    const res = await fetch(`${API_BASE}/api/users/${username}/upgrade-premium`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    if (res.ok) {
                      alert("Upgrade Successful! Reloading...");
                      window.location.reload();
                    } else {
                      const txt = await res.text();
                      console.error("Upgrade failed:", txt);
                      alert("Upgrade Failed: " + txt);
                    }
                  } catch (error) {
                    console.error("Upgrade network error:", error);
                    alert("Network Error: " + error.message);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-6 py-2.5 rounded-full overflow-hidden bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 font-bold text-sm text-text-main group-hover:text-white flex items-center gap-2 transition-colors duration-300">
                  Upgrade to Premium 🚀
                </span>
              </motion.button>
            )}

            <NavLink
              to="/dashboard/chat"
              className={({ isActive }) =>
                `relative px-5 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden
                ${isActive ? "text-accent bg-accent/5 font-bold" : "text-text-muted hover:text-text-main hover:bg-white/50"}`
              }
            >
              {({ isActive }) => (
                <motion.div className="flex items-center gap-2 relative z-10" whileHover={{ x: 2 }}>
                  <FaUsers className={`text-lg ${isActive ? "text-accent" : "text-text-muted group-hover:text-accent transition-colors"}`} />
                  <span className="text-sm">Personal Chat</span>
                </motion.div>
              )}
            </NavLink>

            <NavLink
              to="/dashboard/hackathons"
              className={({ isActive }) =>
                `relative px-5 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden
                ${isActive ? "text-accent bg-accent/5 font-bold" : "text-text-muted hover:text-text-main hover:bg-white/50"}`
              }
            >
              {({ isActive }) => (
                <motion.div className="flex items-center gap-2 relative z-10" whileHover={{ x: 2 }}>
                  <FaCode className={`text-lg ${isActive ? "text-accent" : "text-text-muted group-hover:text-accent transition-colors"}`} />
                  <span className="text-sm">Hackathons</span>
                </motion.div>
              )}
            </NavLink>

            <div className="h-8 w-px bg-border/40 mx-2"></div>

            <Link to={`/dashboard/profile/${username}`}>
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-transparent hover:border-white/60 hover:shadow-sm transition-all cursor-pointer bg-white/30"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-orange-400 p-[2px]">
                  <img
                    src={`https://github.com/${username}.png`}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${username}&background=random` }}
                    alt="profile"
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-xs text-text-muted font-medium leading-none mb-0.5">Welcome,</span>
                  <span className="text-sm font-bold text-text-main leading-none"><Username username={username} /></span>
                </div>
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 10, color: "#ef4444" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="text-text-muted p-2.5 rounded-full hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-text-main p-2 rounded-lg hover:bg-white/50">
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Mobile Menu Drawer */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-3/4 max-w-xs bg-white/95 backdrop-blur-xl border-l border-white/20 p-6 shadow-2xl transform ${menuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 z-50 ease-out`}>
        <div className="flex justify-between items-center mb-10 border-b border-border/50 pb-4">
          <span className="text-xl font-display font-bold text-text-main">
            Menu
          </span>
          <button onClick={() => setMenuOpen(false)} className="bg-gray-100 p-2 rounded-full text-text-muted hover:text-text-main">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <NavItem to="/dashboard/chat" icon={<FaUsers />} onClick={() => setMenuOpen(false)}>Personal Chat</NavItem>
          <NavItem to="/dashboard/hackathons" icon={<FaCode />} onClick={() => setMenuOpen(false)}>Hackathons</NavItem>
          <div className="h-px bg-border/50 my-4"></div>
          <NavItem to={`/dashboard/profile/${username}`} icon={<FaUser />} onClick={() => setMenuOpen(false)}>
            My Profile
          </NavItem>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 w-full font-bold mt-8"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
      {showPaymentSuccessCard && <PaymentSuccessCard />}
    </motion.nav>
  );
};

export default Navigation;