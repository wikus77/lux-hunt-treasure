
import React from "react";
import { motion } from "framer-motion";
import ContactInfo from "./ContactInfo";
import SimpleContactForm from "./SimpleContactForm";

const ContactMain = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact info */}
      <motion.div 
        className="lg:col-span-1 glass-card p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ContactInfo />
      </motion.div>
      
      {/* Contact form */}
      <motion.div 
        className="lg:col-span-2 glass-card p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
        <SimpleContactForm />
      </motion.div>
    </div>
  );
};

export default ContactMain;
