// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 📚 Learn Modal — FULLSCREEN con animazione identica a M1U Shop Modal
import React from 'react';
import { HelpFlipOverlay } from '@/components/help/HelpFlipOverlay';
import LearnContent from './LearnContent';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnModal: React.FC<LearnModalProps> = ({ isOpen, onClose }) => {
  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-learn-portal"
      zIndex={99999}
    >
      <LearnContent onClose={onClose} />
    </HelpFlipOverlay>
  );
};

export default LearnModal;
