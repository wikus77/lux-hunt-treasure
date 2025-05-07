
import React from "react";
import { motion } from "framer-motion";
import CarBrandSelection from "@/components/landing/CarBrandSelection";

interface SectionProps {
  variants: any;
}

const PrizesSection: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="glass-card mb-12 hidden" variants={variants}>
      <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Vuoi provarci? Fallo. Ma fallo per vincere.</h2>
      
      {/* Car Brand Selection */}
      <CarBrandSelection />
    </motion.div>
  );
};

export default PrizesSection;
