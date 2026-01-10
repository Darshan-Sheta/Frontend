import React from "react";
import { SiCodeforces } from "react-icons/si";

const CodeforcesCard = ({ platform, stats, imgUrl }) => {
    return (
        <div className="bg-[#1F8AC7]/10 backdrop-blur-md rounded-lg p-6 hover:bg-[#1F8AC7]/20 transition-all duration-300 border border-gray-700/50 group h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#1F8AC7]/20 rounded-lg text-[#1F8AC7] group-hover:scale-110 transition-transform duration-300">
                    <SiCodeforces size={24} />
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {platform}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-[#1F8AC7]/30 transition-colors"
                    >
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-white font-mono font-bold text-lg">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {imgUrl && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-[#1F8AC7]/30 transition-colors">
                    <img
                        src={imgUrl}
                        alt={`${platform} Graph`}
                        className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                </div>
            )}
        </div>
    );
};

export default CodeforcesCard;
