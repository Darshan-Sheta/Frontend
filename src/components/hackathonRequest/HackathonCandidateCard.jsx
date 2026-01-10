import React from "react";
import { Link } from "react-router-dom";
import { FaCode, FaStar, FaUser } from "react-icons/fa";

const HackathonCandidateCard = ({ candidate }) => {
    // New structure: { userId, name, score, matchedSkills }
    const { userId, name, score, matchedSkills = [] } = candidate;
    
    // Extract username from userId or use name as fallback
    const username = userId || name?.toLowerCase().replace(/\s+/g, '') || 'user';
    const displayName = name || 'Unknown User';
    const avatarUrl = `https://github.com/${username}.png`; // Fallback to GitHub avatar

    return (
        <div className="relative bg-gray-900 border border-white/20 shadow-lg p-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden flex flex-col md:flex-row items-center gap-6">

            {/* Background/Cover Effect */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800 opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
            </div>

            {/* Avatar & Info */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-2 w-full md:w-auto">
                <Link to={`/dashboard/profile/${username}`}>
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt={username}
                            className="w-20 h-20 rounded-full border-2 border-purple-500 shadow-md object-cover bg-gray-800"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;
                            }}
                        />
                    </div>
                </Link>
                <div>
                    <h3 className="text-xl font-bold">{displayName}</h3>
                    <p className="text-gray-400 text-sm">@{username}</p>
                </div>
            </div>

            {/* Stats/Skills */}
            <div className="relative z-10 flex-1 w-full">
                {matchedSkills && matchedSkills.length > 0 && (
                    <div className="mb-4">
                        <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Matched Skills:</p>
                        <div className="flex flex-wrap gap-2">
                            {matchedSkills.slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">
                                    {skill}
                                </span>
                            ))}
                            {matchedSkills.length > 5 && (
                                <span className="text-gray-500 text-xs">+{matchedSkills.length - 5} more</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                        <FaCode className="text-blue-400" />
                        <span className="font-semibold text-lg">{matchedSkills.length}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Skills</span>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold text-lg">{score.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
                <Link to={`/dashboard/profile/${username}`}>
                    <button className="w-full md:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all">
                        View Profile
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HackathonCandidateCard;
