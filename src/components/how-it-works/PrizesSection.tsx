
import React from "react";
import { motion } from "framer-motion";
import CarBrandSelection from "@/components/landing/CarBrandSelection";

interface SectionProps {
  variants: any;
}

const PrizesSection: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div 
      className="glass-card mb-12 rounded-xl shadow-lg overflow-hidden" 
      variants={variants}
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 209, 255, 0.1)" }}
    >
      <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">
        Vuoi provarci? Fallo. Ma fallo per vincere.
      </h2>
      
      <div className="rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 p-2"
           style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.05)" }}>
        {/* Car Brand Selection */}
        <CarBrandSelection />
      </div>
    </motion.div>
  );
};

export default PrizesSection;
