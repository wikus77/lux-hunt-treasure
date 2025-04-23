
import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import useBuzzSound from "@/hooks/useBuzzSound";
import { vagueBuzzClues } from "@/data/vagueBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";

function getNextVagueClue(usedClues: string[]) {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0];
  return available[Math.floor(Math.random() * available.length)];
}

export const useBuzzClues = () => {
  const [unlockedClues, setUnlockedClues] = useState(() => {
    const saved = localStorage.getItem('unlockedCluesCount');
    return saved ? parseInt(saved) : 0;
  });
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>(() => {
    const saved = localStorage.getItem('usedVagueBuzzClues');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    const newCount = unlockedClues + 1;
    setUnlockedClues(newCount);
    localStorage.setItem('unlockedCluesCount', newCount.toString());
    const nextClue = getNextVagueClue(usedVagueClues);
    setLastVagueClue(nextClue);
    const updated = [...usedVagueClues, nextClue];
    setUsedVagueClues(updated);
    try {
      localStorage.setItem('usedVagueBuzzClues', JSON.stringify(updated));
    } catch (e) {
      // storage full, ignore
    }
    // Try to push notifica, fallback to toast pure string if storage full
    const success = addNotification?.({
      title: "Nuovo indizio extra!",
      description: nextClue
    });
    if (!success) {
      toast("Nuovo indizio extra! " + nextClue, { duration: 5000 });
    }
  // eslint-disable-next-line
  }, [unlockedClues, usedVagueClues, addNotification]);

  return {
    unlockedClues,
    setUnlockedClues,
    usedVagueClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    getNextVagueClue: () => getNextVagueClue(usedVagueClues)
  };
};
