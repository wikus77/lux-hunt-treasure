// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { isWinningPrize, getPrizeMessage } from '@/utils/dailySpinUtils';

interface DailySpinResultModalProps {
  isOpen: boolean;
  prize: string;
  message: string;
  reroute_path?: string | null;
  onClose: () => void;
}

export const DailySpinResultModal: React.FC<DailySpinResultModalProps> = ({
  isOpen,
  prize,
  message,
  reroute_path,
  onClose
}) => {
  const [, setLocation] = useLocation();

  // Auto-close effect for losing prizes
  useEffect(() => {
    if (isOpen && !isWinningPrize(prize)) {
      const timer = setTimeout(() => {
        setLocation('/home');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, prize, setLocation]);

  const handleRedirect = () => {
    if (reroute_path) {
      setLocation(reroute_path);
    } else {
      setLocation('/home');
    }
  };

  if (!isOpen) return null;

  const winning = isWinningPrize(prize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={`relative mx-4 p-8 rounded-2xl border-2 max-w-md w-full text-center animate-scale-in ${
        winning 
          ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30' 
          : 'bg-gradient-to-br from-muted/10 to-border/10 border-muted/30'
      }`}>
        
        {/* Icon */}
        <div className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
          winning 
            ? 'bg-gradient-to-br from-primary to-accent text-background' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {winning ? '🎉' : '😞'}
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-bold mb-4 ${
          winning ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {winning ? 'COMPLIMENTI!' : 'RIPROVA DOMANI'}
        </h2>

        {/* Prize */}
        <div className="mb-4">
          <p className="text-xl font-semibold text-foreground mb-2">{prize}</p>
          <p className="text-muted-foreground">{getPrizeMessage(prize)}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {winning && reroute_path ? (
            <Button 
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-background font-bold py-3"
            >
              Riscatta Ora
            </Button>
          ) : (
            <Button 
              onClick={() => setLocation('/home')}
              variant="outline"
              className="w-full"
            >
              Torna alla Home
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground">
            {winning 
              ? 'Torna domani per un nuovo giro!' 
              : 'Chiusura automatica tra 4 secondi...'
            }
          </p>
        </div>
      </div>
    </div>
  );
};