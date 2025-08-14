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

      if (error) {
        console.error('M1QR-TRACE:', { step: 'claim_error', error });
        
        if (error.message?.includes('already_claimed')) {
          toast.error('Premio già riscattato per questo marker');
        } else {
          toast.error('Errore nel riscatto del premio');
        }
        return;
      }

      if (data?.status === 'already_claimed') {
        toast.info('Premio già riscattato per questo marker');
        onClose();
        return;
      }

      if (data?.ok) {
        console.log('M1QR-TRACE:', { step: 'claim_success', summary: data.summary });
        
        toast.success('Premio riscattato con successo!', {
          description: `Ricevuti ${data.rewards} premi`
        });
        
        onClose();
        
        // Redirect based on priority
        if (data.nextRoute) {
          setTimeout(() => {
            onSuccess?.(data.nextRoute);
          }, 1000);
        } else {
          onSuccess?.();
        }
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('M1QR-TRACE:', { step: 'claim_exception', error });
      toast.error('Errore di rete nel riscatto del premio');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
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