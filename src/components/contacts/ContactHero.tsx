
import React from "react";
import { motion } from "framer-motion";

const ContactHero = () => {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-6">
        <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Contattaci</span>
      </h1>
      
      <p className="text-xl text-white/70 max-w-2xl mx-auto">
        Hai bisogno di aiuto o vuoi contattare il team M1SSION<span className="text-xs align-top">™</span>? Usa i seguenti canali:
      </p>
    </motion.div>
  );
};

export default ContactHero;
