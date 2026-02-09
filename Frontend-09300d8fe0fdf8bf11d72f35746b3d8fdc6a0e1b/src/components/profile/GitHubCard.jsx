import React from 'react'

const GitHubCard = ({ platform, stats, imgUrl1, imgUrl2 }) => {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-full"></span>
        {platform}
      </h3>
      <div className="flex flex-col items-center space-y-4 mb-6">
        {imgUrl1 && (
          <img
            src={imgUrl1}
            alt="GitHub Stats"
            className="rounded-lg w-full border border-white/10"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        {imgUrl2 && (
          <img
            src={imgUrl2}
            alt="GitHub Top Languages"
            className="rounded-lg w-full border border-white/10"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>
      <div className="space-y-3 mt-auto">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between text-slate-400 text-sm border-b border-white/5 pb-2 last:border-0">
            <span>{stat.label}</span>
            <span className="font-semibold text-slate-200">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubCard;