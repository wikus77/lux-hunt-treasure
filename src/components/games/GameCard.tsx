
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, Trophy } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile' | 'Molto Difficile' | 'Estremo';
  rewards: string;
  isLocked: boolean;
  progress: number;
  onPlay: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  difficulty,
  rewards,
  isLocked,
  progress,
  onPlay
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile': return 'text-green-400';
      case 'Medio': return 'text-yellow-400';
      case 'Difficile': return 'text-orange-400';
      case 'Molto Difficile': return 'text-red-400';
      case 'Estremo': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      className={`m1ssion-glass-card p-6 rounded-xl border ${
        isLocked ? 'border-gray-600 opacity-60' : 'border-blue-500/30'
      } bg-black/40 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300`}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-orbitron font-bold text-[#00D1FF] mb-2">
            {title}
          </h3>
          <p className="text-white/70 text-sm mb-3">
            {description}
          </p>
        </div>
        {isLocked && <Lock className="text-gray-500 ml-2" size={20} />}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Difficoltà:</span>
          <span className={`font-semibold ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">Ricompense:</span>
          <span className="text-yellow-400 font-semibold text-sm">
            {rewards}
          </span>
        </div>

        {!isLocked && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Progresso:</span>
              <span className="text-blue-400 font-semibold text-sm">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={onPlay}
          disabled={isLocked}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isLocked
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isLocked ? (
            <>
              <Lock size={16} />
              Bloccato
            </>
          ) : (
            <>
              <Play size={16} />
              Gioca Ora
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default GameCard;
