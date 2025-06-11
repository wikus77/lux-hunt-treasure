
import React from 'react';
import { motion } from 'framer-motion';

interface BuzzCountDisplayProps {
  current: number;
  max: number;
}

const BuzzCountDisplay: React.FC<BuzzCountDisplayProps> = ({ current, max }) => {
  return (
    <motion.div
      className="text-center"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-4xl font-bold text-cyan-400 mb-2">
        {current}/{max}
      </div>
      <div className="text-gray-400 text-sm">
        Buzz disponibili oggi
      </div>
    </motion.div>
  );
};

export default BuzzCountDisplay;
