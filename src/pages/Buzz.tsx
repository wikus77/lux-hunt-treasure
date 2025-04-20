
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Buzz = () => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    // Create audio element for buzz sound
    audioRef.current = new Audio("/buzz-sound.mp3");
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const handleBuzzClick = () => {
    // Play sound effect
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    // Start vault animation
    setIsVaultOpen(true);
    
    // Reset animation after delay
    setTimeout(() => {
      setIsVaultOpen(false);
      setShowDialog(true);
    }, 1500);
  };

  const handlePayment = () => {
    setShowDialog(false);
    toast.success("Pagamento in elaborazione", {
      description: "Stai per essere reindirizzato a Stripe per completare l'acquisto."
    });
    
    // In a real app, this would connect to Stripe
    setTimeout(() => {
      toast.success("Indizio sbloccato!", {
        description: "Controlla la tua sezione indizi per vedere l'indizio extra."
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Buzz</h1>
      </header>

      {/* Buzz Button Section */}
      <section className="flex flex-col items-center justify-center px-4 py-10 h-[70vh]">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Hai bisogno di un indizio extra?</h2>
          <p className="text-muted-foreground">
            Premi il pulsante Buzz per ottenere un indizio supplementare a soli €1,99
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
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Limite: 5 indizi supplementari per evento
          </p>
        </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sblocca Indizio Extra</DialogTitle>
            <DialogDescription>
              Ottieni un indizio extra immediatamente per €1,99
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
              Paga €1,99
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Buzz;
