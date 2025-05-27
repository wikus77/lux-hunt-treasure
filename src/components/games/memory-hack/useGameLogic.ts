
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
  const [disableInteraction, setDisableInteraction] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    // Create pairs by duplicating each icon with unique IDs
    const pairs: GameCard[] = [];
    gameIconsData.forEach((iconData, index) => {
      // First card of the pair
      pairs.push({
        id: index * 2,
        symbol: iconData.type,
        icon: iconData.icon,
        isFlipped: false,
        isMatched: false
      });
      // Second card of the pair
      pairs.push({
        id: index * 2 + 1,
        symbol: iconData.type,
        icon: iconData.icon,
        isFlipped: false,
        isMatched: false
      });
    });
    
    // Shuffle the cards
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setErrors(0);
    setTimeLeft(45);
    setDisableInteraction(false);
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
    // Prevent clicks if interactions are disabled or card is already flipped/matched
    const targetCard = cards.find(card => card.id === cardId);
    if (disableInteraction || !targetCard || targetCard.isFlipped || targetCard.isMatched) {
      return;
    }

    // Prevent more than 2 cards being flipped
    if (flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setDisableInteraction(true);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (!firstCard || !secondCard) {
        setDisableInteraction(false);
        return;
      }

      // Compare symbols (strings)
      const isMatch = firstCard.symbol === secondCard.symbol;

      setTimeout(() => {
        if (isMatch) {
          // Match found - mark as matched and keep visible
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true, isFlipped: true } 
              : card
          ));
          setMatchedPairs(prev => prev + 1);
        } else {
          // No match - flip cards back
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setErrors(prev => prev + 1);
        }
        
        setFlippedCards([]);
        setDisableInteraction(false);
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
    isProcessing: disableInteraction,
    handleCardClick,
    initializeGame,
    resetGame
  };
};
