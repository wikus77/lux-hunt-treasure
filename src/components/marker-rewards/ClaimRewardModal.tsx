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
    if (!markerId) {
      console.error('M1QR-TRACE', { step: 'claim_error', error: 'No markerId provided' });
      toast.error('Errore: marker non identificato');
      return;
    }
    setIsClaiming(true);
    console.log('M1QR-TRACE', { step: 'claim_start', markerId, rewardsCount: rewards.length });

    const { data, error } = await supabase.functions
      .invoke('claim-marker-reward', { body: { markerId } });

    if (error?.status === 401) { 
      console.log('M1QR-TRACE', { step: 'claim_unauthorized' });
      window.location.href = '/login'; 
      return; 
    }

    if (data?.ok === true) {
      console.log('M1QR-TRACE', { step: 'claim_success', nextRoute: data?.nextRoute, summary: data?.summary });
      toast.success('🎁 Premio riscattato con successo!', {
        description: 'Controlla le tue notifiche per i dettagli'
      });
      onClose?.();
      
      // Force notifications refresh after successful claim
      setTimeout(() => {
        if (data?.nextRoute) {
          window.location.href = data.nextRoute;
        } else {
          // Default to notifications page to show the new notification
          window.location.href = '/notifications';
        }
      }, 1000);
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
      {/* Modal Implementation with proper backdrop */}
      {isOpen && (
        <>
          {/* Custom Backdrop - properly positioned */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
            style={{ 
              pointerEvents: 'auto',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
            onClick={onClose}
          />
          
          {/* Modal Content - M1SSION™ Style - Mobile Optimized */}
          <div 
            className="fixed inset-4 z-[9999] flex items-center justify-center"
            style={{ 
              pointerEvents: 'auto',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'env(safe-area-inset-top, 16px) env(safe-area-inset-right, 16px) env(safe-area-inset-bottom, 16px) env(safe-area-inset-left, 16px)'
            }}
          >
            <div className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border border-[#00D1FF]/30 rounded-2xl shadow-[0_0_50px_rgba(0,209,255,0.4)] backdrop-blur-xl relative overflow-hidden w-full max-w-md max-h-full overflow-y-auto">
              {/* Neon glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/5 via-transparent to-[#FF1493]/5 rounded-2xl"></div>
              {/* Header */}
              <div className="relative z-10 text-center py-6 px-6 border-b border-[#00D1FF]/20">
                <div className="text-3xl mb-2">🛡️</div>
                <h2 className="text-2xl font-bold text-white">Premio Trovato!</h2>
                <div className="text-[#00D1FF] text-sm font-medium mt-1">
                  Hai scoperto un marker con premi speciali
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="relative z-10 space-y-6 p-6 max-h-[60vh] overflow-y-auto">
                 {/* Rewards List */}
                <div className="space-y-4">
                  {(() => {
                    console.log('M1QR-DEBUG: Rendering rewards for marker:', markerId, 'Total rewards:', rewards.length);
                    
                    return rewards
                      .filter(reward => {
                        // Filter out corrupted or invalid rewards
                        if (!reward.reward_type) {
                          console.warn('M1QR-DEBUG: Filtering out reward with no type:', reward);
                          return false;
                        }
                        
                        // Enhanced message validation
                        if (reward.reward_type === 'message') {
                          const message = reward.payload?.text || reward.description || '';
                          const cleanMessage = message.trim();
                          
                          // Filter out severely corrupted messages
                          const isCorrupted = 
                            cleanMessage.length === 0 || 
                            cleanMessage.length === 1 ||
                            /^[^\w\s]*$/.test(cleanMessage) ||
                            ['', ',', 'è', 'Pè', 'dsdf', 'ciao', 'M1', 'm1'].includes(cleanMessage.toLowerCase());
                          
                          if (isCorrupted) {
                            console.warn('M1QR-DEBUG: Filtering out corrupted message:', cleanMessage);
                            return false;
                          }
                        }
                        
                        console.log('M1QR-DEBUG: Valid reward:', reward.reward_type, reward.description?.substring(0, 50));
                        return true;
                      })
                      .slice(0, 3); // Limit to max 3 rewards per modal
                  })()
                    .map((reward, index) => {
                      // Clean up message content for display
                      let displayDescription = reward.description;
                      if (reward.reward_type === 'message') {
                        const message = reward.payload?.text || reward.description || '';
                        const cleanMessage = message.trim();
                        if (!cleanMessage || cleanMessage.length < 2 || /^[^\w\s]*$/.test(cleanMessage)) {
                          displayDescription = "Premio messaggio speciale!";
                        } else {
                          displayDescription = cleanMessage;
                        }
                      }

                      return (
                        <div key={index} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00D1FF]/10 via-[#FF1493]/10 to-[#00D1FF]/10 border border-[#00D1FF]/30 p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00D1FF]/30 to-[#FF1493]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                              <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]">
                                {getRewardIcon(reward.reward_type)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-bold text-lg">
                                {reward.reward_type === 'buzz_free' ? 'BUZZ GRATUITO' : 
                                 reward.reward_type === 'xp_points' ? 'PUNTI ESPERIENZA' :
                                 reward.reward_type === 'message' ? 'PREMIO MESSAGGIO' :
                                 reward.reward_type === 'event_ticket' ? 'BIGLIETTO EVENTO' :
                                 reward.reward_type === 'badge' ? 'DISTINTIVO' :
                                 displayDescription || `Premio ${reward.reward_type}`}
                              </div>
                              {reward.reward_type === 'buzz_free' && (
                                <div className="text-[#00D1FF] text-sm font-semibold">
                                  +{reward.payload?.buzzCount || 1} BUZZ gratuiti
                                </div>
                              )}
                              {reward.reward_type === 'xp_points' && (
                                <div className="text-[#00D1FF] text-sm font-semibold">
                                  +{reward.payload?.xp || 10} XP
                                </div>
                              )}
                              {reward.reward_type === 'message' && displayDescription && (
                                <div className="text-gray-300 text-sm">
                                  {displayDescription}
                                </div>
                              )}
                              {reward.reward_type === 'event_ticket' && (
                                <div className="text-[#00D1FF] text-sm font-semibold">
                                  Tipo: {reward.payload?.ticket_type || 'Standard'}
                                </div>
                              )}
                              {reward.reward_type === 'badge' && displayDescription && (
                                <div className="text-gray-300 text-sm">
                                  {displayDescription}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-[#00D1FF]/20">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isClaiming}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800/50 transition-all duration-300"
                  >
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-bold hover:shadow-[0_0_30px_rgba(0,209,255,0.6)] transition-all duration-300 transform hover:scale-105"
                    data-testid="claim-reward-cta"
                  >
                    {isClaiming ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Riscattando...
                      </div>
                    ) : (
                      'Riscatta subito'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClaimRewardModal;