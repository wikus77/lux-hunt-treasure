// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarkerReward {
  reward_type: string;
  payload: any;
  description: string;
}

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  markerId: string;
  onSuccess?: (nextRoute?: string) => void;
}

const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
  isOpen,
  onClose,
  markerId,
  onSuccess
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

  // Add body class management for z-index control
  React.useEffect(() => {
    console.log('M1SSION_CANARY: ClaimRewardModal mounted');
    if (isOpen) {
      document.body.classList.add('m1ssion-modal-open');
    } else {
      document.body.classList.remove('m1ssion-modal-open');
    }
    return () => {
      document.body.classList.remove('m1ssion-modal-open');
    };
  }, [isOpen]);

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'buzz_free': return '⚡';
      case 'xp_points': return '🏆';
      case 'message': return '📩';
      case 'event_ticket': return '🎫';
      case 'badge': return '🏅';
      default: return '🎁';
    }
  };

  const handleClaim = async () => {
    if (!markerId) return;
    setIsClaiming(true);
    console.log('M1MARK-TRACE', { step: 'REDEEM_REQUESTED', markerId });

    const { data, error } = await supabase.functions
      .invoke('claim-marker-reward', { body: { markerId } });

    if (error?.status === 401) { 
      console.log('M1QR-TRACE', { step: 'claim_unauthorized' });
      window.location.href = '/login'; 
      return; 
    }

    if (data?.ok === true) {
      console.log('M1MARK-TRACE', { step: 'REDEEM_SUCCESS', nextRoute: data?.nextRoute });
      toast.success('Premio riscattato');
      onClose?.();
      if (data?.nextRoute) window.location.href = data.nextRoute;
      return;
    }

    if (data?.code === 'ALREADY_CLAIMED') { 
      console.log('M1MARK-TRACE', { step: 'ALREADY_CLAIMED' });
      toast.info('Premio già riscattato'); 
      onClose?.(); 
      return; 
    }
    if (data?.code === 'NO_REWARD') { 
      console.error('M1QR-TRACE', { step: 'no_reward' });
      toast.error('Nessuna ricompensa configurata'); 
      return; 
    }

    console.error('M1QR-TRACE', { step: 'claim_error', markerId, error, data });
    toast.error('Errore nel riscatto');
    setIsClaiming(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="m1ssion-modal-content fixed"
        style={{
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          isolation: 'isolate',
          willChange: 'transform',
          pointerEvents: 'auto' as const,
          maxWidth: '420px',
          width: '90vw',
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 26, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.1)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gradient">
            🎁 Premio Trovato!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Hai trovato un marker con premi speciali
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
              <span className="text-2xl">🎁</span>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  Premio speciale M1SSION™
                </div>
                <div className="text-xs text-muted-foreground">
                  Clicca riscatta per scoprire cosa hai vinto!
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isClaiming}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button 
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex-1 m1ssion-claim-button"
              data-testid="claim-reward-cta"
            >
              {isClaiming ? 'Riscattando...' : 'Riscatta ora'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimRewardModal;