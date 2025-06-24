
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, MapPin, Zap } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  totalClues: number;
  foundClues: number;
  timeLimit: string;
  remainingDays: number;
  totalDays: number;
}

interface ActiveMissionBoxProps {
  mission: Mission;
  progress: number;
}

export const ActiveMissionBox: React.FC<ActiveMissionBoxProps> = ({ mission, progress }) => {
  const completionPercentage = (mission.foundClues / mission.totalClues) * 100;
  const timePercentage = (mission.remainingDays / mission.totalDays) * 100;

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl border border-purple-500/30 p-6"
      style={{
        boxShadow: "0 0 20px rgba(139, 69, 19, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <h3 className="text-lg font-orbitron font-bold text-white">MISSIONE ATTIVA</h3>
        </div>
        <span className="text-xs font-orbitron text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
          {mission.id}
        </span>
      </div>

      {/* Mission Title */}
      <h4 className="text-xl font-orbitron font-bold text-cyan-400 mb-6 leading-tight">
        {mission.title}
      </h4>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Clues Found */}
        <div className="bg-black/30 rounded-lg p-4 border border-cyan-400/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-orbitron text-cyan-400 uppercase">Indizi</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-white">
            {mission.foundClues}/{mission.totalClues}
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ width: `${completionPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="bg-black/30 rounded-lg p-4 border border-yellow-400/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-orbitron text-yellow-400 uppercase">Tempo</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-white">
            {mission.remainingDays}d
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              style={{ width: `${timePercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-orbitron text-white/70">PROGRESSO COMPLESSIVO</span>
          <span className="text-sm font-orbitron text-purple-400">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <motion.button
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-orbitron font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>MAPPA</span>
          </div>
        </motion.button>

        <motion.button
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-orbitron font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>BUZZ</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
