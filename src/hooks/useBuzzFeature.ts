import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import useBuzzSound from "@/hooks/useBuzzSound";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useBuzzUiState } from "@/hooks/buzz/useBuzzUiState";
import { useBuzzNavigation } from "@/hooks/buzz/useBuzzNavigation";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { supabase } from "@/integrations/supabase/client";

export function useBuzzFeature() {
  const { showDialog, setShowDialog, showExplosion, setShowExplosion, 
          showClueBanner, setShowClueBanner, handleExplosionCompleted } = useBuzzUiState();
  
  const { navigate, location, navigateToPaymentMethods, navigateToNotifications } = useBuzzNavigation();
  
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound, playSound } = useBuzzSound();
  const { addNotification, reloadNotifications } = useNotifications();
  const { createBuzzNotification } = useNotificationManager();
  const { callBuzzApi } = useBuzzApi();

  const {
    unlockedClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue
  } = useBuzzClues();

  const [cachedUserId, setCachedUserId] = useState<string | null>(null);
  const [lastDynamicClue, setLastDynamicClue] = useState<string>("");

  useEffect(() => {
    const prefetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        setCachedUserId(sessionData.session.user.id);
      }
    };

    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    
    Promise.all([
      prefetchUserId(),
      initializeSound(soundPreference, volume)
    ]).catch(error => console.error("Error during initialization:", error));
    
    if (location.state?.paymentCompleted && location.state?.fromRegularBuzz) {
      try {
        savePaymentMethod();
        setShowExplosion(true);
      } catch (error) {
        console.error("Error handling payment completion:", error);
      }
    }
  }, [location.state, savePaymentMethod, navigate, initializeSound]);

  const handleBuzzClick = async () => {
    if (!hasPaymentMethod) {
      navigateToPaymentMethods(getNextVagueClue());
      return;
    }
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = cachedUserId || sessionData?.session?.user?.id;
      
      if (!userId) {
        toast.error("Devi effettuare l'accesso per utilizzare questa funzione");
        return;
      }
      
      setShowDialog(true);
      
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      // Salva il contenuto dinamico reale
      const dynamicClueContent = response.clue_text || "Hai sbloccato un nuovo indizio!";
      setLastDynamicClue(dynamicClueContent);
      setLastVagueClue(dynamicClueContent);
      
      setTimeout(() => {
        setShowDialog(false);
        
        // Registra immediatamente la notifica con contenuto dinamico
        createBuzzNotification(
          "Nuovo Indizio Buzz!", 
          dynamicClueContent
        ).then(() => {
          reloadNotifications();
          
          toast.success("Hai ricevuto un nuovo indizio!", {
            description: dynamicClueContent,
            duration: 3000,
          });
          
          setShowExplosion(true);
        }).catch(error => {
          console.error("Error creating notification:", error);
          toast.error("Errore nel salvataggio dell'indizio", {
            duration: 3000,
          });
        });
      }, 1500);
    } catch (error) {
      console.error("Error in buzz process:", error);
      toast.error("Si è verificato un errore");
      setShowDialog(false);
    }
  };

  const handleClueButtonClick = async () => {
    playSound();
    
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = cachedUserId || sessionData?.session?.user?.id;
    
    if (!userId) {
      toast.error("Devi effettuare l'accesso per utilizzare questa funzione");
      return;
    }
    
    setShowDialog(true);
    
    try {
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      const newClue = response.clue_text || "";
      setLastVagueClue(newClue);
      setLastDynamicClue(newClue);
      
      incrementUnlockedCluesAndAddClue();
      
      createBuzzNotification(
        "Nuovo Indizio Extra!", 
        newClue
      ).then(() => {
        reloadNotifications();
        
        toast.success("Hai ricevuto un nuovo indizio!", {
          description: newClue,
          duration: 3000,
        });
        
        setShowDialog(false);
        setShowExplosion(true);
      }).catch(error => {
        console.error("Error creating notification:", error);
        toast.error("Errore nel salvataggio dell'indizio", {
          duration: 3000,
        });
        setShowDialog(false);
      });
    } catch (error) {
      console.error("Error in handle clue button click:", error);
      toast.error("Si è verificato un errore");
      setShowDialog(false);
    }
  };

  const handlePayment = () => {
    setShowDialog(false);
    setTimeout(() => {
      navigateToPaymentMethods(getNextVagueClue());
    }, 400);
  };

  const handleExplosionCompletedCallback = () => {
    handleExplosionCompleted(() => {
      incrementUnlockedCluesAndAddClue();
      setShowClueBanner(true);
      
      setTimeout(() => {
        navigateToNotifications();
      }, 1800);
    });
  };

  const handleResetClues = () => {
    resetUnlockedClues();
    toast.success("Tutti gli indizi sono stati azzerati", {
      duration: 3000,
    });
  };

  return {
    showDialog,
    setShowDialog,
    showExplosion,
    showClueBanner,
    setShowClueBanner,
    unlockedClues,
    lastDynamicClue,
    handleBuzzClick,
    handleClueButtonClick,
    handlePayment,
    handleExplosionCompleted: handleExplosionCompletedCallback,
    handleResetClues
  };
}
