import React from "react";
import { SiCodeforces } from "react-icons/si";

const CodeforcesCard = ({ platform, stats, imgUrl }) => {
    return (
        <div className="glass-card rounded-2xl p-6 h-full flex flex-col justify-between group">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:scale-110 transition-transform duration-300">
                    <SiCodeforces size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-text-main">
                    {platform}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-background/50 rounded-xl p-3 border border-border/20 hover:border-accent/30 transition-colors shadow-sm"
                    >
                        <p className="text-text-muted text-xs mb-1">{stat.label}</p>
                        <p className="text-text-main font-mono font-bold text-lg">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {imgUrl && (
                <div className="relative rounded-xl overflow-hidden border border-border/20 group-hover:border-accent/20 transition-colors bg-white/50">
                    <img
                        src={imgUrl}
                        alt={`${platform} Graph`}
                        className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply"
                    />
                </div>
            )}
        </div>
    );
};

export default CodeforcesCard;
