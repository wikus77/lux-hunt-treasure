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

// Generatore di contenuti BUZZ realmente univoci con timestamp preciso
const generateUniqueClue = (userId: string, buzzCount: number): string => {
  const timestamp = Date.now();
  const timeString = new Date().toLocaleTimeString('it-IT');
  const dateString = new Date().toLocaleDateString('it-IT');
  
  const dynamicClues = [
    `🔍 Indizio #${buzzCount} (${timeString}): Il metallo lucente riflette i segreti dove tradizione e innovazione si incontrano`,
    `🎯 Missione ${buzzCount} del ${dateString}: La velocità italiana nasconde tesori tra motori e design d'eccellenza`,
    `⚡ Flash ${buzzCount} - Timestamp ${timestamp}: Potenza e eleganza convergono verso il prestigio motoristico padano`,
    `🏁 Target ${buzzCount} (ore ${timeString}): Il gioiello ingegneristico attende dove il futuro incontra la tradizione`,
    `🔥 Secrets ${buzzCount} - ${dateString}: L'eccellenza vibra di energia in una location speciale del nord Italia`,
    `💎 Elite ${buzzCount} alle ${timeString}: Un premio di valore si cela tra innovazione e storia automobilistica`,
    `🌟 Premium ${buzzCount} (${timestamp}): La tecnologia suprema attende nel cuore della Motor Valley italiana`,
    `🚀 Dynamic ${buzzCount} del ${dateString}: Il tuo obiettivo pulsa di potenza dove design e prestazioni convivono`
  ];
  
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
      
      console.log("🚀 AVVIO PROCESSO BUZZ UNIVOCO GARANTITO per:", userId);
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
      
      // GENERA CONTENUTO REALMENTE UNIVOCO CON TIMESTAMP PRECISO
      const uniqueClueContent = generateUniqueClue(userId, newBuzzCount);
      console.log("📝 CONTENUTO BUZZ UNIVOCO GENERATO:", uniqueClueContent);
      console.log("🕐 Timestamp preciso di generazione:", new Date().toISOString());
      
      setLastDynamicClue(uniqueClueContent);
      setLastVagueClue(uniqueClueContent);
      
      setTimeout(async () => {
        setShowDialog(false);
        
        console.log("💾 INSERIMENTO DIRETTO NOTIFICA BUZZ SU SUPABASE (INSERT ONLY)...");
        
        try {
          // STEP 1: INSERT DIRETTO (NO UPSERT) con contenuto reale
          const { error: directInsertError, data: insertedNotification } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              type: 'buzz',
              title: 'Nuovo Indizio Buzz!',
              message: uniqueClueContent,
              is_read: false,  // ESPLICITAMENTE FALSE
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (directInsertError) {
            console.error("❌ ERRORE INSERT NOTIFICA:", directInsertError);
            throw directInsertError;
          }
          
          console.log("✅ NOTIFICA BUZZ INSERITA CON SUCCESSO - ID:", insertedNotification.id);
          console.log("📋 Contenuto salvato:", insertedNotification.message);
          console.log("🔍 Read status:", insertedNotification.is_read);
          
          // STEP 2: RELOAD FORZATO per garantire sincronizzazione
          await reloadNotifications(true);
          console.log("🔄 Reload notifiche completato");
          
          // STEP 3: Toast con contenuto identico
          toast.success("Nuovo indizio sbloccato!", {
            description: uniqueClueContent,
            duration: 4000,
          });
          
          // STEP 4: Mostra esplosione
          setShowExplosion(true);
          
          console.log("✅ PROCESSO BUZZ COMPLETATO CON SUCCESSO");
          
        } catch (error) {
          console.error("❌ ERRORE DURANTE CREAZIONE NOTIFICA:", error);
          toast.error("Errore nel salvataggio dell'indizio", {
            duration: 3000,
          });
        }
      }, 1500);
    } catch (error) {
      console.error("❌ ERRORE GENERALE PROCESSO BUZZ:", error);
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
    
    console.log("🎯 AVVIO PROCESSO INDIZIO EXTRA UNIVOCO per:", userId);
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
      console.log("📝 INDIZIO EXTRA UNIVOCO:", uniqueClue);
      setLastVagueClue(uniqueClue);
      setLastDynamicClue(uniqueClue);
      
      incrementUnlockedCluesAndAddClue();
      
      console.log("💾 INSERIMENTO NOTIFICA INDIZIO EXTRA...");
      
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
      
      console.log("✅ NOTIFICA INDIZIO EXTRA INSERITA");
      await reloadNotifications(true);
      
      toast.success("Hai ricevuto un nuovo indizio extra!", {
        description: uniqueClue,
        duration: 4000,
      });
      
      setShowDialog(false);
      setShowExplosion(true);
      
    } catch (error) {
      console.error("❌ ERRORE INDIZIO EXTRA:", error);
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
