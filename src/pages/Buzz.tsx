
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import BuzzButton from "@/components/buzz/BuzzButton";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import ClueBanner from "@/components/buzz/ClueBanner";
import useBuzzSound from "@/hooks/useBuzzSound";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import BuzzUnlockDialog from "@/components/buzz/BuzzUnlockDialog";
import BuzzExplosionHandler from "@/components/buzz/BuzzExplosionHandler";

const Buzz = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showClueBanner, setShowClueBanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound } = useBuzzSound();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const {
    unlockedClues,
    setUnlockedClues,
    lastVagueClue,
    setLastVagueClue,
    incrementUnlockedCluesAndAddClue,
    resetUnlockedClues,
    getNextVagueClue
  } = useBuzzClues();

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
    // Optional: Reset clues on page load or as needed
    resetUnlockedClues();
  }, []);

  useEffect(() => {
    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    try {
      initializeSound(soundPreference, volume);
    } catch (error) {
      // Can ignore
    }
    if (location.state?.paymentCompleted && location.state?.fromRegularBuzz) {
      try {
        savePaymentMethod();
        incrementUnlockedCluesAndAddClue();
        setShowExplosion(true);
      } catch (error) {
        // Ignore
      }
    }
    // eslint-disable-next-line
  }, [location.state, savePaymentMethod, navigate, initializeSound]);

  const handleBuzzClick = () => {
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
    setShowDialog(true);
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
    setShowClueBanner(true);
    setTimeout(() => {
      navigate("/notifications", { replace: true });
    }, 1800);
  }

  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
      <ClueBanner 
        open={showClueBanner} 
        message={lastVagueClue || ""} 
        onClose={() => setShowClueBanner(false)} 
      />
      <section className="flex flex-col items-center justify-center py-10 h-[70vh] w-full px-0">
        <div className="text-center mb-8 w-full px-0">
          <h2 className="text-2xl font-bold mb-2">Hai bisogno di un indizio extra?</h2>
          <p className="text-muted-foreground">
            Premi il pulsante Buzz per ottenere un indizio supplementare a 1,99€
          </p>
        </div>
        <BuzzButton
          onBuzzClick={handleBuzzClick}
          unlockedClues={unlockedClues}
          updateUnlockedClues={setUnlockedClues}
          isMapBuzz={false}
        />
      </section>
      <BuzzUnlockDialog open={showDialog} onOpenChange={setShowDialog} handlePayment={handlePayment} />
      <BuzzExplosionHandler show={showExplosion} onCompleted={handleExplosionCompleted} />
    </div>
  );
};

export default Buzz;
