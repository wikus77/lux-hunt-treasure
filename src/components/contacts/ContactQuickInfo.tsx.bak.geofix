
import React from "react";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";

const ContactQuickInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 mb-12"
    >
      <div className="flex items-center gap-3 text-white">
        <Mail className="text-cyan-400" />
        <span><strong>Email</strong>: support@m1ssion.com</span>
      </div>
      
      <div className="flex items-center gap-3 text-white">
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 mr-1" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </span>
        <span><strong>Social</strong>: @m1ssion.official su Instagram e TikTok</span>
      </div>
      
      <div className="flex items-center gap-3 text-white">
        <Check className="text-cyan-400" />
        <span><strong>Modulo di contatto</strong>: disponibile nell'app alla voce "Supporto"</span>
      </div>
      
      <div className="flex items-center gap-3 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span><strong>FAQ</strong>: consulta la sezione "Aiuto" nell'app</span>
      </div>
    </motion.div>
  );
};

export default ContactQuickInfo;
