
import { useState, useCallback, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { MAX_BUZZ_CLUES } from "@/utils/buzzConstants";
import { 
  loadUnlockedCluesCount, 
  loadUsedVagueClues,
  saveUnlockedCluesCount,
  saveUsedVagueClues 
} from "@/utils/buzzClueStorage";
import { getNextVagueClue, processClueIncrement } from "@/utils/buzzClueOperations";
import { showCluesResetNotification } from "@/utils/buzzNotificationUtils";

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
      const result = processClueIncrement(prevCount, usedVagueClues, addNotification);
      updatedCount = result.updatedCount;
      
      if (result.nextClue) {
        setUsedVagueClues(prev => [...prev, result.nextClue!]);
        setLastVagueClue(result.nextClue);
      }
      
      return updatedCount;
    });

    return updatedCount;
  }, [usedVagueClues, addNotification]);

  const resetUnlockedClues = useCallback(() => {
    setUnlockedClues(0);
    setUsedVagueClues([]);
    setLastVagueClue(null);

    localStorage.removeItem('unlockedCluesCount');
    localStorage.removeItem('usedVagueBuzzClues');
    
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
