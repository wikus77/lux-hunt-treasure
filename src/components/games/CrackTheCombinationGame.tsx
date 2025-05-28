import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Lock, CheckCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Attempt {
  combination: number[];
  feedback: {
    correct: number;
    wrongPosition: number;
    wrong: number;
  };
}

const CrackTheCombinationGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'success' | 'failed'>('waiting');
  const [targetCombination, setTargetCombination] = useState<number[]>([]);
  const [currentCombination, setCurrentCombination] = useState<number[]>([0, 0, 0]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const generateRandomCombination = useCallback(() => {
    return [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
  }, []);

  const initializeGame = useCallback(() => {
    const newTarget = generateRandomCombination();
    setTargetCombination(newTarget);
    setCurrentCombination([0, 0, 0]);
    setAttempts([]);
    setGameState('playing');
    setIsUnlocking(false);
    if (process.env.NODE_ENV === 'development') {
      console.log('Target combination:', newTarget);
    }
  }, [generateRandomCombination]);

  const calculateFeedback = useCallback((guess: number[], target: number[]) => {
    let correct = 0;
    let wrongPosition = 0;
    const targetCopy = [...target];
    const guessCopy = [...guess];

    // First pass: count exact matches
    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] === targetCopy[i]) {
        correct++;
        targetCopy[i] = -1; // Mark as used
        guessCopy[i] = -2; // Mark as used
      }
    }

    // Second pass: count wrong positions
    for (let i = 0; i < 3; i++) {
      if (guessCopy[i] >= 0) {
        const targetIndex = targetCopy.indexOf(guessCopy[i]);
        if (targetIndex !== -1) {
          wrongPosition++;
          targetCopy[targetIndex] = -1; // Mark as used
        }
      }
    }

    return {
      correct,
      wrongPosition,
      wrong: 3 - correct - wrongPosition
    };
  }, []);

  const submitAttempt = async () => {
    if (gameState !== 'playing') return;

    const feedback = calculateFeedback(currentCombination, targetCombination);
    const newAttempt: Attempt = {
      combination: [...currentCombination],
      feedback
    };

    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);

    // Check if combination is correct
    if (feedback.correct === 3) {
      setIsUnlocking(true);
      setTimeout(async () => {
        setGameState('success');
        await saveGameProgress(true, newAttempts.length === 1);
      }, 2000);
      return;
    }

    // Check if max attempts reached
    if (newAttempts.length >= 5) {
      setGameState('failed');
      await saveGameProgress(false, false);
    }
  };

  const saveGameProgress = async (success: boolean, firstTry: boolean) => {
    if (!user) return;

    try {
      if (success) {
        if (firstTry) {
          toast.success("COMBINAZIONE CRACCATA!", {
            description: "Primo tentativo! Perfetto!"
          });
        } else {
          toast.success("COMBINAZIONE CRACCATA!", {
            description: `Cassaforte sbloccata in ${attempts.length + 1} tentativi!`
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const updateDigit = (index: number, value: number) => {
    if (gameState !== 'playing') return;
    const newCombination = [...currentCombination];
    newCombination[index] = value;
    setCurrentCombination(newCombination);
  };

  const resetGame = () => {
    setGameState('waiting');
    setAttempts([]);
    setCurrentCombination([0, 0, 0]);
    setTargetCombination([]);
    setIsUnlocking(false);
  };

  const getFeedbackColor = (digit: number, index: number, attempt: Attempt) => {
    if (attempt.combination[index] === targetCombination[index]) {
      return 'text-green-400 bg-green-400/20';
    }
    if (targetCombination.includes(attempt.combination[index])) {
      return 'text-yellow-400 bg-yellow-400/20';
    }
    return 'text-gray-400 bg-gray-600/20';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#00D1FF]/30 rounded-full animate-pulse" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1 h-1 bg-yellow-400/40 rounded-full animate-pulse" style={{ top: '60%', right: '15%', animationDelay: '1s' }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00D1FF]/20 rounded-full animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Lock className="w-8 h-8 text-[#00D1FF]" />
          <h2 className="text-2xl font-orbitron font-bold tracking-widest">
            <span className="text-[#00D1FF] neon-text" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6)"
            }}>CRACCA</span>{' '}
            <span className="text-white">LA COMBINAZIONE</span>
          </h2>
        </div>
        <p className="text-[#00D1FF] font-sans text-sm mb-1">Trova la combinazione di 3 cifre</p>
        <p className="text-white/60 font-sans text-xs">Hai 5 tentativi massimo</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center relative z-10">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            <Lock className="w-5 h-5 mr-2" />
            INIZIA MISSIONE
          </Button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6 relative z-10">
          {/* Safe Visual */}
          <div className="flex justify-center mb-6">
            <motion.div 
              className="w-40 h-32 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg border-2 border-[#00D1FF]/70 flex items-center justify-center relative"
              animate={isUnlocking ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
                borderColor: ['rgba(0, 209, 255, 0.7)', 'rgba(34, 197, 94, 0.8)', 'rgba(0, 209, 255, 0.7)']
              } : {
                boxShadow: ['0 0 10px rgba(0, 209, 255, 0.3)', '0 0 20px rgba(0, 209, 255, 0.5)', '0 0 10px rgba(0, 209, 255, 0.3)']
              }}
              transition={{ 
                duration: isUnlocking ? 2 : 2, 
                repeat: isUnlocking ? 0 : Infinity, 
                repeatType: 'loop' 
              }}
            >
              <Lock className={`w-12 h-12 ${isUnlocking ? 'text-green-400' : 'text-[#00D1FF]'}`} />
              
              {/* Digital display */}
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-green-400 font-mono">
                {5 - attempts.length}
              </div>
            </motion.div>
          </div>

          {/* Combination Wheels */}
          <div className="flex justify-center gap-6 mb-6">
            {currentCombination.map((digit, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-[#00D1FF] mb-2 font-bold">CIFRA {index + 1}</div>
                <div className="relative">
                  {/* Up button */}
                  <button
                    onClick={() => updateDigit(index, (digit + 1) % 10)}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#00D1FF]/20 border border-[#00D1FF]/40 rounded-full flex items-center justify-center text-[#00D1FF] hover:bg-[#00D1FF]/30 transition-all"
                  >
                    ▲
                  </button>
                  
                  {/* Number display */}
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-[#00D1FF]/60 rounded-xl flex items-center justify-center text-2xl font-bold text-white font-mono"
                    whileHover={{ scale: 1.05 }}
                    style={{
                      boxShadow: '0 0 15px rgba(0, 209, 255, 0.3)'
                    }}
                  >
                    {digit}
                  </motion.div>
                  
                  {/* Down button */}
                  <button
                    onClick={() => updateDigit(index, (digit - 1 + 10) % 10)}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#00D1FF]/20 border border-[#00D1FF]/40 rounded-full flex items-center justify-center text-[#00D1FF] hover:bg-[#00D1FF]/30 transition-all"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center mb-6">
            <Button 
              onClick={submitAttempt}
              disabled={attempts.length >= 5}
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans font-bold tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
            >
              PROVA COMBINAZIONE
            </Button>
          </div>

          {/* Attempts History */}
          {attempts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-center text-white font-bold">TENTATIVI:</h3>
              {attempts.map((attempt, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800/50 border border-white/10 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">Tentativo {index + 1}:</span>
                    <div className="flex gap-2">
                      {attempt.combination.map((digit, digitIndex) => (
                        <span 
                          key={digitIndex}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${getFeedbackColor(digit, digitIndex, attempt)}`}
                        >
                          {digit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-white/70">
                    <span className="text-green-400">{attempt.feedback.correct} GIUSTE</span>
                    {attempt.feedback.wrongPosition > 0 && (
                      <span className="text-yellow-400 ml-3">{attempt.feedback.wrongPosition} FUORI POSIZIONE</span>
                    )}
                    {attempt.feedback.wrong > 0 && (
                      <span className="text-gray-400 ml-3">{attempt.feedback.wrong} ERRATE</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {gameState === 'success' && (
        <motion.div 
          className="text-center space-y-4 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" style={{
              filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.6))'
            }} />
            
            {/* Success glow effect */}
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/20 blur-xl" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-green-400 font-orbitron tracking-widest">
            COMBINAZIONE CRACCATA!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Cassaforte sbloccata in {attempts.length} tentativ{attempts.length === 1 ? 'o' : 'i'}
            {attempts.length === 1 && (
              <span className="block text-yellow-400 font-bold mt-2">
                🏆 PRIMO TENTATIVO! PERFETTO!
              </span>
            )}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            NUOVA MISSIONE
          </Button>
        </motion.div>
      )}

      {/* Failed State */}
      {gameState === 'failed' && (
        <motion.div 
          className="text-center space-y-4 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" style={{
            filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))'
          }} />
          
          <h3 className="text-xl font-bold text-red-400 font-orbitron tracking-widest">
            CASSAFORTE BLOCCATA
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Hai esaurito i 5 tentativi. La combinazione era: {targetCombination.join('-')}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            RIPROVA
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CrackTheCombinationGame;
