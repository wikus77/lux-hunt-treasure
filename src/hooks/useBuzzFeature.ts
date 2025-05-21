
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import useBuzzSound from "@/hooks/useBuzzSound";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

export function useBuzzFeature() {
  const [showDialog, setShowDialog] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showClueBanner, setShowClueBanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound, playSound } = useBuzzSound();
  const { addNotification, reloadNotifications } = useNotifications();

  const {
    unlockedClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue
  } = useBuzzClues();

  useEffect(() => {
    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    try {
      initializeSound(soundPreference, volume);
    } catch (error) {
      // Can ignore
    }
    
    // Only handle payment completed from location state
    if (location.state?.paymentCompleted && location.state?.fromRegularBuzz) {
      try {
        savePaymentMethod();
        // Show explosion animation
        setShowExplosion(true);
      } catch (error) {
        // Ignore
      }
    }
    // eslint-disable-next-line
  }, [location.state, savePaymentMethod, navigate, initializeSound]);

  const handleBuzzClick = async () => {
    if (!hasPaymentMethod) {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          fromRegularBuzz: true,
          clue: { description: getNextVagueClue() },
          generateMapArea: false
        }
      });
      return;
    }
    
    // If user is authenticated, call the Edge Function directly
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast.error("Devi effettuare l'accesso per utilizzare questa funzione");
        return;
      }
      
      setShowDialog(true);
      
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: { userId, generateMap: false },
      });
      
      if (error) {
        console.error("Error calling buzz function:", error);
        toast.error("Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      if (data.success) {
        // Simulate payment completed
        setTimeout(() => {
          setShowDialog(false);
          
          // Add notification for the new clue
          const success = addNotification({
            title: "Nuovo Indizio Buzz!",
            description: data.clue_text
          });
          
          if (success) {
            // Reload notifications to update the counter
            reloadNotifications();
            
            // Show success message
            toast.success("Hai ricevuto un nuovo indizio!", {
              duration: 3000,
            });
            
            // Show explosion animation
            setShowExplosion(true);
          } else {
            toast.error("Errore nel salvataggio dell'indizio", {
              duration: 3000,
            });
          }
        }, 1500);
      } else {
        toast.error(data.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
      }
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
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) {
      toast.error("Devi effettuare l'accesso per utilizzare questa funzione");
      return;
    }
    
    // Show payment dialog
    setShowDialog(true);
    
    // Call the Edge Function
    try {
      const { data, error } = await supabase.functions.invoke("handle-buzz-press", {
        body: { userId, generateMap: false },
      });
      
      if (error) {
        toast.error("Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
        return;
      }
      
      if (data.success) {
        // Generate a random clue from the vague clues
        const newClue = data.clue_text;
        setLastVagueClue(newClue);
        
        // Increase unlocked clue count and show explosion/animation
        incrementUnlockedCluesAndAddClue();
        
        // Add notification for the new clue
        const success = addNotification({
          title: "Nuovo Indizio Extra!",
          description: newClue
        });
        
        if (success) {
          // Reload notifications to update the counter
          reloadNotifications();
          
          // Show success message
          toast.success("Hai ricevuto un nuovo indizio!", {
            duration: 3000,
          });
          
          // Hide dialog and show explosion
          setShowDialog(false);
          setShowExplosion(true);
        } else {
          toast.error("Errore nel salvataggio dell'indizio", {
            duration: 3000,
          });
          setShowDialog(false);
        }
      } else {
        toast.error(data.error || "Errore durante l'elaborazione dell'indizio");
        setShowDialog(false);
      }
    } catch (error) {
      console.error("Error in handle clue button click:", error);
      toast.error("Si è verificato un errore");
      setShowDialog(false);
    }
  };

  const handlePayment = () => {
    setShowDialog(false);
    setTimeout(() => {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          fromRegularBuzz: true,
          clue: { description: getNextVagueClue() },
          generateMapArea: false
        }
      });
    }, 1200);
  };

  const handleExplosionCompleted = () => {
    setShowExplosion(false);
    
    // Increment ONE clue when the explosion animation completes
    incrementUnlockedCluesAndAddClue();
    
    // Show the banner with the clue
    setShowClueBanner(true);
    
    // Navigate to notifications after a delay
    setTimeout(() => {
      navigate("/notifications", { replace: true });
    }, 1800);
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
    handleExplosionCompleted,
    handleResetClues
  };
}
