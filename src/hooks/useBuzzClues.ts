
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { vagueBuzzClues } from "@/data/vagueBuzzClues";

const MAX_CLUES = 1000; // Consistent max clues limit

function getNextVagueClue(usedClues: string[]) {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0];
  return available[Math.floor(Math.random() * available.length)];
}

export const useBuzzClues = () => {
  // Initialize from localStorage with fallback to 0
  const [unlockedClues, setUnlockedClues] = useState(() => {
    try {
      const saved = localStorage.getItem('unlockedCluesCount');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('usedVagueBuzzClues');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    const newCount = Math.min(unlockedClues + 1, MAX_CLUES);
    setUnlockedClues(newCount);
    
    // Save to localStorage
    try {
      localStorage.setItem('unlockedCluesCount', newCount.toString());
    } catch (e) {
      // Storage full, ignore
      console.error("Failed to save unlockedCluesCount to localStorage", e);
    }
    
    const nextClue = getNextVagueClue(usedVagueClues);
    setLastVagueClue(nextClue);
    
    const updated = [...usedVagueClues, nextClue];
    setUsedVagueClues(updated);
    
    // Save used clues to localStorage
    try {
      localStorage.setItem('usedVagueBuzzClues', JSON.stringify(updated));
    } catch (e) {
      // Storage full, ignore
      console.error("Failed to save usedVagueBuzzClues to localStorage", e);
    }

    // Try to push notification, fallback to toast if storage full
    const success = addNotification?.({
      title: "Nuovo indizio extra!",
      description: nextClue
    });
    
    if (!success) {
      toast("Nuovo indizio extra! " + nextClue, { duration: 5000 });
    }

    return newCount;
  }, [unlockedClues, usedVagueClues, addNotification]);

  const resetUnlockedClues = () => {
    setUnlockedClues(0);
    setUsedVagueClues([]);
    setLastVagueClue(null);
    
    // Clear localStorage values
    localStorage.removeItem('unlockedCluesCount');
    localStorage.removeItem('usedVagueBuzzClues');
  };

  return {
    unlockedClues,
    setUnlockedClues,
    usedVagueClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue: () => getNextVagueClue(usedVagueClues)
  };
};
