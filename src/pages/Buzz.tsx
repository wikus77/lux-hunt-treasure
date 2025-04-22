import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import useHasPaymentMethod from "@/hooks/useHasPaymentMethod";

const EXTRA_CLUE_TEXT = "Strade strette ma la rotta è dritta: cerca dove il muro si colora!";

const Buzz = () => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPaymentMethod, savePaymentMethod } = useHasPaymentMethod();

  useEffect(() => {
    const soundPreference = localStorage.getItem('buzzSound') || 'default';
    const volume = localStorage.getItem('buzzVolume') ? Number(localStorage.getItem('buzzVolume')) / 100 : 0.5;
    const soundPath = getSoundPath(soundPreference);
    
    audioRef.current = new Audio(soundPath);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    if (location.state?.paymentCompleted) {
      savePaymentMethod();
      sendBuzzNotification();
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

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [location.state, savePaymentMethod, navigate]);

  const getSoundPath = (preference: string) => {
    switch (preference) {
      case 'chime':
        return "/sounds/chime.mp3";
      case 'bell':
        return "/sounds/bell.mp3";
      case 'arcade':
        return "/sounds/arcade.mp3";
      default:
        return "/sounds/buzz.mp3";
    }
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

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }

    setIsVaultOpen(true);

    sendBuzzNotification();

    setTimeout(() => {
      setIsVaultOpen(false);
      setShowDialog(true);
    }, 1500);
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

        <div className={`transition-all duration-500 ${isVaultOpen ? "scale-125" : "scale-100"}`}>
          <Button
            onClick={handleBuzzClick}
            className={`w-48 h-48 rounded-full bg-gradient-to-r from-projectx-blue to-projectx-pink flex items-center justify-center text-4xl font-bold shadow-[0_0_40px_rgba(217,70,239,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(217,70,239,0.7)] ${
              isVaultOpen ? "animate-pulse" : ""
            }`}
          >
            <Zap className="w-24 h-24" />
          </Button>
        </div>

        <div className="mt-8 text-center w-full px-0">
          <p className="text-sm text-muted-foreground">
            Limite: 100 indizi supplementari per evento
          </p>
        </div>
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

      <BottomNavigation />
    </div>
  );
};

export default Buzz;
