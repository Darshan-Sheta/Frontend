import React, { useState, useEffect, use } from "react";
import GradientBackground from "../components/background/GradientBackground";
import Navigation from "../components/navigation/Navigation";
import HackathonRequestCard from "../components/hackathonRequest/HackathonRequestCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/chatbot/Chatbot";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HackathonRequestPage = () => {
  const navigate = useNavigate();
  const [hackathonRequests, setHackathonRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const { username } = useAuth();
  useEffect(() => {
    // const username = localStorage.getItem("username");

    // if (!username) {
    //   navigate("/login");
    // } else {
    fetchHackathonRequests(username);
    // }
  }, [navigate]);

  const fetchHackathonRequests = async (username) => {
    try {
      const response = await axios.get(
        `${API_BASE}/requests/${username}`, {
        withCredentials: true, // <-- This sends cookies!
      }
      );
      setHackathonRequests(response.data.reverse());
    } catch (error) {
      console.error("Error fetching hackathon requests:", error);
    }
  };

  // Filter requests based on active tab
  const filteredRequests = hackathonRequests.filter(
    (request) => request.status.toLowerCase() === activeTab
  );

  return (
    <GradientBackground className="min-h-screen">
      <Navigation />
      <div className="flex min-h-screen p-4 pt-24 mx-auto max-w-7xl pb-0 overflow-y-auto">
        {/* Sidebar Navigation */}
        <nav className="w-1/4 h-fit glass-card border border-white/40 shadow-xl p-6 flex flex-col space-y-3 rounded-2xl mr-8 sticky top-24">
          <h1 className="text-2xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
            Requests Received
          </h1>
          {["pending", "accepted", "rejected"].map((tab) => (
            <button
              key={tab}
              className={`p-4 rounded-xl text-left font-medium transition-all duration-200 flex items-center justify-between group ${activeTab === tab
                ? "bg-accent text-white shadow-md transform scale-[1.02]"
                : "text-text-muted hover:bg-white/50 hover:text-text-main hover:pl-5"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tab.charAt(0).toUpperCase() + tab.slice(1)} Requests</span>
              {activeTab === tab && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 bg-transparent">
          <div className="container mx-auto p-2">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl text-center mt-4 border border-white/40">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">No {activeTab} requests</h3>
                <p className="text-text-muted">You don't have any requests in this category yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <HackathonRequestCard key={request.id} {...request} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Chatbot />
    </GradientBackground>
  );
};

export default HackathonRequestPage;
