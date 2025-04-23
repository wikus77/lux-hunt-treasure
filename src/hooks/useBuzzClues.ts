
import { useState, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { vagueBuzzClues } from "@/data/vagueBuzzClues";

// Una costante più realistica per il massimo numero di indizi
const MAX_CLUES = 4; // Ridotto da 1000 a 4 per riflettere il numero reale di indizi disponibili
const STORAGE_KEY = 'unlockedCluesCount';
const USED_CLUES_KEY = 'usedVagueBuzzClues';

function getNextVagueClue(usedClues: string[]) {
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) return vagueBuzzClues[0];
  return available[Math.floor(Math.random() * available.length)];
}

export const useBuzzClues = () => {
  // Inizializza lo stato con i valori da localStorage, defaulting a 0 se non presenti
  const [unlockedClues, setUnlockedClues] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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

  // Salva il conteggio sbloccato in localStorage ogni volta che cambia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, unlockedClues.toString());
    } catch (e) {
      console.error("Failed to save unlockedCluesCount to localStorage", e);
    }
  }, [unlockedClues]);

  // Salva gli indizi usati in localStorage ogni volta che cambiano
  useEffect(() => {
    try {
      localStorage.setItem(USED_CLUES_KEY, JSON.stringify(usedVagueClues));
    } catch (e) {
      console.error("Failed to save usedVagueBuzzClues to localStorage", e);
    }
  }, [usedVagueClues]);

  // Usa aggiornamenti funzionali e gestisci correttamente lo stato
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

    // Procedi solo per aggiungere un nuovo indizio se abbiamo effettivamente incrementato
    if (updatedCount && updatedCount <= MAX_CLUES) {
      setUsedVagueClues(prevUsed => {
        const nextClue = getNextVagueClue(prevUsed);
        setLastVagueClue(nextClue);
        const newUsed = [...prevUsed, nextClue];

        // Prova a inviare una notifica, fallback a toast se lo storage è pieno
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

    // Cancella i valori di localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USED_CLUES_KEY);
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
    MAX_CLUES // Esponi MAX_CLUES per garantire consistenza
  };
};
