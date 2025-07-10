import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Clock, Target } from 'lucide-react';

interface MissionStatusBoxProps {
  week: number;
  countdown: string;
  progress: number;
}

export const MissionStatusBox: React.FC<MissionStatusBoxProps> = ({
  week,
  countdown,
  progress
}) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/20 mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-orbitron font-bold text-white">
            SETTIMANA {week}
          </h2>
        </div>
        <div className="bg-cyan-500/20 px-3 py-1 rounded-full">
          <span className="text-cyan-400 text-sm font-bold">ATTIVA</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400 text-sm">Termine missione:</span>
        <span className="text-white font-orbitron font-bold">{countdown}</span>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progresso Missione</span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-xl -z-10" />
    </motion.div>
  );
};