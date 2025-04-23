
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
  const [unlockedClues, setUnlockedClues] = useState(0);
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>([]);
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    const newCount = Math.min(unlockedClues + 1, MAX_CLUES);
    setUnlockedClues(newCount);
    
    const nextClue = getNextVagueClue(usedVagueClues);
    setLastVagueClue(nextClue);
    
    const updated = [...usedVagueClues, nextClue];
    setUsedVagueClues(updated);

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
