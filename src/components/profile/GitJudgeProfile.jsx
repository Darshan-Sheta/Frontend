import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ShimmerEffect from '../shimmer/ShimmerEffect';

const GitJudgeProfile = ({ username, githubData }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (username) {
            setLoading(true);
            setError(null);
            axios.get(`${API_BASE}/api/analysis/github/${username}`, { withCredentials: true })
                .then(res => {
                    setAnalysis(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Analysis Error:", err);
                    setError(err.response?.data || "Failed to generate AI analysis.");
                    setLoading(false);
                });
        }
    }, [username]);

    if (loading) return <GitJudgeShimmer />;
    if (loading) return <GitJudgeShimmer />;
    if (error) return (
        <div className="w-full text-center p-6 bg-red-900/20 text-red-400 rounded-xl border border-red-800 mt-6">
            <h3 className="font-bold">AI Analysis Failed</h3>
            <p className="text-sm">{error}</p>
        </div>
    );
    if (!analysis) return null;
    if (!analysis) return null;

    const { developer_type, levels_array, scores, analysis: details } = analysis;

    // Transform levels_array for Radar Chart if needed, or stick to UI design
    // Screenshot shows "Skill", "Consistency", "Hackathon" triangle which matches "scores"
    const chartData = [
        { subject: 'Skill', A: scores?.skill || 0, fullMark: 100 },
        { subject: 'Consistency', A: scores?.consistency || 0, fullMark: 100 },
        { subject: 'Hackathon', A: scores?.hackathon_fit || 0, fullMark: 100 },
    ];

    return (
        <div className="w-full text-white mt-10">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* SECTION 01: RAW GITHUB FETCH (Left Side - Implicitly covered by existing profile, but let's add the small summary card if requested or stick to AI part) 
           The screenshot shows "SECTION 01" card. Let's rebuild it to match the visual. */
                }
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-green-400 mb-2">
                        <span className="text-2xl">stack</span> SECTION 01: RAW GITHUB FETCH
                    </div>

                    <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
                        <div className="flex items-start gap-4 z-10 relative">
                            <img src={githubData?.avatar_url || "https://github.com/github.png"} className="w-24 h-24 rounded-xl border-2 border-gray-700" alt="avatar" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">{githubData?.name || username}</h2>
                                <p className="text-blue-400">@{username}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                                    <span>👥 {githubData?.followers} Followers</span>
                                    <span>Current Repos: {githubData?.public_repos}</span>
                                </div>
                                {githubData?.location && <p className="text-gray-500 text-sm mt-1">📍 {githubData.location}</p>}
                            </div>
                        </div>
                        <p className="mt-4 text-gray-400 italic">"{githubData?.bio || "Coding Building Growing !!!"}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Languages Used */}
                        <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-yellow-500 font-bold mb-4 flex items-center gap-2">
                                CODE LANGUAGES USED
                            </h3>
                            <div className="space-y-2">
                                {details?.languages?.slice(0, 5).map((lang, idx) => (
                                    <div key={idx} className="flex justify-between bg-gray-800/50 p-2 rounded px-3">
                                        <span>{lang}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Organizations */}
                        <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
                                ORGANIZATIONS
                            </h3>
                            <p className="text-gray-500 italic">None found (or fetched)</p>
                        </div>
                    </div>
                </div>


                {/* SECTION 02: AI EXPERT ANALYSIS (Right Side) */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-blue-400 mb-2">
                        <span className="text-2xl">shield</span> SECTION 02: AI EXPERT ANALYSIS
                    </div>

                    <div className="bg-[#0D1117] rounded-xl p-0 border border-gray-800 overflow-hidden relative">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold px-6 py-2 rounded-bl-xl z-20 shadow-lg text-xl">
                            {Math.round((scores?.skill + scores?.consistency + scores?.hackathon_fit) / 3)}/100
                        </div>

                        <div className="p-8 pb-0">
                            <h2 className="text-3xl font-bold text-white mb-2">{developer_type}</h2>
                            <div className="flex flex-col md:flex-row items-center justify-between">

                                {/* Radar Chart */}
                                <div className="w-full h-[250px] relative -ml-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                            <PolarGrid stroke="#374151" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Skills" dataKey="A" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.3} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Main Tech Stack List */}
                                <div className="bg-[#161B22] p-4 rounded-xl border border-gray-700 w-full md:w-64">
                                    <h4 className="text-gray-400 text-xs font-bold uppercase mb-3 tracking-wider">MAIN STACK</h4>
                                    <div className="space-y-2">
                                        {details?.tech_stack_summary?.slice(0, 5).map((tech, i) => (
                                            <div key={i} className="bg-[#21262D] px-3 py-1.5 rounded text-sm text-blue-300 border border-gray-700">
                                                {tech}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Skill Levels */}
                        <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-orange-500 font-bold mb-4 flex items-center gap-2">
                                SKILL LEVELS
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {levels_array?.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className="bg-[#161B22] p-2 rounded border border-gray-700">
                                        <div className="text-[10px] text-green-400 uppercase font-bold">{item.level}</div>
                                        <div className="font-medium text-gray-200">{item.skill}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Applied Technologies */}
                        <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-pink-500 font-bold mb-4 flex items-center gap-2">
                                APPLIED TECHNOLOGIES
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {details?.technologies?.slice(0, 8).map((tech, idx) => (
                                    <span key={idx} className="bg-[#161B22] text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-700">
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

const GitJudgeShimmer = () => (
    <div className="w-full mt-10 animate-pulse">
        <div className="flex gap-6">
            <ShimmerEffect className="flex-1 h-96 rounded-xl bg-gray-800/50" />
            <ShimmerEffect className="flex-1 h-96 rounded-xl bg-gray-800/50" />
        </div>
    </div>
);

export default GitJudgeProfile;
