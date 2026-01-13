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
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl my-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-text-muted hover:text-accent transition font-medium">
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-4xl font-display font-bold flex items-center justify-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500 mb-2">
                            <FaRobot className="text-accent" /> AI Candidate Suggestions
                        </h1>
                        <p className="text-text-muted mt-1 text-lg">Top matched developers based on tech stack & proficiency</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 text-text-muted text-xl animate-pulse">
                        <FaRobot className="text-4xl mb-4 text-accent/50 animate-bounce" />
                        Loading matched candidates...
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600 text-lg mt-12 bg-red-50 p-8 rounded-2xl border border-red-200 shadow-sm">
                        {error}
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center text-text-muted text-lg mt-12 glass-card p-12 rounded-2xl">
                        <FaRobot className="text-6xl mx-auto mb-6 text-accent/20" />
                        <p className="font-medium text-text-main mb-2">No suitable candidates found yet.</p>
                        <p className="text-sm opacity-70">Try updating your hackathon requirements or checking back later.</p>
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
