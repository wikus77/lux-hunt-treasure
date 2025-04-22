import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";
import BuzzButton from "@/components/buzz/BuzzButton";
import useBuzzSound from "@/hooks/useBuzzSound";

const EXTRA_CLUE_TEXT = "Strade strette ma la rotta è dritta: cerca dove il muro si colora!";

const Buzz = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [unlockedClues, setUnlockedClues] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();
  const { initializeSound } = useBuzzSound();

  useEffect(() => {
    const savedClues = localStorage.getItem('unlockedCluesCount');
    if (savedClues) {
      setUnlockedClues(parseInt(savedClues));
    }

    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    initializeSound(soundPreference, volume);

    if (location.state?.paymentCompleted) {
      savePaymentMethod();
      sendBuzzNotification();
      incrementUnlockedClues();
      toast.success("Indizio sbloccato!", {
        description: "Controlla la sezione Notifiche per vedere l'indizio extra."
      });
      toast(EXTRA_CLUE_TEXT, {
        duration: 3000,
        position: "bottom-center",
      });

      setTimeout(() => {
        navigate("/notifications", { replace: true });
      }, 1800);
    }
  }, [location.state, savePaymentMethod, navigate, initializeSound]);

  const incrementUnlockedClues = () => {
    const newCount = unlockedClues + 1;
    setUnlockedClues(newCount);
    localStorage.setItem('unlockedCluesCount', newCount.toString());
  };

  const handleBuzzClick = () => {
    if (!hasPaymentMethod) {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          clue: {
            description: EXTRA_CLUE_TEXT
          }
        }
      });
      return;
    }

    setShowDialog(true);
  };

  const sendBuzzNotification = () => {
    toast.success("Nuovo indizio disponibile!", {
      description: "Hai appena sbloccato un indizio premium."
    });

    const notification = {
      id: Date.now().toString(),
      title: "Nuovo indizio disponibile!",
      description: "Hai sbloccato un indizio premium per Ferrari 488 GTB",
      date: new Date().toISOString(),
      read: false
    };

    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
  };

  const handlePayment = () => {
    setShowDialog(false);
    toast.success("Pagamento in elaborazione", {
      description: "Stai per essere reindirizzato alla pagina di pagamento per completare l'acquisto."
    });

    setTimeout(() => {
      navigate("/payment-methods", {
        state: {
          fromBuzz: true,
          clue: {
            description: EXTRA_CLUE_TEXT
          }
        }
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black pb-20 w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text">Buzz</h1>
      </header>

      <div className="h-[72px] w-full" />

      <section className="flex flex-col items-center justify-center py-10 h-[70vh] w-full px-0">
        <div className="text-center mb-8 w-full px-0">
          <h2 className="text-2xl font-bold mb-2">Hai bisogno di un indizio extra?</h2>
          <p className="text-muted-foreground">
            Premi il pulsante Buzz per ottenere un indizio supplementare a 1,99€
          </p>
        </div>

        <BuzzButton onBuzzClick={handleBuzzClick} unlockedClues={unlockedClues} />
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
    </div>
  );
};

export default Buzz;
