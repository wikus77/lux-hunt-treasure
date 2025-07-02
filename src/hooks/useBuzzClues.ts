
import { useState, useCallback, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  getNextVagueClue, 
  loadUnlockedCluesCount, 
  loadUsedVagueClues,
  saveUnlockedCluesCount,
  saveUsedVagueClues 
} from "@/utils/buzzClueUtils";
import { displayNewClueNotification, showCluesLimitReachedNotification, showCluesResetNotification } from "@/utils/buzzNotificationUtils";
import { BUZZ_STORAGE_KEYS, MAX_BUZZ_CLUES } from "@/utils/buzzConstants";

export const useBuzzClues = () => {
  // Initialize with saved unlocked clues count or 0
  const [unlockedClues, setUnlockedClues] = useState<number>(() => loadUnlockedCluesCount());
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>(() => loadUsedVagueClues());
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);

  // Use a function to get notifications to avoid the "Invalid hook call" error
  const getNotifications = () => {
    try {
      return useNotifications();
    } catch (e) {
      // Return a default object if called outside a component
      return {
        addNotification: null
      };
    }
  };

  const { addNotification } = getNotifications();

  // Save unlocked clues count to localStorage when it changes
  useEffect(() => {
    saveUnlockedCluesCount(unlockedClues);
  }, [unlockedClues]);

  // Save used vague clues to localStorage when they change
  useEffect(() => {
    saveUsedVagueClues(usedVagueClues);
  }, [usedVagueClues]);

  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    let updatedCount = 0;
    setUnlockedClues(prevCount => {
      // Ensure we don't exceed MAX_CLUES
      if (prevCount >= MAX_BUZZ_CLUES) {
        showCluesLimitReachedNotification();
        updatedCount = prevCount;
        return prevCount;
      }
      updatedCount = Math.min(prevCount + 1, MAX_BUZZ_CLUES);
      return updatedCount;
    });

    if (updatedCount && updatedCount <= MAX_BUZZ_CLUES) {
      setUsedVagueClues(prevUsed => {
        const nextClue = getNextVagueClue(prevUsed);
        setLastVagueClue(nextClue);
        const newUsed = [...prevUsed, nextClue];

        // Display notification for the new clue
        displayNewClueNotification(nextClue, addNotification);

        return newUsed;
      });
    }
    return updatedCount;
  }, [addNotification]);

  const resetUnlockedClues = useCallback(() => {
    setUnlockedClues(0);
    setUsedVagueClues([]);
    setLastVagueClue(null);

    localStorage.removeItem(BUZZ_STORAGE_KEYS.UNLOCKED_CLUES_COUNT);
    localStorage.removeItem(BUZZ_STORAGE_KEYS.USED_VAGUE_CLUES);
    
    showCluesResetNotification();
  }, []);

  return {
    unlockedClues,
    setUnlockedClues,
    usedVagueClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue: () => getNextVagueClue(usedVagueClues),
    MAX_CLUES: MAX_BUZZ_CLUES
  };
};
