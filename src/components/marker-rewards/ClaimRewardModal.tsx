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
    if (!markerId) return;
    setIsClaiming(true);
    console.log('M1QR-TRACE', { step: 'claim_start', markerId });

    const { data, error } = await supabase.functions
      .invoke('claim-marker-reward', { body: { markerId } });

    if (error?.status === 401) { 
      console.log('M1QR-TRACE', { step: 'claim_unauthorized' });
      window.location.href = '/login'; 
      return; 
    }

    if (data?.ok === true) {
      console.log('M1QR-TRACE', { step: 'claim_success', nextRoute: data?.nextRoute });
      toast.success('Premio riscattato');
      onClose?.();
      if (data?.nextRoute) window.location.href = data.nextRoute;
      return;
    }

    if (data?.code === 'ALREADY_CLAIMED') { 
      console.log('M1QR-TRACE', { step: 'already_claimed' });
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
    <>
      {/* Modal Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          style={{ pointerEvents: 'auto' }}
          onClick={onClose}
        />
      )}
      
      {/* Modal Content */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-md mx-auto bg-[#0a0a0a] border border-[#00D1FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,209,255,0.3)] pointer-events-auto">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              🛡️ Premio Trovato!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6 pt-2">
            <div className="text-center text-[#00D1FF] font-medium">
              Hai trovato un marker con premi speciali
            </div>
            
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#00D1FF]/10 to-[#FF1493]/10 rounded-xl border border-[#00D1FF]/20">
                  <div className="w-12 h-12 rounded-full bg-[#00D1FF]/20 flex items-center justify-center">
                    <span className="text-2xl">{getRewardIcon(reward.reward_type)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">
                      {reward.reward_type === 'buzz_free' ? 'BUZZ GRATUITO' : 
                       reward.reward_type === 'xp_points' ? 'PUNTI ESPERIENZA' :
                       reward.description || `Premio ${reward.reward_type}`}
                    </div>
                    {reward.reward_type === 'buzz_free' && (
                      <div className="text-[#00D1FF] text-sm">
                        {reward.payload.buzzCount || 1} BUZZ gratuiti
                      </div>
                    )}
                    {reward.reward_type === 'xp_points' && (
                      <div className="text-[#00D1FF] text-sm">
                        +{reward.payload.xp || 10} XP
                      </div>
                    )}
                    {reward.description && reward.reward_type !== 'buzz_free' && reward.reward_type !== 'xp_points' && (
                      <div className="text-gray-300 text-sm">
                        {reward.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isClaiming}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleClaim}
                disabled={isClaiming}
                className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-semibold hover:shadow-[0_0_20px_rgba(0,209,255,0.5)] transition-all duration-300"
                data-testid="claim-reward-cta"
              >
                {isClaiming ? 'Riscattando...' : 'Riscatta subito'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimRewardModal;