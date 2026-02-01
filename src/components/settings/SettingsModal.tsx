/**
 * SettingsModal - Modal FULLSCREEN per le impostazioni
 * REVOLUT STYLE: stesse animazioni e design di AgentProfileModal
 * Si apre premendo la rotella nell'header
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import SettingsFlipOverlay from '@/components/settings/SettingsFlipOverlay';
import SettingsContent from '@/components/settings/SettingsContent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

export function SettingsModal({ isOpen, onClose, originRect = null }: SettingsModalProps) {
  return (
    <SettingsFlipOverlay
      open={isOpen}
      originRect={originRect}
      onClose={onClose}
    >
      <SettingsContent onClose={onClose} />
    </SettingsFlipOverlay>
  );
}

export default SettingsModal;


