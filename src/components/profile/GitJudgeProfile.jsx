import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ShimmerEffect from '../shimmer/ShimmerEffect';

const GitJudgeProfile = ({ username, githubData, isSidebar = false }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        let isMounted = true;

        const fetchAnalysis = (isBackground = false) => {
            if (!isBackground) {
                setLoading(true);
                setError(null);
            }

            axios.get(`${API_BASE}/api/analysis/github/${username}`, { withCredentials: true })
                .then(res => {
                    if (isMounted) {
                        setAnalysis(res.data);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    // console.error("Analysis Error:", err);
                    if (isMounted) {
                        setError(err.response?.data || "Failed to generate AI analysis.");
                        setLoading(false);
                    }
                });
        };

        if (username) {
            // 1. Initial Fetch
            fetchAnalysis();

            // 2. Poll after 10 seconds to check for updates (Stale-While-Revalidate)
            const timer = setTimeout(() => {
                console.log("Polling for fresh AI analysis...");
                fetchAnalysis(true); // true = quiet update (no loading spinner)
            }, 10000);

            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, [username]);

    if (loading) return <GitJudgeShimmer isSidebar={isSidebar} />;
    if (error) return (
        <div className="w-full text-center p-4 bg-red-900/10 text-red-400 rounded-xl border border-red-900/30 text-xs">
            FAILED TO LOAD AI ANALYSIS
        </div>
    );
    if (!analysis) return null;

    const { developer_type, levels_array, scores, analysis: details } = analysis;

    const chartData = [
        { subject: 'CORE MASTERY', A: scores?.skill || 0, fullMark: 100 },
        { subject: 'DEV PACE', A: scores?.consistency || 0, fullMark: 100 },
        { subject: 'HACKATHON EDGE', A: scores?.hackathon_fit || 0, fullMark: 100 },
    ];

    const overallScore = Math.round((scores?.skill + scores?.consistency + scores?.hackathon_fit) / 3);

    return (
        <div className={`w-full text-white ${isSidebar ? '' : 'mt-10'}`}>

            <div className={`flex flex-col ${isSidebar ? 'gap-4' : 'lg:flex-row gap-6'}`}>

                {/* AI ANALYSIS CARD */}
                <div className="flex-1 space-y-6">

                    {/* Main Analysis Card */}
                    <div className="glass-card rounded-2xl p-0 border border-black/5 overflow-hidden relative shadow-xl bg-white/40 backdrop-blur-xl">

                        {/* Gradient Header Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />

                        <div className={`${isSidebar ? 'p-5 pb-0' : 'p-8 pb-4'}`}>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-violet-600 tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)] animate-pulse" />
                                        ARCHETYPE ANALYSIS
                                    </h4>
                                    <h2 className={`${isSidebar ? 'text-2xl' : 'text-4xl'} font-black text-slate-800 leading-tight tracking-tight`}>
                                        {developer_type}
                                    </h2>
                                </div>
                                {/* Redesigned Premium Score Gauge */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 relative flex items-center justify-center">
                                            {/* SVG Gauge Background */}
                                            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="40"
                                                    stroke="rgba(0,0,0,0.05)"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                />
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="40"
                                                    stroke="url(#scoreGradient)"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    strokeDasharray="251.2"
                                                    strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
                                                    className="transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                                <defs>
                                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#8b5cf6" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            {/* Score Text with Animated Feel */}
                                            <div className="absolute flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                                                    <AnimatedNumber value={overallScore} />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-black text-violet-600 uppercase tracking-[0.2em] mt-2 relative">
                                            Dev Mastery
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-violet-600 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex ${isSidebar ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-between relative z-10`}>

                                {/* Radar Chart */}
                                <div className={`w-full ${isSidebar ? 'h-[180px] -ml-6' : 'h-[250px] -ml-4'} relative`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                            <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#4b5563', fontSize: isSidebar ? 10 : 12, fontWeight: 700 }}
                                            />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Profile"
                                                dataKey="A"
                                                stroke="#7c3aed"
                                                strokeWidth={3}
                                                fill="url(#radarGradient)"
                                                fillOpacity={0.6}
                                            />
                                            <defs>
                                                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className={`grid ${isSidebar ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                        {/* Skill Levels */}
                        <div className="glass-card rounded-2xl p-5 border border-black/5 bg-white/40 backdrop-blur-xl hover:border-black/10 transition-all">
                            <h3 className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Skill Levels
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {levels_array?.slice(0, isSidebar ? 4 : 6).map((item, idx) => (
                                    <div key={idx} className="group p-2 rounded-lg bg-white/50 border border-black/5 hover:bg-white/80 transition-colors">
                                        <div className="text-[10px] text-emerald-600 uppercase font-black mb-1">{item.level}</div>
                                        <div className="font-medium text-xs text-slate-700 truncate group-hover:text-slate-900 transition-colors">{item.skill}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Applied Technologies */}
                        <div className="glass-card rounded-2xl p-5 border border-black/5 bg-white/40 backdrop-blur-xl hover:border-black/10 transition-all">
                            <h3 className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {details?.technologies?.slice(0, isSidebar ? 6 : 8).map((tech, idx) => (
                                    <span key={idx} className="bg-gradient-to-r from-pink-500/5 to-rose-500/5 text-pink-700 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-pink-500/10 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const GitJudgeShimmer = ({ isSidebar }) => (
    <div className={`w-full ${isSidebar ? 'mt-0' : 'mt-10'} animate-pulse`}>
        <div className={`flex flex-col gap-4`}>
            <ShimmerEffect className={`w-full ${isSidebar ? 'h-48' : 'h-96'} rounded-xl bg-gray-800/50`} />
            <ShimmerEffect className="w-full h-32 rounded-xl bg-gray-800/50" />
        </div>
    </div>
);

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const increment = Math.ceil(value / (duration / 16));

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{displayValue}</span>;
};

export default GitJudgeProfile;
