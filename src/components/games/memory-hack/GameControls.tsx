
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import type { GameState } from './gameData';

interface GameControlsProps {
  gameState?: GameState;
  gameStatus?: string;
  difficulty?: string;
  errors?: number;
  onStartGame?: () => void;
  onResetGame: () => void;
  onDifficultyChange?: (difficulty: string) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  gameState = 'idle',
  gameStatus = 'idle',
  difficulty = 'medium',
  errors = 0,
  onStartGame,
  onResetGame,
  onDifficultyChange
}) => {
  // Use gameStatus if provided, otherwise fall back to gameState
  const currentState = gameStatus || gameState;

  if (currentState === 'waiting' || currentState === 'idle') {
    return (
      <Button 
        onClick={onStartGame || onResetGame}
        className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
      >
        INIZIA MEMORY HACK
      </Button>
    );
  }

  if (currentState === 'completed' || currentState === 'complete') {
    const isSuccess = errors <= 5;
    
    return (
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {isSuccess && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative inline-block">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="w-6 h-6 text-[#00D1FF]" />
              </motion.div>
            </div>
          </motion.div>
        )}
        
        <motion.h3 
          className={`text-xl font-bold mb-2 font-orbitron ${
            isSuccess ? 'text-green-400' : 'text-orange-400'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {isSuccess ? 'MISSIONE COMPLETATA!' : 'COMPLETATO'}
        </motion.h3>
        
        <motion.p 
          className="text-white/70 mb-4 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {isSuccess 
            ? `Errori: ${errors}/5 - Hai guadagnato 10 crediti!`
            : `Troppi errori (${errors}) - Riprova per ottenere i crediti`
          }
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button 
            onClick={onResetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
          >
            GIOCA ANCORA
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (currentState === 'failed') {
    return (
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h3 className="text-xl font-bold text-red-400 mb-2 font-orbitron">TEMPO SCADUTO!</h3>
        <p className="text-white/70 mb-4 font-sans">Riprova per completare la missione</p>
        <Button 
          onClick={onResetGame}
          className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
        >
          RIPROVA
        </Button>
      </motion.div>
    );
  }

  return null;
};

export default GameControls;
