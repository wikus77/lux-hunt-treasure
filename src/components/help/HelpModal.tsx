// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🆘 Help Modal — FULLSCREEN con animazione identica a M1U Shop Modal
import React from 'react';
import HelpFlipOverlay from './HelpFlipOverlay';
import HelpContent from './HelpContent';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
    >
      <HelpContent onClose={onClose} />
    </HelpFlipOverlay>
  );
};

export default HelpModal;
