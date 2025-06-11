
import React from 'react';
import { motion } from 'framer-motion';

const BuzzPulseAnimation: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-cyan-500/20 rounded-full"
        animate={{
          scale: [1, 2, 3],
          opacity: [0.8, 0.4, 0],
        }}
        transition={{
          duration: 3,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
};

export default BuzzPulseAnimation;
