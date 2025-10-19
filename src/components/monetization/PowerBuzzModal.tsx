import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle } from 'lucide-react';

interface PowerBuzzModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PowerBuzzModal = ({ open, onOpenChange }: PowerBuzzModalProps) => {
  const [redirecting, setRedirecting] = useState(false);

  const handleUpgrade = () => {
    setRedirecting(true);
    
    // Redirect to existing Stripe flow
    // TODO: Replace with actual Stripe payment link/flow
    window.location.href = '/pricing';
    
    setTimeout(() => {
      setRedirecting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="living-hud-glass max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Power Buzz™
          </DialogTitle>
          <DialogDescription className="text-center">
            Contribuisci al PULSE globale e sblocca vantaggi esclusivi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Contributo Diretto al PULSE
              </p>
              <p className="text-xs text-muted-foreground">
                Ogni Power Buzz incrementa l'energia globale
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Badge Pulse Contributor
              </p>
              <p className="text-xs text-muted-foreground">
                Riconoscimento esclusivo nel profilo agente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Boost DNA
              </p>
              <p className="text-xs text-muted-foreground">
                Incrementa tutti i parametri DNA di +5
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            disabled={redirecting}
            className="w-full"
          >
            {redirecting ? (
              'Reindirizzamento...'
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Attiva Power Buzz
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Non ora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PowerBuzzModal;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
