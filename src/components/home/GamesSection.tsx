import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Lock, CheckCircle } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  status: 'available' | 'completed' | 'locked';
  icon: string;
}

interface GamesSectionProps {
  games: Game[];
}

const difficultyColors = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red'
};

const statusIcons = {
  available: Play,
  completed: CheckCircle,
  locked: Lock
};

export const GamesSection: React.FC<GamesSectionProps> = ({ games }) => {
  return (
    <div className="mb-8">
      {/* Header */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center space-x-3 mb-4"
      >
        <Gamepad2 className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-orbitron font-bold text-white">
          MINI GIOCHI
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 gap-4">
        {games.slice(0, 6).map((game, index) => {
          const StatusIcon = statusIcons[game.status];
          
          return (
            <motion.div
              key={game.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: game.status !== 'locked' ? 1.05 : 1 }}
              whileTap={{ scale: game.status !== 'locked' ? 0.95 : 1 }}
              className={`relative group ${game.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className={`bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-md rounded-xl p-4 border border-gray-800 transition-all duration-300 ${
                game.status === 'locked' 
                  ? 'opacity-50' 
                  : 'group-hover:border-cyan-500/40'
              }`}>
                {/* Game Icon */}
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 text-2xl">
                  {game.icon}
                </div>

                {/* Game Info */}
                <h3 className="text-white font-bold text-sm mb-1 truncate">
                  {game.title}
                </h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {game.description}
                </p>

                {/* Game Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Difficulty */}
                    <div className={`bg-${difficultyColors[game.difficulty]}-500/20 px-2 py-1 rounded-full`}>
                      <span className={`text-${difficultyColors[game.difficulty]}-400 text-xs font-bold uppercase`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status & Points */}
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 text-xs font-bold">
                      +{game.points}
                    </span>
                    <StatusIcon className={`w-4 h-4 ${
                      game.status === 'available' ? 'text-green-400' :
                      game.status === 'completed' ? 'text-blue-400' :
                      'text-gray-500'
                    }`} />
                  </div>
                </div>

                {/* Best Score (se completato) */}
                {game.status === 'completed' && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Best Score:</span>
                      <span className="text-cyan-400 font-bold">2,450</span>
                    </div>
                  </div>
                )}

                {/* Glow Effect */}
                {game.status !== 'locked' && (
                  <div className="absolute inset-0 bg-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};