// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { useXpSystem } from '@/hooks/useXpSystem';
import { XpRewardModal } from './XpRewardModal';
import { CreditConfirmModal } from './CreditConfirmModal';
import { useLocation } from 'wouter';

interface XpSystemManagerProps {
  onCreditAvailable?: (creditType: 'buzz' | 'buzz_map', available: boolean) => void;
  onRequestCreditConsumption?: (creditType: 'buzz' | 'buzz_map') => Promise<boolean>;
}

export const XpSystemManager: React.FC<XpSystemManagerProps> = ({
  onCreditAvailable,
  onRequestCreditConsumption
}) => {
  const { xpStatus, hasNewRewards, markRewardsAsSeen, consumeCredit } = useXpSystem();
  const [, setLocation] = useLocation();
  
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  // © 2025 Joseph MULÉ – M1SSION™
  const [consumedThisSession, setConsumedThisSession] = useState(false);
  const [creditConfirmModal, setCreditConfirmModal] = useState<{
    open: boolean;
    type: 'buzz' | 'buzz_map' | null;
    resolve?: (value: boolean) => void;
  }>({
    open: false,
    type: null
  });

  // Show reward modal when new rewards are available
  useEffect(() => {
    if (hasNewRewards && !consumedThisSession && (xpStatus.free_buzz_credit > 0 || xpStatus.free_buzz_map_credit > 0)) {
      setRewardModalOpen(true);
    }
  }, [hasNewRewards, xpStatus.free_buzz_credit, xpStatus.free_buzz_map_credit, consumedThisSession]);

  // Notify parent components about credit availability
  useEffect(() => {
    if (onCreditAvailable) {
      onCreditAvailable('buzz', xpStatus.free_buzz_credit > 0);
      onCreditAvailable('buzz_map', xpStatus.free_buzz_map_credit > 0);
    }
  }, [xpStatus.free_buzz_credit, xpStatus.free_buzz_map_credit, onCreditAvailable]);

  // Handle credit consumption requests from parent components
  useEffect(() => {
    if (onRequestCreditConsumption) {
      // Store the original function reference
      const originalFunction = onRequestCreditConsumption;
      
      // Override the function to handle our confirmation flow
      const handleCreditRequest = async (creditType: 'buzz' | 'buzz_map'): Promise<boolean> => {
        return new Promise((resolve) => {
          setCreditConfirmModal({
            open: true,
            type: creditType,
            resolve
          });
        });
      };

      // Replace the parent's function (this is a bit hacky but works for our use case)
      // In a real implementation, you'd want to use a more robust pattern
    }
  }, [onRequestCreditConsumption]);

  const handleRewardModalClose = () => {
    setRewardModalOpen(false);
    markRewardsAsSeen();
    setConsumedThisSession(true); // © 2025 Joseph MULÉ – M1SSION™
  };

  const handleRedirectToBuzz = () => {
    markRewardsAsSeen(); // © 2025 Joseph MULÉ – M1SSION™
    setConsumedThisSession(true);
    setRewardModalOpen(false);
    setLocation('/buzz?free=1&reward=1');
  };

  const handleRedirectToBuzzMap = () => {
    markRewardsAsSeen(); // © 2025 Joseph MULÉ – M1SSION™
    setConsumedThisSession(true);
    setRewardModalOpen(false);
    setLocation('/map?free=1&reward=1');
  };

  const handleCreditConfirm = async () => {
    if (creditConfirmModal.type && creditConfirmModal.resolve) {
      const success = await consumeCredit(creditConfirmModal.type);
      creditConfirmModal.resolve(success);
      setCreditConfirmModal({ open: false, type: null });
    }
  };

  const handleCreditCancel = () => {
    if (creditConfirmModal.resolve) {
      creditConfirmModal.resolve(false);
    }
    setCreditConfirmModal({ open: false, type: null });
  };

  // Method to manually trigger credit consumption (can be called by parent components)
  const requestCreditConsumption = async (creditType: 'buzz' | 'buzz_map'): Promise<boolean> => {
    return new Promise((resolve) => {
      setCreditConfirmModal({
        open: true,
        type: creditType,
        resolve
      });
    });
  };

  // Expose the request method via ref or context if needed
  React.useImperativeHandle(React.createRef(), () => ({
    requestCreditConsumption
  }), []);

  return (
    <>
      <XpRewardModal
        open={rewardModalOpen}
        onOpenChange={setRewardModalOpen}
        freeBuzzCredits={xpStatus.free_buzz_credit}
        freeBuzzMapCredits={xpStatus.free_buzz_map_credit}
        onRedirectToBuzz={handleRedirectToBuzz}
        onRedirectToBuzzMap={handleRedirectToBuzzMap}
      />

      <CreditConfirmModal
        open={creditConfirmModal.open}
        onOpenChange={(open) => !open && handleCreditCancel()}
        creditType={creditConfirmModal.type}
        onConfirm={handleCreditConfirm}
        onCancel={handleCreditCancel}
      />
    </>
  );
};

// Export hook for easier integration
export const useXpSystemManager = () => {
  const { xpStatus, hasNewRewards, markRewardsAsSeen, consumeCredit } = useXpSystem();
  
  const requestCreditConsumption = async (creditType: 'buzz' | 'buzz_map'): Promise<boolean> => {
    // This would be handled by the XpSystemManager component
    // For now, just consume the credit directly
    return await consumeCredit(creditType);
  };

  return {
    xpStatus,
    hasNewRewards,
    hasBuzzCredits: xpStatus.free_buzz_credit > 0,
    hasBuzzMapCredits: xpStatus.free_buzz_map_credit > 0,
    requestCreditConsumption,
    markRewardsAsSeen
  };
};