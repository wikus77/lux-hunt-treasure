
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Bomb, Zap, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Wire {
  id: number;
  color: string;
  bgColor: string;
  glowColor: string;
  isCorrect: boolean;
}

interface Clue {
  text: string;
  correctIndex: number;
}

const clues: Clue[] = [
  { text: "Il secondo da destra è mortale", correctIndex: 2 },
  { text: "Evita il blu, scegli il rosso", correctIndex: 0 },
  { text: "Il primo filo è sicuro", correctIndex: 0 },
  { text: "Il verde non esplode mai", correctIndex: 3 },
  { text: "Il giallo conduce alla salvezza", correctIndex: 2 },
  { text: "L'ultimo filo è la chiave", correctIndex: 3 },
];

const DisarmTheBombGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'success' | 'failed'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const [completionTime, setCompletionTime] = useState<number>(0);

  const initializeGame = useCallback(() => {
    const randomClue = clues[Math.floor(Math.random() * clues.length)];
    setSelectedClue(randomClue);
    
    const wireColors = [
      { color: 'Rosso', bgColor: '#ff4d4d', glowColor: 'rgba(255, 77, 77, 0.6)' },
      { color: 'Blu', bgColor: '#3399ff', glowColor: 'rgba(51, 153, 255, 0.6)' },
      { color: 'Giallo', bgColor: '#ffcc00', glowColor: 'rgba(255, 204, 0, 0.6)' },
      { color: 'Verde', bgColor: '#00cc66', glowColor: 'rgba(0, 204, 102, 0.6)' },
    ];

    const gameWires = wireColors.map((wire, index) => ({
      id: index,
      color: wire.color,
      bgColor: wire.bgColor,
      glowColor: wire.glowColor,
      isCorrect: index === randomClue.correctIndex,
    }));

    setWires(gameWires);
    setGameState('playing');
    setStartTime(Date.now());
    setIsExploding(false);
    setCompletionTime(0);
  }, []);

  const handleWireClick = async (wire: Wire) => {
    if (gameState !== 'playing') return;

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    setCompletionTime(timeTaken);

    if (wire.isCorrect) {
      setGameState('success');
      await saveGameProgress(true, timeTaken);
    } else {
      setIsExploding(true);
      setTimeout(() => {
        setGameState('failed');
        setIsExploding(false);
      }, 1500);
      await saveGameProgress(false, timeTaken);
    }
  };

  const saveGameProgress = async (success: boolean, timeTaken: number) => {
    if (!user) return;

    try {
      // Save game progress
      const { error: gameError } = await supabase
        .from('user_minigames_progress')
        .upsert({
          user_id: user.id,
          game_key: 'disarm_the_bomb',
          completed: success,
          score: success ? 3 : 0,
          last_played: new Date().toISOString()
        });

      if (gameError) throw gameError;

      if (success) {
        // Check if completed in under 5 seconds for bonus
        if (timeTaken <= 5) {
          const { error: bonusError } = await supabase
            .from('user_buzz_bonuses')
            .insert({
              user_id: user.id,
              bonus_type: 'discount',
              game_reference: 'disarm_the_bomb',
              awarded_at: new Date().toISOString()
            });

          if (!bonusError) {
            toast.success("BONUS VELOCITÀ!", {
              description: `Bomba disinnescata in ${timeTaken.toFixed(1)}s! Hai ottenuto un bonus sconto!`
            });
          }
        } else {
          toast.success("BOMBA DISINNESCATA!", {
            description: `Missione completata in ${timeTaken.toFixed(1)} secondi!`
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setSelectedClue(null);
    setWires([]);
    setIsExploding(false);
    setCompletionTime(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Bomb className="w-8 h-8 text-red-400" />
          <h2 className="text-2xl font-orbitron font-bold">
            <span className="text-red-400">DISINNESCA</span> <span className="text-white">LA BOMBA</span>
          </h2>
        </div>
        <p className="text-white/70 font-sans">Taglia il filo giusto prima che sia troppo tardi</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-full font-sans"
          >
            <Bomb className="w-5 h-5 mr-2" />
            INIZIA MISSIONE
          </Button>
        </div>
      )}

      {gameState === 'playing' && selectedClue && (
        <div className="space-y-6">
          {/* Clue */}
          <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-yellow-300 font-bold font-sans text-lg">
              🔍 INDIZIO: {selectedClue.text}
            </p>
          </div>

          {/* Bomb Visual */}
          <div className="relative">
            <motion.div 
              className="mx-auto w-32 h-20 bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg border-2 border-red-500 flex items-center justify-center"
              animate={isExploding ? { 
                scale: [1, 1.2, 0.8, 1.5], 
                backgroundColor: ['#374151', '#dc2626', '#f59e0b', '#ffffff'],
                rotate: [0, -5, 5, -10, 10, 0]
              } : {}}
              transition={{ duration: 1.5, repeat: isExploding ? 0 : Infinity, repeatType: 'reverse' }}
            >
              <Bomb className={`w-8 h-8 ${isExploding ? 'text-white' : 'text-red-400'}`} />
            </motion.div>

            {/* Wires */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {wires.map((wire) => (
                <motion.button
                  key={wire.id}
                  onClick={() => handleWireClick(wire)}
                  className="relative h-20 rounded-lg border-2 transition-all duration-300"
                  style={{ 
                    backgroundColor: wire.bgColor,
                    borderColor: wire.bgColor,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 0 20px ${wire.glowColor}`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isExploding}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white/90" />
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="text-xs font-bold text-white/80">{wire.color}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {gameState === 'success' && (
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-green-400 font-orbitron">
            BOMBA DISINNESCATA!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Missione completata in {completionTime.toFixed(1)} secondi
            {completionTime <= 5 && (
              <span className="block text-yellow-400 font-bold">
                🏆 BONUS VELOCITÀ SBLOCCATO!
              </span>
            )}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full font-sans"
          >
            NUOVA MISSIONE
          </Button>
        </motion.div>
      )}

      {/* Failed State */}
      {gameState === 'failed' && (
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          
          <h3 className="text-xl font-bold text-red-400 font-orbitron">
            ESPLOSIONE!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Filo sbagliato! La bomba è esplosa dopo {completionTime.toFixed(1)} secondi
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-full font-sans"
          >
            RIPROVA
          </Button>
        </motion.div>
      )}

      {/* Explosion Effect */}
      <AnimatePresence>
        {isExploding && (
          <motion.div
            className="absolute inset-0 bg-red-500/50 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.5, 1, 0],
              scale: [1, 1.1, 0.9, 1.2, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisarmTheBombGame;
