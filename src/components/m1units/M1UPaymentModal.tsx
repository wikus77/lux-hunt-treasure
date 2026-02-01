/**
 * M1U Payment Modal — FULLSCREEN con animazione FLIP
 * REVOLUT STYLE: stesse animazioni e design di M1UShopModal
 * 
 * 🏪 STORE COMPLIANCE (29/01/2026):
 * - Stripe checkout on WEB only
 * - Native platforms use Apple IAP / Google Play Billing
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import M1UPaymentFlipOverlay from '@/components/m1units/M1UPaymentFlipOverlay';
import M1UPaymentContent from '@/components/m1units/M1UPaymentContent';

interface M1UPaymentModalProps {
  isOpen: boolean;
  packName: string;
  packCode: string;
  m1uAmount: number;
  priceEur: number;
  priceCents: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const M1UPaymentModal: React.FC<M1UPaymentModalProps> = ({ 
  isOpen,
  packName,
  packCode,
  m1uAmount,
  priceEur,
  priceCents,
  onSuccess, 
  onCancel 
}) => {
  return (
    <M1UPaymentFlipOverlay
      open={isOpen}
      onClose={onCancel}
    >
      <M1UPaymentContent
        packName={packName}
        packCode={packCode}
        m1uAmount={m1uAmount}
        priceEur={priceEur}
        priceCents={priceCents}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </M1UPaymentFlipOverlay>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
