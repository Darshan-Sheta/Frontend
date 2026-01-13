import { FaGithub, FaLinkedin, FaInstagram, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiLeetcode, SiCodechef, SiCodeforces } from 'react-icons/si';
import React from 'react';

const ProfileCard = ({ platform, username, icon: Icon, link, bgColor, accent }) => (
  <div className="glass-card rounded-2xl p-5 hover:border-white/20 transition-all duration-300 group flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${bgColor} ${accent} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-1.5 bg-background/50 hover:bg-white rounded-full text-xs font-medium text-text-muted hover:text-accent transition-colors border border-border/20 shadow-sm"
      >
        Connect
      </a>
    </div>
    <div>
      <h3 className={`text-lg font-bold ${accent} mb-1`}>{platform}</h3>
      <p className="text-sm text-text-muted truncate w-full font-mono opacity-80 group-hover:opacity-100 transition-opacity">
        @{username}
      </p>
    </div>
  </div>
);

export default ProfileCard;