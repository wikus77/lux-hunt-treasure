
import React from "react";
import { motion } from "framer-motion";
import CarBrandSelection from "@/components/landing/CarBrandSelection";

interface SectionProps {
  variants: any;
}

const PrizesSection: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div 
      className="m1ssion-glass-card p-8 mb-12 overflow-hidden" 
      variants={variants}
      whileHover={{ 
        boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)'
      }}
    >
      <h2 className="text-3xl font-orbitron font-bold mb-6 neon-text-cyan">
        Vuoi provarci? Fallo. Ma fallo per vincere.
      </h2>
      
      <div className="glass-medium rounded-m1 overflow-hidden p-2">
        <CarBrandSelection />
      </div>
    </motion.div>
  );
};

export default PrizesSection;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
