
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GameCard, gameSymbols } from './gameData';

// Interfacce tipizzate per Supabase
interface UserMinigameProgress {
  id?: string;
  user_id: string;
  game_key: string;
  score: number;
  completed: boolean;
  last_played: string;
  created_at?: string;
}

interface UserBuzzBonus {
  id?: string;
  user_id: string;
  bonus_type: string;
  game_reference: string;
  used: boolean;
  awarded_at?: string;
  created_at?: string;
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
    const gameCards: GameCard[] = [];
    
    gameSymbols.forEach((symbolData, index) => {
      // Add two cards for each symbol
      gameCards.push(
        { 
          id: index * 2, 
          isFlipped: false, 
          isMatched: false, 
          value: symbolData.value,
          icon: symbolData.icon,
          symbol: symbolData.symbol
        },
        { 
          id: index * 2 + 1, 
          isFlipped: false, 
          isMatched: false, 
          value: symbolData.value,
          icon: symbolData.icon,
          symbol: symbolData.symbol
        }
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
      
      // Save progress to database con interfacce tipizzate
      const saveProgress = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const score = Math.max(1000 - (moves * 10) - timeElapsed, 100);
          
          // Dati tipizzati per user_minigames_progress
          const progressData: UserMinigameProgress = {
            user_id: user.id,
            game_key: 'memory_hack',
            score: score,
            completed: true,
            last_played: new Date().toISOString()
          };

          const { error: progressError } = await supabase
            .from('user_minigames_progress')
            .upsert(progressData, {
              onConflict: 'user_id,game_key'
            });

          if (progressError) {
            console.error('Error saving game progress:', progressError);
            return;
          }

          // Dati tipizzati per user_buzz_bonuses
          const bonusData: UserBuzzBonus = {
            user_id: user.id,
            bonus_type: 'memory_hack_completion',
            game_reference: 'memory_hack',
            used: false
          };

          const { error: bonusError } = await supabase
            .from('user_buzz_bonuses')
            .insert(bonusData);

          if (bonusError) {
            console.error('Error saving bonus:', bonusError);
          }

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
