// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { notifyShadowContext } from '@/stores/entityOverlayStore'; // 🌑 Shadow Protocol v3

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
  rewards: rawRewards,
  onSuccess
}) => {
  // 🛡️ Guardia: rewards sempre array (previene crash)
  const rewards = Array.isArray(rawRewards) ? rawRewards : [];
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [claimedRewardType, setClaimedRewardType] = useState<string>('');
  const [claimedAmount, setClaimedAmount] = useState<number>(0);

  // 🎉 Trigger confetti celebration - OTTIMIZZATO (meno particelle = no lag)
  const triggerCelebration = (rewardType: string) => {
    const colors = rewardType === 'm1u' 
      ? ['#FFD700', '#FFA500'] // Gold for M1U
      : rewardType === 'physical_prize'
      ? ['#FF1493', '#00D1FF'] // Pink/Cyan for prizes
      : ['#00D1FF', '#FF1493']; // Cyan/Pink default

    // Single burst - ottimizzato per mobile
    confetti({
      particleCount: 50, // Ridotto da 100
      spread: 60,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true, // Rispetta preferenze utente
      gravity: 1.2, // Caduta più veloce
      decay: 0.95 // Dissolvenza più rapida
    });
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'buzz_free': return '⚡';
      case 'xp_points': return '🏆';
      case 'message': return '📩';
      case 'event_ticket': return '🎫';
      case 'badge': return '🏅';
      case 'm1u': return '💰';
      case 'clue': return '🔍';
      case 'physical_prize': return '🎁';
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

    // 🔄 PRIMA chiama l'API, POI mostra animazione
    try {
      console.log('M1QR-TRACE', { step: 'calling_api', markerId });
      
      const { data, error } = await supabase.functions
        .invoke('claim-marker-reward', { body: { markerId } });

      console.log('M1QR-TRACE', { step: 'api_response', data, error });

      if (error?.status === 401) { 
        setIsClaiming(false);
        toast.error('Sessione scaduta, effettua nuovamente il login');
        setTimeout(() => window.location.href = '/login', 1000);
        return; 
      }

      if (data?.ok === true) {
        // 🔍 DEBUG: Log completo del summary
        console.log('M1QR-TRACE', { 
          step: 'claim_success', 
          summary: data?.summary,
          summaryTypes: data?.summary?.map((s: any) => s.type)
        });
        
        // Trova l'importo M1U dal server
        const m1uEntry = data?.summary?.find((s: any) => s.type === 'm1u');
        const serverM1U = m1uEntry?.info?.amount;
        const rewardType = data?.summary?.[0]?.type || rewards[0]?.reward_type?.toLowerCase() || 'unknown';
        
        // 🚨 Se c'è un errore nel summary M1U, mostralo (solo errori)
        if (m1uEntry?.info?.error) {
          toast.error(`Errore M1U: ${m1uEntry.info.error}`);
        }
        
        // 🎉 Mostra animazione di successo PRIMA
        setClaimedRewardType(rewardType);
        setClaimedAmount(serverM1U || rewards[0]?.payload?.amount || 50);
        setShowSuccessAnimation(true);
        triggerCelebration(rewardType);
        
        // GA4 tracking
        import('@/lib/analytics/ga4').then(({ trackMarkerRewardClaimed }) => {
          trackMarkerRewardClaimed(markerId, rewardType);
        }).catch(() => {});

        // ⏰ Chiudi dopo 2.5 secondi e POI aggiorna il Pill M1U
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setIsClaiming(false);
          onClose?.();
          
          // 🎰 DOPO che l'animazione si chiude, aggiorna il Pill M1U
          // Così l'utente vede l'animazione slot machine!
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('m1u-balance-updated'));
          }, 100);
          
          if (rewardType === 'buzz_free') {
            setTimeout(() => { window.location.href = '/buzz'; }, 300);
          }
          
          // 🌑 Shadow Protocol v3 - Trigger contestuale REWARD
          notifyShadowContext('reward');
          
          onSuccess?.();
        }, 2500);
        
        return;
      }

      // Gestione errori - NON mostrare animazione
      setIsClaiming(false);
      
      if (data?.code === 'ALREADY_CLAIMED') { 
        console.log('M1QR-TRACE', { step: 'already_claimed' });
        toast.info('Premio già riscattato in precedenza');
        onClose?.();
        return; 
      }
      
      if (data?.code === 'NO_REWARD') { 
        console.error('M1QR-TRACE', { step: 'no_reward' });
        toast.error('Nessuna ricompensa trovata per questo marker');
        return; 
      }

      console.error('M1QR-TRACE', { step: 'claim_error', markerId, error, data });
      toast.error('Errore nel riscatto del premio');
      
    } catch (apiError) {
      console.error('M1QR-TRACE: API error:', apiError);
      setIsClaiming(false);
      toast.error('Errore di connessione, riprova');
    }
  };

  // 🎉 Success Animation Component - ULTRA SEMPLICE (no lag, no flicker)
  const SuccessAnimation = () => {
    const icon = claimedRewardType === 'm1u' ? '💰' : 
                 claimedRewardType === 'physical_prize' ? '🎁' :
                 claimedRewardType === 'buzz_free' ? '⚡' :
                 claimedRewardType === 'clue' ? '🔍' :
                 claimedRewardType === 'xp_points' ? '🏆' : '🎉';
    
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
      >
        <div className="text-center px-8">
          {/* Icon - static, no animation */}
          <div className="text-8xl mb-6">{icon}</div>
          
          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-4">
            PREMIO SBLOCCATO!
          </h2>
          
          {/* Reward Details */}
          <div className="space-y-2">
            {claimedRewardType === 'm1u' && (
              <p className="text-3xl font-bold text-[#FFD700]">
                +{claimedAmount} M1U
              </p>
            )}
            {claimedRewardType === 'buzz_free' && (
              <p className="text-2xl font-bold text-[#00D1FF]">
                BUZZ Gratuito Sbloccato!
              </p>
            )}
            {claimedRewardType === 'physical_prize' && (
              <p className="text-2xl font-bold text-[#FF1493]">
                HAI VINTO UN PREMIO!
              </p>
            )}
            {claimedRewardType === 'clue' && (
              <p className="text-2xl font-bold text-[#00D1FF]">
                Nuovo Indizio Trovato!
              </p>
            )}
            {claimedRewardType === 'xp_points' && (
              <p className="text-2xl font-bold text-[#F59E0B]">
                +{claimedAmount || 10} XP Guadagnati!
              </p>
            )}
            <p className="text-white/60 mt-6 text-sm">
              Controlla le notifiche per i dettagli
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 🎉 Success Animation Overlay - Pure CSS (no framer-motion) */}
      {showSuccessAnimation && <SuccessAnimation />}

      {/* Modal Implementation with proper backdrop */}
      {isOpen && !showSuccessAnimation && (
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
                 {/* 🎯 Handle case with no rewards */}
                 {rewards.length === 0 && (
                   <div className="text-center py-8">
                     <div className="text-5xl mb-4">🔍</div>
                     <p className="text-white/70 text-lg">
                       Caricamento premi in corso...
                     </p>
                     <p className="text-white/50 text-sm mt-2">
                       Se il problema persiste, prova a ricaricare la pagina
                     </p>
                   </div>
                 )}
                 
                 {/* Rewards List */}
                <div className="space-y-4">
                  {rewards.length > 0 && rewards
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
                      
                      return true;
                    })
                    .slice(0, 3)
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
                                 reward.reward_type === 'm1u' ? 'CREDITI M1U' :
                                 reward.reward_type === 'clue' ? 'INDIZIO SEGRETO' :
                                 reward.reward_type === 'physical_prize' ? 'PREMIO FISICO' :
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
                              {reward.reward_type === 'm1u' && (
                                <div className="text-[#FFD700] text-sm font-semibold">
                                  +{reward.payload?.amount || 50} M1U sul tuo conto
                                </div>
                              )}
                              {reward.reward_type === 'clue' && (
                                <div className="text-[#00D1FF] text-sm font-semibold">
                                  Indizio per la missione attiva
                                </div>
                              )}
                              {reward.reward_type === 'physical_prize' && (
                                <div className="text-[#FF1493] text-sm font-semibold">
                                  🎁 {reward.payload?.prize_name || 'Premio speciale'}
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
                    disabled={isClaiming || rewards.length === 0}
                    className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-bold hover:shadow-[0_0_30px_rgba(0,209,255,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="claim-reward-cta"
                  >
                    {isClaiming ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Riscattando...
                      </div>
                    ) : rewards.length === 0 ? (
                      'Caricamento...'
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