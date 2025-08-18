// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMarkerRedemption } from '@/hooks/useMarkerRedemption';

interface MarkerReward {
  reward_type: string;
  payload: any;
  description: string;
}

interface M1ssionMarkerPopupProps {
  markerId: string;
  markerTitle: string;
  rewards: MarkerReward[];
  userDistance?: number;
  onClose: () => void;
}

const M1ssionMarkerPopup: React.FC<M1ssionMarkerPopupProps> = ({
  markerId,
  markerTitle,
  rewards,
  userDistance,
  onClose
}) => {
  const { claimReward, isLoading, error, isSuccess } = useMarkerRedemption();

  // Console logging for M1MARK-TRACE
  React.useEffect(() => {
    console.info('M1MARK-TRACE: POPUP_OPENED', { 
      marker_id: markerId, 
      rewards_count: rewards.length,
      user_distance: userDistance 
    });
  }, [markerId, rewards.length, userDistance]);

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

  const getRewardLabel = (reward: MarkerReward) => {
    switch (reward.reward_type) {
      case 'buzz_free':
        return `${reward.payload?.buzzCount || 1} BUZZ gratuiti`;
      case 'xp_points':
        return `+${reward.payload?.xp || 10} XP`;
      case 'message':
        return reward.payload?.text || 'Messaggio speciale';
      case 'event_ticket':
        return 'Biglietto evento';
      case 'badge':
        return 'Badge speciale';
      default:
        return reward.description || 'Premio misterioso';
    }
  };

  const handleRedeem = async () => {
    console.info('M1MARK-TRACE: REDEEM_REQUESTED', { marker_id: markerId });
    
    try {
      const result = await claimReward(markerId);
      
      if (result.success) {
        console.info('M1MARK-TRACE: REDEEM_SUCCESS', { 
          marker_id: markerId, 
          receipt_id: result.receipt_id 
        });
        
        // Auto-close popup after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('M1MARK-TRACE: REDEEM_ERROR', { 
          marker_id: markerId, 
          code: result.code, 
          httpStatus: result.httpStatus 
        });
      }
    } catch (err) {
      console.error('M1MARK-TRACE: REDEEM_ERROR', { 
        marker_id: markerId, 
        error: err 
      });
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Accesso negato - effettua il login';
      case 'OUT_OF_RANGE':
        return 'Troppo lontano dal marker';
      case 'ALREADY_CLAIMED':
        return 'Premio già riscattato ✅';
      case 'EXPIRED':
        return 'Marker scaduto';
      case 'INACTIVE':
        return 'Marker non attivo';
      case 'RATE_LIMITED':
        return 'Troppi tentativi - riprova più tardi';
      default:
        return error.message || 'Errore nel riscatto';
    }
  };

  return (
    <div className="m1ssion-marker-popup">
      {/* Glass container with neon glow */}
      <div className="glass-container p-4 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1">
            {markerTitle}
          </h3>
          {userDistance && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-cyan-400">
              Distanza: {Math.round(userDistance)}m
            </p>
          )}
        </div>

        {/* Rewards List */}
        <div className="space-y-3 mb-4">
          {rewards.map((reward, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-2xl">{getRewardIcon(reward.reward_type)}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {getRewardLabel(reward)}
                </div>
                {reward.description && reward.description !== getRewardLabel(reward) && (
                  <div className="text-xs text-gray-300 mt-1">
                    {reward.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300 text-center">
              {getErrorMessage()}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg animate-pulse">
            <p className="text-sm text-green-300 text-center">
              Premio riscattato con successo! ✅
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Chiudi
          </Button>
          
          {!isSuccess && (
            <Button 
              onClick={handleRedeem}
              disabled={isLoading || error?.code === 'ALREADY_CLAIMED'}
              data-testid="claim-reward-cta"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Riscattando...
                </div>
              ) : (
                'Riscatta ora'
              )}
            </Button>
          )}
        </div>

        {/* Neon glow anchor - cyan chevron at bottom */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-4 bg-black border-r-2 border-b-2 border-cyan-400 rotate-45 shadow-[0_0_10px_rgba(0,255,255,0.6)]"></div>
        </div>
      </div>
    </div>
  );
};

export default M1ssionMarkerPopup;