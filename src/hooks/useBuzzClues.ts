
import { useState, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { vagueBuzzClues } from "@/data/vagueBuzzClues";

const MAX_CLUES = 1000;
const STORAGE_KEY = 'unlockedCluesCount';
const USED_CLUES_KEY = 'usedVagueBuzzClues';

function getNextVagueClue(usedClues: string[]) {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0];
  return available[Math.floor(Math.random() * available.length)];
}

export const useBuzzClues = () => {
  const [unlockedClues, setUnlockedClues] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Default to 0 if no saved value exists
      return saved ? Math.min(parseInt(saved, 10), MAX_CLUES) : 0;
    } catch (e) {
      console.error("Error loading unlocked clues count:", e);
      return 0;
    }
  });

  const [usedVagueClues, setUsedVagueClues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(USED_CLUES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading used clues:", e);
      return [];
    }
  });

  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, unlockedClues.toString());
    } catch (e) {
      console.error("Failed to save unlockedCluesCount to localStorage", e);
    }
  }, [unlockedClues]);

  useEffect(() => {
    try {
      localStorage.setItem(USED_CLUES_KEY, JSON.stringify(usedVagueClues));
    } catch (e) {
      console.error("Failed to save usedVagueBuzzClues to localStorage", e);
    }
  }, [usedVagueClues]);

  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    let updatedCount = 0;
    setUnlockedClues(prevCount => {
      if (prevCount >= MAX_CLUES) {
        toast("Hai già sbloccato tutti gli indizi disponibili!", {
          duration: 3000,
          position: "top-center"
        });
        updatedCount = prevCount;
        return prevCount;
      }
      updatedCount = Math.min(prevCount + 1, MAX_CLUES);
      return updatedCount;
    });

    if (updatedCount && updatedCount <= MAX_CLUES) {
      setUsedVagueClues(prevUsed => {
        const nextClue = getNextVagueClue(prevUsed);
        setLastVagueClue(nextClue);
        const newUsed = [...prevUsed, nextClue];

        const success = addNotification?.({
          title: "Nuovo indizio extra!",
          description: nextClue
        });

        if (!success) {
          toast("Nuovo indizio extra! " + nextClue, { duration: 5000 });
        }

        return newUsed;
      });
    }
    return updatedCount;
  }, [addNotification]);

  const resetUnlockedClues = useCallback(() => {
    setUnlockedClues(0);
    setUsedVagueClues([]);
    setLastVagueClue(null);

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USED_CLUES_KEY);
    
    toast.info("Contatore degli indizi azzerato", { 
      duration: 3000 
    });
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
    MAX_CLUES
  };
};
