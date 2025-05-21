
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import BuzzButton from "@/components/buzz/BuzzButton";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ClueBanner from "@/components/buzz/ClueBanner";
import useBuzzSound from "@/hooks/useBuzzSound";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import BuzzUnlockDialog from "@/components/buzz/BuzzUnlockDialog";
import BuzzExplosionHandler from "@/components/buzz/BuzzExplosionHandler";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, LightbulbIcon, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Buzz = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showClueBanner, setShowClueBanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound, playSound } = useBuzzSound();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { addNotification, reloadNotifications } = useNotifications();
  const isMobile = useIsMobile();

  const {
    unlockedClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue
  } = useBuzzClues();

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

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
        // Don't automatically increment clues - wait for the animation to complete
        // This prevents immediately jumping to 1000/1000
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

  function handleExplosionCompleted() {
    setShowExplosion(false);
    
    // Increment ONE clue when the explosion animation completes
    incrementUnlockedCluesAndAddClue();
    
    // Show the banner with the clue
    setShowClueBanner(true);
    
    // Navigate to notifications after a delay
    setTimeout(() => {
      navigate("/notifications", { replace: true });
    }, 1800);
  }

  const handleClueButtonClick = useCallback(async () => {
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
  }, [
    playSound, 
    setLastVagueClue, 
    incrementUnlockedCluesAndAddClue, 
    addNotification, 
    reloadNotifications
  ]);

  const handleResetClues = () => {
    resetUnlockedClues();
    toast.success("Tutti gli indizi sono stati azzerati", {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <section className="flex flex-col items-center justify-center py-6 sm:py-10 h-[70vh] w-full px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Hai bisogno di un indizio extra?</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Premi il pulsante Buzz per ottenere un indizio supplementare a 1,99€
          </p>
        </div>
        
        {/* Pulsante principale BUZZ */}
        <BuzzButton
          onBuzzClick={handleBuzzClick}
          unlockedClues={unlockedClues}
          isMapBuzz={false}
        />
        
        {/* Nuovo pulsante Indizio Istantaneo */}
        <div className="mt-8 sm:mt-12 w-full max-w-md px-3 sm:px-0">
          <Button 
            onClick={handleClueButtonClick}
            className="w-full py-4 sm:py-6 text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-projectx-blue to-projectx-pink hover:opacity-90"
          >
            <LightbulbIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            Ottieni Indizio Istantaneo (1,99€)
          </Button>
          <p className="text-xs sm:text-sm text-center mt-2 text-muted-foreground">
            Ricevi subito una notifica con un nuovo indizio esclusivo
          </p>
        </div>
        
        {/* Pulsante Reset */}
        <div className="mt-4 sm:mt-6 w-full max-w-md px-3 sm:px-0">
          <Button 
            onClick={handleResetClues}
            variant="destructive"
            className="w-full py-2 flex items-center justify-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Azzera Tutti gli Indizi
          </Button>
        </div>
      </section>
      
      <BuzzUnlockDialog open={showDialog} onOpenChange={setShowDialog} handlePayment={handlePayment} />
      <BuzzExplosionHandler show={showExplosion} onCompleted={handleExplosionCompleted} />
    </div>
  );
};

export default Buzz;
