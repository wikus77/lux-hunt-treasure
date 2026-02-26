/**
 * Delete Account modal — same overlay/stack as M1UnitsShopModal (Apple 5.1.1(v))
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */
import React from 'react';
import { DeleteAccountFlipOverlay } from './DeleteAccountFlipOverlay';
import { DeleteAccountModalContent } from './DeleteAccountModalContent';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  originRect?: DOMRect | null;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  originRect = null,
}) => {
  return (
    <DeleteAccountFlipOverlay open={isOpen} originRect={originRect ?? null} onClose={onClose}>
      <DeleteAccountModalContent onClose={onClose} />
    </DeleteAccountFlipOverlay>
  );
};

export default DeleteAccountModal;
