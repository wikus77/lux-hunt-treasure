
import { motion } from "framer-motion";

const DarkZoneTitle = () => {
  return (
    <motion.div 
      className="text-center py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 1 }}
    >
      <h1 className="text-2xl md:text-3xl font-orbitron neon-text-cyan mb-1">
        LA ZONA OSCURA
      </h1>
      <p className="text-white/60 text-sm">
        Sistema di Comando • <span className="neon-text-cyan/80">Livello di accesso: Operativo</span>
      </p>
      <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-m1ssion-cyan/50 to-transparent mt-4"></div>
    </motion.div>
  );
};

export default DarkZoneTitle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
