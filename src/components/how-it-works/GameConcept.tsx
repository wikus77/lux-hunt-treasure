
import React from "react";
import { motion } from "framer-motion";

interface SectionProps {
  variants: any;
}

const GameConcept: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="m1ssion-glass-card p-8 mb-12" variants={variants}>
      <h2 className="text-3xl font-orbitron font-bold mb-6 neon-text-cyan">Concept del Gioco</h2>
      <p className="text-white/80 mb-6">
        M1SSION è una caccia al tesoro globale che combina tecnologia, intuizione e strategia. Ogni mese, una nuova auto di lusso viene nascosta virtualmente da qualche parte nel mondo. I partecipanti devono scoprire la sua posizione interpretando gli indizi che vengono rilasciati progressivamente.
      </p>
      <div className="glass-medium p-6 rounded-m1">
        <p className="neon-text-yellow text-xl font-light tracking-wide text-center">
          "Non è solo un gioco, è una missione"
        </p>
      </div>
    </motion.div>
  );
};

export default GameConcept;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
