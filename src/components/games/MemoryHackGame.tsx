
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Zap, Eye, Target, Lock, Star, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface GameCard {
  id: number;
  icon: React.ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryHackGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed' | 'failed'>('waiting');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);

  // Icons for the cards (8 pairs)
  const gameIcons = [
    <Brain className="w-6 h-6 text-[#00D1FF]" />,
    <Shield className="w-6 h-6 text-[#00D1FF]" />,
    <Zap className="w-6 h-6 text-[#00D1FF]" />,
    <Eye className="w-6 h-6 text-[#00D1FF]" />,
    <Target className="w-6 h-6 text-[#00D1FF]" />,
    <Lock className="w-6 h-6 text-[#00D1FF]" />,
    <Star className="w-6 h-6 text-[#00D1FF]" />,
    <Cpu className="w-6 h-6 text-[#00D1FF]" />
  ];

  // Initialize game
  const initializeGame = useCallback(() => {
    const pairs = gameIcons.concat(gameIcons);
    const shuffled = pairs
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setErrors(0);
    setTimeLeft(45);
    setGameState('playing');
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('failed');
    }
  }, [gameState, timeLeft]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isProcessing || flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      // Check if icons match (compare the type of the icon)
      const isMatch = firstCard.icon.type === secondCard.icon.type;

      setTimeout(() => {
        if (isMatch) {
          // Match found
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatchedPairs(prev => prev + 1);
        } else {
          // No match
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setErrors(prev => prev + 1);
        }
        
        setFlippedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === 8 && gameState === 'playing') {
      setGameState('completed');
      saveGameProgress();
    }
  }, [matchedPairs, gameState]);

  // Save progress to Supabase
  const saveGameProgress = async () => {
    if (!user) return;

    const isSuccess = errors <= 3 && timeLeft > 0;
    const score = isSuccess ? 10 : 0;

    try {
      const { error } = await supabase
        .from('user_minigames_progress')
        .upsert({
          user_id: user.id,
          game_key: 'memory_hack',
          completed: isSuccess,
          score: score,
          last_played: new Date().toISOString()
        });

      if (error) throw error;

      if (isSuccess) {
        // Add credits to user profile
        const { error: creditsError } = await supabase
          .from('profiles')
          .update({ credits: supabase.rpc('coalesce', { value: 'credits', fallback: 0 }) + 10 })
          .eq('id', user.id);

        if (!creditsError) {
          toast.success("Missione completata!", {
            description: `Hai guadagnato ${score} crediti!`
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-orbitron font-bold mb-2">
          <span className="text-[#00D1FF]">MEMORY</span> <span className="text-white">HACK</span>
        </h2>
        <p className="text-white/70">Trova tutte le coppie in 45 secondi</p>
      </div>

      {/* Game Stats */}
      {gameState === 'playing' && (
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex items-center gap-4">
            <span>Tempo: <span className="text-[#00D1FF] font-bold">{timeLeft}s</span></span>
            <span>Errori: <span className="text-red-400 font-bold">{errors}</span></span>
          </div>
          <div>
            Coppie: <span className="text-green-400 font-bold">{matchedPairs}/8</span>
          </div>
        </div>
      )}

      {/* Game Board */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="aspect-square cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
            >
              <Card className={`w-full h-full border-2 transition-all duration-300 ${
                card.isFlipped || card.isMatched 
                  ? 'border-[#00D1FF]/50 bg-[#00D1FF]/10' 
                  : 'border-white/20 bg-white/5 hover:border-[#00D1FF]/30'
              }`}>
                <CardContent className="flex items-center justify-center h-full p-0">
                  <AnimatePresence mode="wait">
                    {card.isFlipped || card.isMatched ? (
                      <motion.div
                        key="front"
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {card.icon}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 180 }}
                        transition={{ duration: 0.3 }}
                        className="w-6 h-6 bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 rounded"
                      />
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center">
        {gameState === 'waiting' && (
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full"
          >
            INIZIA MEMORY HACK
          </Button>
        )}

        {gameState === 'completed' && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              {errors <= 3 ? 'MISSIONE COMPLETATA!' : 'COMPLETATO'}
            </h3>
            <p className="text-white/70 mb-4">
              {errors <= 3 
                ? `Errori: ${errors}/3 - Hai guadagnato 10 crediti!`
                : `Troppi errori (${errors}) - Riprova per ottenere i crediti`
              }
            </p>
            <Button 
              onClick={resetGame}
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full"
            >
              GIOCA ANCORA
            </Button>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">TEMPO SCADUTO!</h3>
            <p className="text-white/70 mb-4">Riprova per completare la missione</p>
            <Button 
              onClick={resetGame}
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-8 py-3 rounded-full"
            >
              RIPROVA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryHackGame;
