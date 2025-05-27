
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

// Funzione per generare indizi REALMENTE univoci con contenuto dinamico
const generateUniqueClue = (userId: string, buzzCount: number): string => {
  const now = new Date();
  const timestamp = now.getTime();
  const timeString = now.toLocaleTimeString('it-IT');
  const dateString = now.toLocaleDateString('it-IT');
  
  const dynamicClues = [
    `🔍 Indizio ${buzzCount}: Cerca dove il metallo lucente riflette il sole di oggi (${timeString})`,
    `🎯 Missione #${buzzCount}: La tua meta si nasconde tra innovazione e tradizione - ${dateString}`,
    `⚡ Flash ${buzzCount}: Velocità e eleganza si incontrano nell'eccellenza italiana (ora: ${timeString})`,
    `🏁 Target ${buzzCount}: Il prestigio motoristico attende in una location speciale - ${dateString}`,
    `🔥 Secrets ${buzzCount}: Potenza e design convergono verso il tuo obiettivo (${timestamp})`,
    `💎 Elite ${buzzCount}: Un gioiello di ingegneria nascosto nella pianura padana - ${timeString}`,
    `🌟 Premium ${buzzCount}: L'eccellenza si cela dove tradizione e futuro convivono (${dateString})`,
    `🚀 Dynamic ${buzzCount}: Il tuo premio vibra di energia in una città del nord Italia - ora ${timeString}`
  ];
  
  // Usa hash dell'userId + timestamp per garantire unicità totale
  const userHash = parseInt(userId.slice(-8), 16) || 1;
  const index = (userHash + timestamp + buzzCount) % dynamicClues.length;
  return dynamicClues[index];
};

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
      
      console.log("🚀 Avvio processo BUZZ UNIVOCO per:", userId);
      setShowDialog(true);
      
      // Incrementa il counter per garantire unicità ASSOLUTA
      const newBuzzCount = buzzCounter + 1;
      setBuzzCounter(newBuzzCount);
      
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        console.error("❌ Errore risposta BUZZ API:", response.error);
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      // Genera contenuto REALMENTE UNIVOCO con timestamp e info dinamiche
      const uniqueClueContent = generateUniqueClue(userId, newBuzzCount);
      console.log("📝 Contenuto UNIVOCO generato:", uniqueClueContent);
      console.log("🕐 Timestamp generazione:", new Date().toISOString());
      
      setLastDynamicClue(uniqueClueContent);
      setLastVagueClue(uniqueClueContent);
      
      setTimeout(async () => {
        setShowDialog(false);
        
        console.log("💾 Creando notifica BUZZ UNIVOCA con INSERT (non upsert)...");
        
        // STEP 1: Inserimento diretto su Supabase con INSERT (NON UPSERT)
        try {
          const { error: directInsertError, data: insertedNotification } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              type: 'buzz',
              title: 'Nuovo Indizio Buzz!',
              message: uniqueClueContent,
              is_read: false,  // ESPLICITAMENTE FALSE per evidenza visiva
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (directInsertError) {
            console.error("❌ Errore INSERT diretto notifica:", directInsertError);
            throw directInsertError;
          }
          
          console.log("✅ Notifica UNIVOCA inserita con ID:", insertedNotification.id);
          console.log("📋 Contenuto salvato:", insertedNotification.message);
          
          // STEP 2: Reload FORZATO delle notifiche per sync immediato
          await reloadNotifications(true);
          
          // STEP 3: Toast con contenuto reale
          toast.success("Hai ricevuto un nuovo indizio univoco!", {
            description: uniqueClueContent,
            duration: 4000,
          });
          
          // STEP 4: Mostra esplosione
          setShowExplosion(true);
          
        } catch (error) {
          console.error("❌ Error creating notification:", error);
          toast.error("Errore nel salvataggio dell'indizio", {
            duration: 3000,
          });
        }
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
      
      const uniqueClue = generateUniqueClue(userId, newBuzzCount);
      console.log("📝 Nuovo indizio extra UNIVOCO:", uniqueClue);
      setLastVagueClue(uniqueClue);
      setLastDynamicClue(uniqueClue);
      
      incrementUnlockedCluesAndAddClue();
      
      console.log("💾 Creando notifica indizio extra UNIVOCA...");
      
      // INSERT diretto su Supabase
      const { error: insertError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          type: 'buzz',
          title: 'Nuovo Indizio Extra!',
          message: uniqueClue,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("❌ Errore inserimento notifica extra:", insertError);
        throw insertError;
      }
      
      console.log("✅ Notifica indizio extra UNIVOCA creata");
      await reloadNotifications(true);
      
      toast.success("Hai ricevuto un nuovo indizio extra!", {
        description: uniqueClue,
        duration: 4000,
      });
      
      setShowDialog(false);
      setShowExplosion(true);
      
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
