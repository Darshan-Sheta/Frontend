import React from "react";

const CodeChefCard = ({ platform, stats, imgUrl }) => {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full"></span>
        {platform}
      </h3>
      {imgUrl !== "x" && (
        <div className="relative w-full overflow-hidden aspect-[4/3] rounded-xl border border-white/5 bg-black/20">
          <iframe
            className="border-none w-full h-[300px] md:h-[430px] md:scale-75 md:w-[720px] origin-top-left opacity-90 hover:opacity-100 transition-opacity"
            src={imgUrl}
            title="CodeChef Stats"
          />
        </div>
      )}
      <div className="space-y-3 mt-4">
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

export default CodeChefCard;