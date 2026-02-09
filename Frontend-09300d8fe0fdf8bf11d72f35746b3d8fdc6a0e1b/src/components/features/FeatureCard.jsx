import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      className="relative w-full h-full max-w-[600px] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative glass-card p-8 rounded-2xl flex flex-col justify-between h-full hover:border-accent/30 transition-all duration-300"
        whileHover={{
          y: -10,
          boxShadow: "0 20px 40px -10px rgba(217, 162, 153, 0.2)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-6xl mb-6 relative"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 blur-2xl bg-accent/20 rounded-full" />
          <span className="relative z-10">{icon}</span>
        </motion.div>
        <motion.h3
          className="text-2xl font-display font-bold mb-4 text-text-main"
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-text-muted leading-relaxed text-lg"
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default FeatureCard;
