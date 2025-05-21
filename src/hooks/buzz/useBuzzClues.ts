
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { loadUnlockedCluesCount, loadUsedVagueClues, saveUnlockedCluesCount, saveUsedVagueClues } from "@/utils/buzzClueStorage";
import { processClueIncrement } from "@/utils/buzzClueOperations";

export const MAX_BUZZ_CLUES = 10;

export function useBuzzClues() {
  const [unlockedClues, setUnlockedClues] = useState<number>(0);
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>([]);
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);
  
  useEffect(() => {
    // Carica il conteggio degli indizi sbloccati dal localStorage
    const savedCount = loadUnlockedCluesCount();
    setUnlockedClues(savedCount);
    
    // Carica gli indizi vaghi usati da localStorage
    const savedUsedClues = loadUsedVagueClues();
    setUsedVagueClues(savedUsedClues);
    
    // Aggiungi una registrazione per debug
    console.log(`Indizi sbloccati caricati: ${savedCount}`);
  }, []);
  
  // Funzione per incrementare gli indizi sbloccati e aggiungerne uno nuovo
  const incrementUnlockedCluesAndAddClue = useCallback(() => {
    const addNotification = (notification: any) => {
      // Utilizza toast come fallback per le notifiche
      toast.success(notification.title, {
        description: notification.description
      });
      return true;
    };
    
    const { updatedCount, nextClue } = processClueIncrement(
      unlockedClues,
      usedVagueClues,
      addNotification
    );
    
    // Aggiorna lo stato locale
    setUnlockedClues(updatedCount);
    
    // Salva nel localStorage
    saveUnlockedCluesCount(updatedCount);
    
    // Aggiorna gli indizi vaghi utilizzati se ne è stato generato uno nuovo
    if (nextClue) {
      const newUsedClues = [...usedVagueClues, nextClue];
      setUsedVagueClues(newUsedClues);
      setLastVagueClue(nextClue);
      saveUsedVagueClues(newUsedClues);
    }
    
    console.log(`Indizi sbloccati aggiornati: ${updatedCount}`);
    
    return { updatedCount, nextClue };
  }, [unlockedClues, usedVagueClues]);

  // Funzione per resettare gli indizi sbloccati
  const resetUnlockedClues = useCallback(() => {
    setUnlockedClues(0);
    setUsedVagueClues([]);
    setLastVagueClue(null);
    saveUnlockedCluesCount(0);
    saveUsedVagueClues([]);
    
    console.log('Indizi sbloccati resettati');
  }, []);
  
  // Funzione per ottenere un nuovo indizio vago
  const getNextVagueClue = useCallback(() => {
    // Implementazione base per ottenere un nuovo indizio vago
    // In un'implementazione reale, questo potrebbe essere più complesso e utilizzare un algoritmo di selezione
    const vagueClues = [
      "Cerca vicino all'acqua",
      "Guarda dove il sole tramonta",
      "Il premio si trova in un luogo affollato",
      "Cerca in alto, non in basso",
      "Il premio è nascosto in pianura"
    ];
    
    // Trova un indizio che non è stato ancora utilizzato
    const unusedClues = vagueClues.filter(clue => !usedVagueClues.includes(clue));
    
    // Se tutti gli indizi sono stati utilizzati, ritorna il primo indizio della lista
    if (unusedClues.length === 0) {
      return vagueClues[0];
    }
    
    // Altrimenti, ritorna un indizio casuale non utilizzato
    return unusedClues[Math.floor(Math.random() * unusedClues.length)];
  }, [usedVagueClues]);
  
  return {
    unlockedClues,
    setUnlockedClues,
    usedVagueClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue,
    MAX_CLUES: MAX_BUZZ_CLUES
  };
}
