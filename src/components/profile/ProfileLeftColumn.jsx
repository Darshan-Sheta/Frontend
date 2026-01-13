import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import ProfileCard from './ProfileCard';


const ProfileLeftColumn = ({
    userData,
    githubData,
    codechefData,
    frameworks,
    platformConfig,
    username
}) => {
    return (
        <div className="flex flex-col gap-6 w-full h-full">
            {/* 1. Main Profile Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-black/5 overflow-hidden shadow-2xl relative group">

                {/* Cover Image */}
                <div className="relative h-40 w-full overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${userData.coverPhotoUrl || "https://images.unsplash.com/photo-1504805572947-34fad45aed93?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZWJvb2slMjBjb3ZlcnxlbnwwfHwwfHx8MA%3D%3D"})`
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

                    {/* Edit Button */}
                    <Link
                        to={`/dashboard/profile/${username}/edit`}
                        className="absolute top-3 right-3 p-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full text-white shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95 group-hover:opacity-100"
                        title="Edit Profile"
                    >
                        <FaEdit size={16} />
                    </Link>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 relative -mt-16 flex flex-col items-center text-center">

                    {/* Avatar */}
                    <div className="relative mb-3">
                        <div className="w-32 h-32 rounded-full p-1 bg-white/60 backdrop-blur-md ring-4 ring-white/40 overflow-hidden shadow-2xl">
                            <img
                                src={githubData?.avatar_url || userData.avatarUrl || "https://github.com/github.png"}
                                alt={userData.displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        {/* Emoji */}
                        <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur border border-black/5 p-1.5 rounded-full text-xl shadow-lg">
                            {userData.emoji || "👨🏻‍💻"}
                        </div>
                    </div>

                    {/* Names */}
                    <h1 className="text-2xl font-bold text-slate-800 font-display tracking-tight mb-0.5">
                        {userData.displayName}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mb-4">@{username}</p>

                    {/* Bio */}
                    {userData.bio && (
                        <p className="text-slate-600 text-sm leading-relaxed mb-5 italic line-clamp-4 px-2">
                            "{userData.bio}"
                        </p>
                    )}

                    {/* Location & Views Row */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6 w-full">
                        {userData.location && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border border-black/5 text-xs text-slate-600 font-medium">
                                <FaMapMarkerAlt className="text-red-500" />
                                {userData.location}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border border-black/5 text-xs text-slate-600 font-medium">
                            <FaEye className="text-blue-500" />
                            <img
                                src={`https://profile-counter.glitch.me/${userData.githubUsername}/count.svg`}
                                className="h-3 filter brightness-0 opacity-70"
                                alt="views"
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 w-full mb-6 border-t border-black/5 pt-4">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-slate-800">{githubData?.public_repos || 0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Repos</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-black/5">
                            <span className="text-lg font-bold text-slate-800">{githubData?.followers || 0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Followers</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-black/5">
                            <span className="text-lg font-bold text-slate-800">{githubData?.following || 0}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Following</span>
                        </div>
                    </div>

                    {/* Tech Frameworks (Top 5) */}
                    {frameworks && frameworks.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 w-full">
                            {frameworks.slice(0, 8).map((fw, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/5 text-blue-600 border border-blue-500/10">
                                    {fw.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Social Links */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-black/5 p-4 shadow-lg">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Connect</h3>
                <div className="grid grid-cols-2 gap-3">
                    {platformConfig
                        .filter((platform) => userData[platform.usernameKey])
                        .map((platform) => (
                            <ProfileCard
                                key={platform.platform}
                                platform={platform.platform}
                                username={userData[platform.usernameKey]}
                                icon={platform.icon}
                                link={`${platform.baseUrl}${userData[platform.usernameKey]}`}
                                bgColor={platform.bgColor.replace('/10', '/5 hover:bg-black/5 border border-black/5 text-slate-700')}
                                compact={true}
                            />
                        ))}
                </div>
            </div>

            {/* 3. Random Quote */}
            <div className="glass-card rounded-2xl p-0 overflow-hidden shadow-sm border border-black/5">
                <img
                    src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=buefy"
                    alt="quote"
                    className="w-full h-auto opacity-100"
                />
            </div>



        </div>
    );
};

export default ProfileLeftColumn;
