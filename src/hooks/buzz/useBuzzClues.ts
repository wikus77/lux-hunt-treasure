
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { loadUnlockedCluesCount, saveUnlockedCluesCount } from "@/utils/buzzClueStorage";
import { processClueIncrement } from "@/utils/buzzClueOperations";

export const MAX_BUZZ_CLUES = 10;

export function useBuzzClues() {
  const [unlockedClues, setUnlockedClues] = useState<number>(0);
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>([]);
  
  useEffect(() => {
    // Carica il conteggio degli indizi sbloccati dal localStorage
    const savedCount = loadUnlockedCluesCount();
    setUnlockedClues(savedCount);
    
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
    }
    
    console.log(`Indizi sbloccati aggiornati: ${updatedCount}`);
    
    return { updatedCount, nextClue };
  }, [unlockedClues, usedVagueClues]);
  
  return {
    unlockedClues,
    setUnlockedClues,
    usedVagueClues,
    incrementUnlockedCluesAndAddClue,
    MAX_CLUES: MAX_BUZZ_CLUES
  };
}
