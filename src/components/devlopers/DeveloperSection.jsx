import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import darshan from "../../assets/darshan.jpg";
import jay from "../../assets/jay.jpg";
const developers = [
  {
    name: "Darshan Sheta",
    github: "https://github.com/Darshan-Sheta",
    linkedin: "https://www.linkedin.com/in/darshan-sheta-942941288/",
    image: darshan,
  },
  {
    name: "Jay Thummar",
    github: "https://github.com/Jay-thummar",
    linkedin: "https://www.linkedin.com/in/jay-thummar-3b9b84321/",
    image: jay,
  },
];


import { motion } from "framer-motion";

const DeveloperSection = () => {
  return (
    <div className="text-text-main text-center py-20 px-4 relative z-10 bg-background">
      <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">
        Meet the Minds
      </h2>
      <div className="flex justify-center gap-8 flex-wrap">
        {developers.map((dev, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 rounded-2xl w-80 group bg-surface/40 border-border/40"
          >
            <div className="relative mb-6 mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-orange-300 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
              <img
                src={dev.image}
                alt={dev.name}
                className="relative w-full h-full rounded-full object-cover ring-4 ring-white/50 group-hover:ring-accent transition-all duration-300 shadow-lg"
              />
            </div>

            <h3 className="text-2xl font-display font-bold mb-2 text-text-main">{dev.name}</h3>
            <p className="text-text-muted mb-6 text-sm tracking-wide">FULL STACK DEVELOPER</p>

            <div className="flex justify-center gap-6 text-2xl">
              <a href={dev.github} target="_blank" rel="noopener noreferrer">
                <FaGithub className="text-text-muted hover:text-text-main hover:scale-110 transition-all duration-300" />
              </a>
              <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="text-text-muted hover:text-blue-500 hover:scale-110 transition-all duration-300" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperSection;
