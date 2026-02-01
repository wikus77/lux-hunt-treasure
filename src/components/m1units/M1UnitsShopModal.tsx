/**
 * M1 UNITS™ Shop Modal — FULLSCREEN con animazione FLIP
 * REVOLUT STYLE: stesse animazioni e design di AgentProfileModal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import M1UShopFlipOverlay from '@/components/m1units/M1UShopFlipOverlay';
import M1UShopContent from '@/components/m1units/M1UShopContent';

interface M1UnitsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

export const M1UnitsShopModal = ({ isOpen, onClose, originRect = null }: M1UnitsShopModalProps) => {
  return (
    <M1UShopFlipOverlay
      open={isOpen}
      originRect={originRect}
      onClose={onClose}
    >
      <M1UShopContent onClose={onClose} />
    </M1UShopFlipOverlay>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
