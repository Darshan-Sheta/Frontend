import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GradientBackground from "../components/background/GradientBackground";
import Navigation from "../components/navigation/Navigation";
import HackathonCandidateCard from "../components/hackathonRequest/HackathonCandidateCard";
import { useAuth } from "../context/AuthContext";
import { FaRobot, FaArrowLeft } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HackathonCandidatePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("🔄 FRONTEND: useEffect triggered, hackathon ID:", id);
        fetchCandidates();
    }, [id]);

    const fetchCandidates = async () => {
        try {
            console.log("========================================");
            console.log("🚀 FRONTEND: Starting to fetch candidates");
            console.log("🚀 Hackathon ID:", id);
            console.log("🚀 API Base URL:", API_BASE);
            const url = `${API_BASE}/api/hackathons/${id}/recommended-users`;
            console.log("🚀 Full URL:", url);
            console.log("========================================");
            
            setLoading(true);
            
            // Fixed: Added /api prefix to match backend endpoint
            const response = await axios.get(url, {
                withCredentials: true,
            });
            
            console.log("✅ FRONTEND: API Response received");
            console.log("✅ Status:", response.status);
            console.log("✅ Response data:", response.data);
            console.log("✅ Data type:", typeof response.data);
            console.log("✅ Is array?", Array.isArray(response.data));
            console.log("✅ Data length:", Array.isArray(response.data) ? response.data.length : "N/A");
            
            if (response.data && Array.isArray(response.data)) {
                console.log("✅ Setting candidates:", response.data.length, "items");
                response.data.forEach((candidate, index) => {
                    console.log(`  [${index}] User: ${candidate.name || candidate.userId}, Score: ${candidate.score}`);
                });
            } else {
                console.warn("⚠️ Response data is not an array:", response.data);
            }
            
            setCandidates(response.data || []);
            setLoading(false);
            
            console.log("✅ FRONTEND: State updated, candidates:", response.data?.length || 0);
            console.log("========================================");
        } catch (err) {
            console.error("========================================");
            console.error("💥 FRONTEND ERROR: Failed to fetch candidates");
            console.error("💥 Error message:", err.message);
            console.error("💥 Error code:", err.code);
            console.error("💥 Response status:", err.response?.status);
            console.error("💥 Response data:", err.response?.data);
            console.error("💥 Full error:", err);
            console.error("========================================");
            setError("Failed to load recommendations. Please try again later.");
            setLoading(false);
        }
    };

    return (
        <GradientBackground className="min-h-screen">
            <Navigation />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 text-white">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition">
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
                            <FaRobot className="text-purple-500" /> AI Candidate Suggestions
                        </h1>
                        <p className="text-gray-400 mt-2">Top matched developers based on tech stack & proficiency</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-white text-xl animate-pulse">
                        Loading matched candidates... 🤖
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 text-xl mt-12 bg-gray-900/50 p-8 rounded-xl border border-red-500/30">
                        {error}
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center text-gray-400 text-xl mt-12 bg-gray-900/50 p-12 rounded-xl border border-white/10">
                        <FaRobot className="text-6xl mx-auto mb-4 text-gray-600" />
                        <p>No suitable candidates found for this hackathon's tech stack yet.</p>
                        <p className="text-sm mt-4 text-gray-500">Check browser console for debug info</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {candidates.map((candidate, index) => (
                            <HackathonCandidateCard
                                key={candidate.userId || index}
                                candidate={candidate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </GradientBackground>
    );
};

export default HackathonCandidatePage;
