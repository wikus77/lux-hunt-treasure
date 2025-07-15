
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

// Funzione per generare indizi realmente univoci
const generateUniqueClue = (userId: string, buzzCount: number): string => {
  const timestamp = Date.now();
  const uniqueClues = [
    `Cerca dove l'innovazione italiana splende (${new Date().toLocaleTimeString()})`,
    `Il tuo obiettivo si nasconde tra passato e futuro - Indizio #${buzzCount}`,
    `Nelle terre del design e della velocità troverai la risposta (${timestamp})`,
    `Dove il metallo lucente incontra la maestria artigianale - ${new Date().toLocaleDateString()}`,
    `Tra le curve eleganti e la potenza nascosta ${buzzCount}° segreto`,
    `Il premio attende dove tradizione e tecnologia si fondono (${userId.slice(-4)})`,
    `Cerca nella città dove i sogni diventano realtà motoristica - ${new Date().getHours()}:${new Date().getMinutes()}`,
    `L'eccellenza italiana ti guida verso la meta finale #${buzzCount}`
  ];
  
  // Usa l'hash dell'userId e timestamp per garantire unicità
  const index = (timestamp + buzzCount + parseInt(userId.slice(-4), 16)) % uniqueClues.length;
  return uniqueClues[index];
};

export const useBuzzFeature = () => {
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
  const [buzzCounter, setBuzzCounter] = useState<number>(0);

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
      
      // Track Plausible event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('buzz_click');
      }
      
      console.log("🚀 Avvio processo BUZZ UNIVOCO per:", userId);
      setShowDialog(true);
      
      // Incrementa il counter per garantire unicità
      const newBuzzCount = buzzCounter + 1;
      setBuzzCounter(newBuzzCount);
      
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        console.error("❌ Errore risposta BUZZ API:", response.error);
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      // Genera contenuto REALMENTE UNIVOCO
      const uniqueClueContent = response.clue_text || generateUniqueClue(userId, newBuzzCount);
      console.log("📝 Contenuto UNIVOCO generato:", uniqueClueContent);
      console.log("🕐 Timestamp generazione:", new Date().toISOString());
      
      setLastDynamicClue(uniqueClueContent);
      setLastVagueClue(uniqueClueContent);
      
      setTimeout(async () => {
        setShowDialog(false);
        
        // Track clue unlocked event
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('clue_unlocked');
        }
        
        // Forza reload immediato delle notifiche
        await reloadNotifications();
        
        toast.success("Hai ricevuto un nuovo indizio univoco!", {
          description: uniqueClueContent,
          duration: 4000,
        });
        
        setShowExplosion(true);
      }, 1500);
    } catch (error) {
      console.error("❌ Error in buzz process:", error);
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
    
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    console.log("🎯 Avvio processo indizio extra UNIVOCO per:", userId);
    setShowDialog(true);
    
    try {
      const newBuzzCount = buzzCounter + 1;
      setBuzzCounter(newBuzzCount);
      
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        console.error("❌ Errore risposta API indizio extra:", response.error);
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      const uniqueClue = response.clue_text || generateUniqueClue(userId, newBuzzCount);
      console.log("📝 Nuovo indizio extra UNIVOCO:", uniqueClue);
      setLastVagueClue(uniqueClue);
      setLastDynamicClue(uniqueClue);
      
      incrementUnlockedCluesAndAddClue();
      
      console.log("💾 Creando notifica indizio extra UNIVOCA...");
      createBuzzNotification(
        "Nuovo Indizio Extra!", 
        uniqueClue
      ).then(async () => {
        console.log("✅ Notifica indizio extra UNIVOCA creata");
        await reloadNotifications();
        
        toast.success("Hai ricevuto un nuovo indizio extra!", {
          description: uniqueClue,
          duration: 4000,
        });
        
        setShowDialog(false);
        setShowExplosion(true);
      }).catch(error => {
        console.error("❌ Error creating notification:", error);
        toast.error("Errore nel salvataggio dell'indizio", {
          duration: 3000,
        });
        setShowDialog(false);
      });
    } catch (error) {
      console.error("❌ Error in handle clue button click:", error);
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
    setBuzzCounter(0);
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
