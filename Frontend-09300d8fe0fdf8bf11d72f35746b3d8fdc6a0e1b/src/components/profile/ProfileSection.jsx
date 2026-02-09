import React from "react";
import FrameworksStatsCard from "./FrameworksStatsCard";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

const ProfileSection = ({
  imageUrl,
  name,
  username,
  bio,
  countryFlagUrl,
  coverImageUrl,
  emoji,
  githubUsername,
  followers,
  following,
  publicRepos,
  location,
  frameworks = []
}) => {
  return (
    <div className="relative w-full mb-8">
      {/* Cover Image Container */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden glass border-b-0 group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* EDIT BUTTON (Absolute Top Right on Cover/Header Intersection) */}
        <div className="absolute top-4 right-4 z-30">
          <Link
            to={`/dashboard/profile/${username}/edit`}
            className="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-lg transition-all duration-300 shadow-sm"
          >
            <FaEdit className="text-white/80 group-hover:text-white transition-colors" />
            <span className="font-medium text-sm">Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Profile Content - Structured Layout */}
      <div className="px-6 md:px-10 relative z-10 flex flex-col md:flex-row gap-6">

        {/* Avatar - Negatively Margined to Overlap Cover */}
        <div className="relative group perspective-1000 -mt-20 flex-shrink-0 mx-auto md:mx-0">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-white/50 backdrop-blur-xl ring-4 ring-white/20 overflow-hidden relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {/* Emoji Badge */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2.5 rounded-full border border-white/40 shadow-xl text-3xl animate-bounce-slow">
            {emoji || "👨🏻‍💻"}
          </div>
        </div>

        {/* Info Column - Starts below cover for legibility */}
        <div className="flex-1 pt-3 pb-4">

          {/* Top Row: Identity */}
          <div className="flex flex-col items-start gap-1 mb-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main tracking-tight mb-1">
              {name?.replace(/-/g, " ")}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-text-muted">
              <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-text-muted to-text-main">
                @{username}
              </span>

              {location && (
                <div className="flex items-center gap-1 text-sm bg-surface/50 px-2.5 py-0.5 rounded-md border border-border/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{location}</span>
                </div>
              )}

              {/* Views Pill */}
              <div className="flex items-center gap-2 text-sm bg-surface/50 px-2.5 py-0.5 rounded-md border border-border/30">
                <span className="text-xs font-bold text-text-muted/80 uppercase">Views</span>
                <img
                  src={`https://profile-counter.glitch.me/${githubUsername}/count.svg`}
                  className="h-3.5 filter brightness-90 contrast-125 saturate-0 opacity-70"
                  alt="views"
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {bio && (
            <div className="mb-5 max-w-3xl">
              <p className="text-base md:text-lg text-text-muted/90 leading-relaxed font-reading border-l-4 border-accent/20 pl-4 py-1 italic">
                "{bio}"
              </p>
            </div>
          )}

          {/* Tech Stack & Stats Row */}
          <div className="flex flex-col gap-5">
            {/* Tech Stack */}
            {frameworks && frameworks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {frameworks.slice(0, 5).map((fw, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border/30 text-xs font-semibold text-text-muted cursor-default shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${['bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'][i % 4]}`}></span>
                    {fw.name}
                  </div>
                ))}
              </div>
            )}

            {/* Metric Stats */}
            <div className="flex flex-wrap gap-3 w-full">
              {publicRepos !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/40 border border-border/40">
                  <span className="text-xl font-bold text-text-main">{publicRepos}</span>
                  <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Repos</span>
                </div>
              )}
              {followers !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/40 border border-border/40">
                  <span className="text-xl font-bold text-text-main">{followers}</span>
                  <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Followers</span>
                </div>
              )}
              {following !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/40 border border-border/40">
                  <span className="text-xl font-bold text-text-main">{following}</span>
                  <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Following</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProfileSection;