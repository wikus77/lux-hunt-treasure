
import React from "react";
import { motion } from "framer-motion";

interface SloganTextProps {
  stage: number;
}

const SloganText: React.FC<SloganTextProps> = ({ stage }) => {
  if (stage < 4) return null;
  
  return (
    <motion.div
      className="mt-20 text-yellow-400 text-lg tracking-[0.2em] relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        IT IS POSSIBLE
      </motion.p>
    </motion.div>
  );
};

export default SloganText;
