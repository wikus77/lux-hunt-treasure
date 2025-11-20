
import React from "react";
import { motion } from "framer-motion";
import ContactInfo from "./ContactInfo";
import SimpleContactForm from "./SimpleContactForm";

const ContactMain = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact info */}
      <motion.div 
        className="lg:col-span-1 m1ssion-glass-card p-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)'
        }}
      >
        <ContactInfo />
      </motion.div>
      
      {/* Contact form */}
      <motion.div 
        className="lg:col-span-2 m1ssion-glass-card p-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ 
          scale: 1.01,
          boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)'
        }}
      >
        <h2 className="text-2xl font-orbitron font-bold mb-6 neon-text-cyan">Inviaci un Messaggio</h2>
        <SimpleContactForm />
      </motion.div>
    </div>
  );
};

export default ContactMain;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
