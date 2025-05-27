
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

export const useBuzzHandling = () => {
  const { getActiveArea, calculateBuzzMapPrice } = useBuzzMapLogic();

  // Handle BUZZ button click - Updated for BUZZ MAPPA con messaggi allineati
  const handleBuzz = useCallback(() => {
    const activeArea = getActiveArea();
    if (activeArea) {
      // MESSAGGIO ALLINEATO: usa il valore ESATTO salvato in Supabase
      toast.success(`Area BUZZ MAPPA attiva: ${activeArea.radius_km.toFixed(1)} km`, {
        description: "L'area è già visibile sulla mappa"
      });
      console.log('📏 Messaggio popup con raggio ESATTO da Supabase:', activeArea.radius_km.toFixed(1), 'km');
    } else {
      toast.info("Premi BUZZ MAPPA per generare una nuova area di ricerca!");
    }
  }, [getActiveArea]);

  return {
    handleBuzz,
    buzzMapPrice: calculateBuzzMapPrice(),
    getActiveArea
  };
};
