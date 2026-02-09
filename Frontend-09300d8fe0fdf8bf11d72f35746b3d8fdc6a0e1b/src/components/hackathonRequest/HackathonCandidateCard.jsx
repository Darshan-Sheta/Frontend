import React from "react";
import { Link } from "react-router-dom";
import { FaCode, FaStar, FaUser } from "react-icons/fa";

const HackathonCandidateCard = ({ candidate }) => {
    // New structure: { userId, name, score, matchedSkills }
    const { userId, username: backendUsername, name, score, matchedSkills = [] } = candidate;

    // Prioritize backend username, then fallback to userId if it looks like a username (not recommended but safe), or name
    const username = backendUsername || name?.toLowerCase().replace(/\s+/g, '') || 'user';
    const displayName = name || 'Unknown User';
    const avatarUrl = `https://github.com/${username}.png`; // Fallback to GitHub avatar

    return (
        <div className="relative glass-card border border-white/40 shadow-lg p-6 rounded-2xl text-text-main transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl overflow-hidden flex flex-col md:flex-row items-center gap-6 group">

            {/* Soft Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Avatar & Info */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-3 w-full md:w-auto min-w-[140px]">
                <Link to={`/dashboard/profile/${username}`}>
                    <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                        <img
                            src={avatarUrl}
                            alt={username}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover relative z-10"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=D9A299&color=fff`;
                            }}
                        />
                    </div>
                </Link>
                <div>
                    <h3 className="text-xl font-bold text-text-main">{displayName}</h3>
                    <p className="text-text-muted text-sm font-medium">@{username}</p>
                </div>
            </div>

            {/* Stats/Skills */}
            <div className="relative z-10 flex-1 w-full bg-white/40 rounded-xl p-4 border border-white/50">
                {matchedSkills && matchedSkills.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider flex items-center gap-2">
                            <FaCode className="text-accent" /> Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {matchedSkills.slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="bg-white/80 backdrop-blur-sm text-text-main px-3 py-1 rounded-lg text-xs font-medium border border-border/50 shadow-sm">
                                    {skill}
                                </span>
                            ))}
                            {matchedSkills.length > 5 && (
                                <span className="text-text-muted text-xs font-medium self-center">+{matchedSkills.length - 5} more</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2 border-t border-black/5">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-100/50 text-orange-500">
                            <FaStar size={14} />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-text-main block leading-none">{score.toFixed(1)}</span>
                            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Match Score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
                <Link to={`/dashboard/profile/${username}`}>
                    <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-accent to-orange-400 hover:shadow-lg hover:scale-105 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                        View Profile
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HackathonCandidateCard;
