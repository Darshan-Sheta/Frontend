import React from "react";

const LeetCodeCard = ({ platform, stats, imgUrl }) => {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between bg-white/40 backdrop-blur-xl border border-black/5 hover:border-black/10 transition-all shadow-xl">
      <h3 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></span>
        {platform}
      </h3>
      <div className="flex justify-center pb-4 rounded-xl overflow-hidden bg-white/50 border border-black/5 shadow-inner">
        <img src={imgUrl} alt={`${platform} Stats`} className="opacity-100 mix-blend-multiply" />
      </div>
      <div className="space-y-3 mt-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between text-slate-600 text-sm border-b border-black/5 pb-2 last:border-0 font-medium">
            <span>{stat.label}</span>
            <span className="font-bold text-violet-700">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeetCodeCard;