
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Bomb, Scissors, CheckCircle, X } from 'lucide-react';
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
}

const ambiguousClues: Clue[] = [
  { text: "Il filo blu non è sicuro quanto sembra" },
  { text: "Due sono innocui, ma solo uno salva la missione" },
  { text: "Segui l'istinto, non i colori" },
  { text: "Evita l'eccessivamente ovvio..." },
  { text: "La salvezza è nel colore della natura" },
  { text: "Il fuoco non sempre brucia" },
  { text: "Il cielo nasconde pericoli" },
  { text: "L'oro porta fortuna agli agenti esperti" },
];

const DisarmTheBombGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'success' | 'failed'>('waiting');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [isExploding, setIsExploding] = useState(false);
  const [completionTime, setCompletionTime] = useState<number>(0);

  const initializeGame = useCallback(() => {
    const randomClue = ambiguousClues[Math.floor(Math.random() * ambiguousClues.length)];
    setSelectedClue(randomClue);
    
    const wireColors = [
      { color: 'Blu', bgColor: '#3399ff', glowColor: 'rgba(51, 153, 255, 0.6)' },
      { color: 'Rosso', bgColor: '#ff4d4d', glowColor: 'rgba(255, 77, 77, 0.6)' },
      { color: 'Giallo', bgColor: '#ffcc00', glowColor: 'rgba(255, 204, 0, 0.6)' },
      { color: 'Verde', bgColor: '#00cc66', glowColor: 'rgba(0, 204, 102, 0.6)' },
    ];

    // Randomly choose which wire is correct
    const correctIndex = Math.floor(Math.random() * 4);

    const gameWires = wireColors.map((wire, index) => ({
      id: index,
      color: wire.color,
      bgColor: wire.bgColor,
      glowColor: wire.glowColor,
      isCorrect: index === correctIndex,
    }));

    setWires(gameWires);
    setGameState('playing');
    setStartTime(Date.now());
    setTimeLeft(30);
    setIsExploding(false);
    setCompletionTime(0);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('failed');
          setIsExploding(true);
          setTimeout(() => setIsExploding(false), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

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
    setTimeLeft(30);
  };

  const timerPercentage = (timeLeft / 30) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#00D1FF]/30 rounded-full animate-pulse" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1 h-1 bg-red-400/40 rounded-full animate-pulse" style={{ top: '60%', right: '15%', animationDelay: '1s' }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00D1FF]/20 rounded-full animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Bomb className="w-8 h-8 text-red-400" />
          <h2 className="text-2xl font-orbitron font-bold">
            <span className="text-red-400 neon-text" style={{ 
              textShadow: "0 0 10px rgba(239, 68, 68, 0.6)"
            }}>DISINNESCA</span>{' '}
            <span className="text-white">LA BOMBA</span>
          </h2>
        </div>
        <p className="text-[#00D1FF] font-sans text-sm mb-1">Taglia il filo giusto per salvare la missione</p>
        <p className="text-white/60 font-sans text-xs">Hai solo una possibilità</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center relative z-10">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <Bomb className="w-5 h-5 mr-2" />
            INIZIA MISSIONE
          </Button>
        </div>
      )}

      {gameState === 'playing' && selectedClue && (
        <div className="space-y-6 relative z-10">
          {/* Timer */}
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={timeLeft > 10 ? "#00D1FF" : "#ff4d4d"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerPercentage / 100)}`}
                  className="transition-all duration-1000"
                  style={{
                    filter: timeLeft <= 10 ? 'drop-shadow(0 0 8px rgba(255, 77, 77, 0.8))' : 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.6))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-[#00D1FF]'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Clue */}
          <div className="text-center p-4 bg-gradient-to-r from-red-900/20 via-red-800/30 to-red-900/20 border border-red-500/30 rounded-xl">
            <p className="text-yellow-300 font-bold font-sans text-base">
              🔍 INDIZIO: {selectedClue.text}
            </p>
          </div>

          {/* Bomb Visual */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-32 h-24 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg border-2 border-red-500/70 flex items-center justify-center mb-6 relative"
              animate={isExploding ? { 
                scale: [1, 1.3, 0.9, 1.4], 
                backgroundColor: ['#374151', '#dc2626', '#f59e0b', '#ffffff'],
                rotate: [0, -10, 10, -15, 15, 0]
              } : {
                boxShadow: ['0 0 10px rgba(239, 68, 68, 0.3)', '0 0 20px rgba(239, 68, 68, 0.5)', '0 0 10px rgba(239, 68, 68, 0.3)']
              }}
              transition={{ 
                duration: isExploding ? 1.5 : 2, 
                repeat: isExploding ? 0 : Infinity, 
                repeatType: 'loop' 
              }}
            >
              <Bomb className={`w-10 h-10 ${isExploding ? 'text-white' : 'text-red-400'}`} />
              
              {/* Digital display */}
              <div className="absolute top-1 right-1 bg-black/80 px-2 py-1 rounded text-xs text-green-400 font-mono">
                {timeLeft.toString().padStart(2, '0')}
              </div>
            </motion.div>

            {/* Wires */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md">
              {wires.map((wire) => (
                <motion.button
                  key={wire.id}
                  onClick={() => handleWireClick(wire)}
                  className="relative h-16 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1"
                  style={{ 
                    backgroundColor: wire.bgColor,
                    borderColor: wire.bgColor,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 0 25px ${wire.glowColor}`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isExploding}
                >
                  <Scissors className="w-5 h-5 text-white/90" />
                  <span className="text-xs font-bold text-white/90">{wire.color}</span>
                  
                  {/* Wire connection to bomb */}
                  <div 
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-6 opacity-80"
                    style={{ backgroundColor: wire.bgColor }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
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
          
          <h3 className="text-xl font-bold text-green-400 font-orbitron">
            BOMBA DISINNESCATA!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            Missione completata in {completionTime.toFixed(1)} secondi
            {completionTime <= 5 && (
              <span className="block text-yellow-400 font-bold mt-2">
                🏆 BONUS VELOCITÀ SBLOCCATO!
              </span>
            )}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-full font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
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
          
          <h3 className="text-xl font-bold text-red-400 font-orbitron">
            ESPLOSIONE!
          </h3>
          
          <p className="text-white/70 mb-4 font-sans">
            {completionTime > 0 ? (
              <>Filo sbagliato! La bomba è esplosa dopo {completionTime.toFixed(1)} secondi</>
            ) : (
              <>Tempo scaduto! La bomba è esplosa</>
            )}
          </p>
          
          <Button 
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            RIPROVA
          </Button>
        </motion.div>
      )}

      {/* Explosion Effect */}
      <AnimatePresence>
        {isExploding && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/60 via-orange-500/70 to-red-500/60 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.7, 1, 0],
              scale: [1, 1.05, 0.98, 1.1, 1],
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
