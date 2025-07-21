
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";

export const usePaymentEffects = (generateSearchArea: (radius: number) => string | null) => {
  const [showCluePopup, setShowCluePopup] = useState(false);
  const [clueMessage, setClueMessage] = useState("");
  const [processedSessionIds, setProcessedSessionIds] = useState<Set<string>>(new Set());
  const [isMapBuzzActive, setIsMapBuzzActive] = useState(false);
  
  const location = useLocation();
  const { incrementUnlockedCluesAndAddClue } = useBuzzClues();
  const { addNotification } = useNotifications();

  useEffect(() => {
    try {
      if (
        location.state?.paymentCompleted && 
        location.state?.mapBuzz &&
        location.state?.sessionId && 
        !processedSessionIds.has(location.state.sessionId)
      ) {
        setProcessedSessionIds(prev => new Set(prev).add(location.state.sessionId));
        
        const clue = location.state?.clue;
        incrementUnlockedCluesAndAddClue();
        
        if (clue && clue.description) {
          setTimeout(() => {
            setClueMessage(clue.description);
            setShowCluePopup(true);

            addNotification({
              title: "Nuovo indizio sbloccato",
              description: clue.description,
            });

            // Fix: Pass a default radius value (e.g. 50000 for 50km) to generateSearchArea
            const generatedAreaId = generateSearchArea(50000);
            
            if (generatedAreaId) {
              toast.success("Area di ricerca generata!", {
                description: "Controlla la mappa per vedere la nuova area basata sugli indizi disponibili."
              });
            }
          }, 1000);
        }
      }
    } catch (e) {
      console.error("Errore nell'elaborazione dello stato:", e);
    }
  }, [location.state, generateSearchArea, incrementUnlockedCluesAndAddClue, addNotification, processedSessionIds]);

  return {
    showCluePopup,
    setShowCluePopup,
    clueMessage,
    setClueMessage,
    isMapBuzzActive,
    setIsMapBuzzActive
  };
};
