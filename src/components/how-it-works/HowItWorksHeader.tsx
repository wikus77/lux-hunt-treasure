
import React from "react";
import { motion } from "framer-motion";

const HowItWorksHeader = () => {
  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 
          className="text-5xl md:text-6xl font-orbitron font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">HOW </span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">M1SSION </span>
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">WORKS</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-white/70 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Scopri le regole del gioco, come partecipare e vincere un'auto di lusso ogni mese
        </motion.p>
      </div>
    </section>
  );
};

export default HowItWorksHeader;
