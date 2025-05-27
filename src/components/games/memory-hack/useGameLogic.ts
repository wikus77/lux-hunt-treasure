
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { gameIconsData, type GameCard, type GameState } from './gameData';

export const useGameLogic = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const pairs = gameIconsData.concat(gameIconsData);
    const shuffled = pairs
      .map((iconData, index) => ({
        id: index,
        iconType: iconData.type,
        icon: iconData.icon,
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

      // Check if icons match using the iconType string
      const isMatch = firstCard.iconType === secondCard.iconType;

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
        // Add credits to user profile using proper update query
        const { data: currentProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (!fetchError && currentProfile) {
          const currentCredits = currentProfile.credits || 0;
          const { error: creditsError } = await supabase
            .from('profiles')
            .update({ credits: currentCredits + 10 })
            .eq('id', user.id);

          if (!creditsError) {
            toast.success("Missione completata!", {
              description: `Hai guadagnato ${score} crediti!`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
  };

  return {
    gameState,
    cards,
    flippedCards,
    matchedPairs,
    errors,
    timeLeft,
    isProcessing,
    handleCardClick,
    initializeGame,
    resetGame
  };
};
