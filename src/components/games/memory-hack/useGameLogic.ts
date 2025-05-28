
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GameCard {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  value: string;
}

export const useGameLogic = () => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isGameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGameComplete]);

  const generateCards = useCallback(() => {
    const symbols = ['🚗', '🏎️', '🚙', '🚕', '🚐', '🚛', '🏁', '⚡'];
    const gameCards: GameCard[] = [];
    
    symbols.forEach((symbol, index) => {
      // Add two cards for each symbol
      gameCards.push(
        { id: index * 2, isFlipped: false, isMatched: false, value: symbol },
        { id: index * 2 + 1, isFlipped: false, isMatched: false, value: symbol }
      );
    });
    
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    return gameCards;
  }, []);

  const startGame = useCallback(() => {
    const newCards = generateCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameComplete(false);
    setGameStarted(true);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  }, [generateCards]);

  const flipCard = useCallback((cardId: number) => {
    if (flippedCards.length >= 2 || isGameComplete) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
  }, [cards, flippedCards.length, isGameComplete]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === 8 && gameStarted) { // 8 pairs total
      setIsGameComplete(true);
      setIsTimerRunning(false);
      
      // Save progress to database
      const saveProgress = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const score = Math.max(1000 - (moves * 10) - timeElapsed, 100);
          
          // Use type assertion for now until types are updated
          await (supabase as any)
            .from('user_minigames_progress')
            .upsert({
              user_id: user.id,
              game_key: 'memory_hack',
              score: score,
              completed: true,
              last_played: new Date().toISOString()
            }, {
              onConflict: 'user_id,game_key'
            });

          // Award bonus
          await (supabase as any)
            .from('user_buzz_bonuses')
            .insert({
              user_id: user.id,
              bonus_type: 'memory_hack_completion',
              game_reference: 'memory_hack',
              used: false
            });

          toast.success(`Gioco completato! Punteggio: ${score}`);
        } catch (error) {
          console.error('Error saving game progress:', error);
        }
      };

      saveProgress();
    }
  }, [matchedPairs, gameStarted, moves, timeElapsed]);

  const resetGame = useCallback(() => {
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsGameComplete(false);
    setGameStarted(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  }, []);

  return {
    cards,
    flippedCards,
    matchedPairs,
    moves,
    isGameComplete,
    gameStarted,
    timeElapsed,
    startGame,
    flipCard,
    resetGame
  };
};
