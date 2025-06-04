
import { useState } from 'react';

export const useBuzzClues = () => {
  const [unlockedClues, setUnlockedClues] = useState(3);
  const MAX_CLUES = 10;

  const incrementUnlockedCluesAndAddClue = () => {
    setUnlockedClues(prev => Math.min(prev + 1, MAX_CLUES));
  };

  return {
    unlockedClues,
    incrementUnlockedCluesAndAddClue,
    MAX_CLUES,
  };
};
