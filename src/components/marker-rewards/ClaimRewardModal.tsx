// © 2025 Joseph MULÉ – M1SSION™

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
  rewards: MarkerReward[];
  onSuccess?: (nextRoute?: string) => void;
}

const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
  isOpen,
  onClose,
  markerId,
  rewards,
  onSuccess
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

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
    if (isClaiming) return;
    
    setIsClaiming(true);
    
    console.log('M1QR-TRACE:', { step: 'claim_start', markerId, rewards: rewards.length });

    try {
      const { data, error } = await supabase.functions.invoke('claim-marker-reward', {
        body: { markerId }
      });

      // Handle auth errors
      if (error?.status === 401) {
        console.log('M1QR-TRACE:', { step: 'claim_error', error: 'unauthorized' });
        window.location.href = '/login';
        return;
      }

      // Handle other errors
      if (error) {
        console.error('M1QR-TRACE:', { step: 'claim_error', markerId, error, data });
        toast.error('Errore nel riscatto');
        return;
      }

      // Handle success responses
      if (data?.ok) {
        console.log('M1QR-TRACE:', { step: 'claim_success', markerId, nextRoute: data.nextRoute });
        toast.success('Premio riscattato');
        onClose();
        if (data.nextRoute) {
          onSuccess?.(data.nextRoute);
        }
        return;
      }

      // Handle already claimed
      if (data?.code === 'ALREADY_CLAIMED') {
        console.log('M1QR-TRACE:', { step: 'claim_already', markerId });
        toast.info('Premio già riscattato');
        onClose();
        return;
      }

      // Handle no reward configured
      if (data?.code === 'NO_REWARD') {
        console.log('M1QR-TRACE:', { step: 'claim_no_reward', markerId });
        toast.error('Nessuna ricompensa configurata');
        return;
      }

      // Unknown response
      console.error('M1QR-TRACE:', { step: 'claim_error', markerId, error: 'unknown_response', data });
      toast.error('Errore nel riscatto');
    } catch (error) {
      console.error('M1QR-TRACE:', { step: 'claim_error', markerId, error });
      toast.error('Errore nel riscatto');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto z-[9999] pointer-events-auto">
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
            {rewards.map((reward, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border">
                <span className="text-2xl">{getRewardIcon(reward.reward_type)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {reward.description || `Premio ${reward.reward_type}`}
                  </div>
                  {reward.reward_type === 'buzz_free' && (
                    <div className="text-xs text-muted-foreground">
                      {reward.payload.buzzCount || 1} BUZZ gratuiti
                    </div>
                  )}
                  {reward.reward_type === 'xp_points' && (
                    <div className="text-xs text-muted-foreground">
                      +{reward.payload.xp || 10} XP
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              className="flex-1 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink"
              data-testid="claim-reward-cta"
            >
              {isClaiming ? 'Riscattando...' : 'Riscatta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimRewardModal;