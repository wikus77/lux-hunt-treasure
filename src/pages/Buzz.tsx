
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import BuzzButton from "@/components/buzz/BuzzButton";
import useBuzzSound from "@/hooks/useBuzzSound";
import ClueUnlockedExplosion from "@/components/clues/ClueUnlockedExplosion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { vagueBuzzClues } from "@/data/vagueBuzzClues";

function getNextVagueClue(usedClues: string[]) {
  // Restituisci un indizio casuale NON già usato
  const available = vagueBuzzClues.filter(clue => !usedClues.includes(clue));
  if (available.length === 0) {
    // Tutti usati: ricomincia dal primo
    return vagueBuzzClues[0];
  }
  return available[Math.floor(Math.random() * available.length)];
}

const Buzz = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionFadeOut, setExplosionFadeOut] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState(() => {
    const savedClues = localStorage.getItem('unlockedCluesCount');
    return savedClues ? parseInt(savedClues) : 0;
  });
  const [usedVagueClues, setUsedVagueClues] = useState<string[]>(() => {
    const saved = localStorage.getItem('usedVagueBuzzClues');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastVagueClue, setLastVagueClue] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound } = useBuzzSound();
  const explosionTimerRef = useRef<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  useEffect(() => {
    const savedClues = localStorage.getItem('unlockedCluesCount');
    if (savedClues) {
      setUnlockedClues(parseInt(savedClues));
    }

    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    initializeSound(soundPreference, volume);

    // Verifica se il pagamento è stato completato e proviene dalla pagina standard (non mappa)
    if (location.state?.paymentCompleted && location.state?.fromRegularBuzz === true) {
      savePaymentMethod();
      incrementUnlockedCluesAndAddClue();
      setShowExplosion(true);

      explosionTimerRef.current = window.setTimeout(() => {
        setExplosionFadeOut(true);
      }, 2500);

      return () => {
        if (explosionTimerRef.current) {
          clearTimeout(explosionTimerRef.current);
        }
      };
    }
    // eslint-disable-next-line
  }, [location.state, savePaymentMethod, navigate, initializeSound]);

  const handleExplosionFadeOutComplete = () => {
    setShowExplosion(false);
    setExplosionFadeOut(false);

    toast.success("Indizio sbloccato!", {
      description: "Controlla la sezione Notifiche per vedere l'indizio extra."
    });

    if (lastVagueClue) {
      toast(lastVagueClue, {
        duration: 3200,
        position: "bottom-center",
      });
    }
    setTimeout(() => {
      navigate("/notifications", { replace: true });
    }, 1800);
  };

  function incrementUnlockedCluesAndAddClue() {
    const newCount = unlockedClues + 1;
    setUnlockedClues(newCount);
    localStorage.setItem('unlockedCluesCount', newCount.toString());

    // Trova nuovo indizio vago
    const nextClue = getNextVagueClue(usedVagueClues);
    setLastVagueClue(nextClue);

    // aggiorna lista usati
    const updated = [...usedVagueClues, nextClue];
    setUsedVagueClues(updated);
    localStorage.setItem('usedVagueBuzzClues', JSON.stringify(updated));

    sendBuzzNotification(nextClue);
  }

  const handleBuzzClick = () => {
    if (!hasPaymentMethod) {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          fromRegularBuzz: true, // Flag per indicare che proviene dalla sezione Buzz standard
          clue: { description: getNextVagueClue(usedVagueClues) },
          generateMapArea: false // Assicura che non vengano generate aree sulla mappa
        }
      });
      return;
    }
    setShowDialog(true);
  };

  function sendBuzzNotification(clueText: string) {
    const notification = {
      id: Date.now().toString(),
      title: "Nuovo indizio extra!",
      description: clueText,
      date: new Date().toISOString(),
      read: false
    };

    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
  }

  const handlePayment = () => {
    setShowDialog(false);
    toast.success("Pagamento in elaborazione", {
      description: "Stai per essere reindirizzato alla pagina di pagamento per completare l'acquisto."
    });

    setTimeout(() => {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          fromRegularBuzz: true, // Flag per indicare che proviene dalla sezione Buzz standard
          clue: { description: getNextVagueClue(usedVagueClues) },
          generateMapArea: false // Assicura che non vengano generate aree sulla mappa
        }
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />

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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sblocca Indizio Extra</DialogTitle>
            <DialogDescription>
              Ottieni un indizio extra immediatamente per 1,99€
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-projectx-pink" />
                <span>Indizio Esclusivo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Questo indizio potrebbe essere la chiave per trovare l'auto!
              </p>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
            >
              Sblocca indizio 1,99€
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClueUnlockedExplosion
        open={showExplosion}
        fadeOut={explosionFadeOut}
        onFadeOutEnd={handleExplosionFadeOutComplete}
      />
    </div>
  );
};

export default Buzz;
