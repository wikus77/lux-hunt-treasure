
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

  // Cache for frequently used values
  const [cachedUserId, setCachedUserId] = useState<string | null>(null);

  // Optimize initial loading
  useEffect(() => {
    // Prefetch user ID for quick access later
    const prefetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        setCachedUserId(sessionData.session.user.id);
      }
    };

    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    
    // Run in parallel
    Promise.all([
      prefetchUserId(),
      initializeSound(soundPreference, volume)
    ]).catch(error => console.error("Error during initialization:", error));
    
    // Only handle payment completed from location state
    if (location.state?.paymentCompleted && location.state?.fromRegularBuzz) {
      try {
        savePaymentMethod();
        // Show explosion animation
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
    
    // If user is authenticated, call the Edge Function directly
    try {
      const userId = cachedUserId || (await supabase.auth.getUser()).data.session?.user?.id;
      
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
      
      // Simulate payment completed
      setTimeout(() => {
        setShowDialog(false);
        
        // Create notification for the new clue
        createBuzzNotification(
          "Nuovo Indizio Buzz!", 
          response.clue_text || "Hai sbloccato un nuovo indizio!"
        ).then(() => {
          // Reload notifications to update the counter
          reloadNotifications();
          
          // Show success message
          toast.success("Hai ricevuto un nuovo indizio!", {
            duration: 3000,
          });
          
          // Show explosion animation
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
    // Play sound
    playSound();
    
    // Try to get authenticated user
    const userId = cachedUserId || (await supabase.auth.getUser()).data.session?.user?.id;
    
    if (!userId) {
      toast.error("Devi effettuare l'accesso per utilizzare questa funzione");
      return;
    }
    
    // Show payment dialog
    setShowDialog(true);
    
    // Call the Edge Function
    try {
      const response = await callBuzzApi({ userId, generateMap: false });
      
      if (!response.success) {
        toast.error(response.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      // Generate a random clue from the vague clues
      const newClue = response.clue_text || "";
      setLastVagueClue(newClue);
      
      // Increase unlocked clue count and show explosion/animation
      incrementUnlockedCluesAndAddClue();
      
      // Create notification for the new clue
      createBuzzNotification(
        "Nuovo Indizio Extra!", 
        newClue
      ).then(() => {
        // Reload notifications to update the counter
        reloadNotifications();
        
        // Show success message
        toast.success("Hai ricevuto un nuovo indizio!", {
          duration: 3000,
        });
        
        // Hide dialog and show explosion
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
    }, 400); // Reduced the delay for better responsiveness
  };

  const handleExplosionCompletedCallback = () => {
    handleExplosionCompleted(() => {
      // Increment ONE clue when the explosion animation completes
      incrementUnlockedCluesAndAddClue();
      
      // Show the banner with the clue
      setShowClueBanner(true);
      
      // Navigate to notifications after a delay
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
    handleBuzzClick,
    handleClueButtonClick,
    handlePayment,
    handleExplosionCompleted: handleExplosionCompletedCallback,
    handleResetClues
  };
}
