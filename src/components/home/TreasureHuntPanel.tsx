
import React from 'react';
import { motion } from 'framer-motion';
import ClueBox from './ClueBox';
import TimeBox from './TimeBox';
import MissionStatusBox from './MissionStatusBox';

const TreasureHuntPanel = () => {
  return (
    <motion.div
      className="w-full bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🏛️ Caccia al Tesoro Urbano
        </h2>
        <p className="text-gray-300">
          Interagisci con i box per visualizzare i dettagli
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ClueBox />
        <TimeBox />
        <MissionStatusBox />
      </div>
    </motion.div>
  );
};

export default TreasureHuntPanel;
