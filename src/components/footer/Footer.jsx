import React from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 text-text-muted py-16 border-t border-border/20 glass bg-surface/30">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400 mb-8 inline-block"
          >
            TeamBond
          </motion.div>

          <div className="flex flex-wrap justify-center space-x-8 md:space-x-12 mb-10 text-sm font-medium tracking-wide">
            {['About', 'Features', 'Contact', 'Privacy Policy'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-accent transition-colors duration-300 hover:underline decoration-accent underline-offset-4">
                {item}
              </a>
            ))}
          </div>

          <div className="flex justify-center space-x-8 text-2xl mb-10">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:-translate-y-1 transition-all duration-300">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 hover:-translate-y-1 transition-all duration-300">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 hover:-translate-y-1 transition-all duration-300">
              <FaLinkedin />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 hover:-translate-y-1 transition-all duration-300">
              <FaInstagram />
            </a>
          </div>

          <div className="text-text-muted text-sm">
            <p className="mb-2">&copy; {currentYear} TeamBond. Crafted with precision.</p>
            <p className="opacity-70">Made for Developers by Developers.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
