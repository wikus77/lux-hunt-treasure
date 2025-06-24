
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';

interface BuzzDebugOverlayProps {
  areas: BuzzMapArea[];
  currentColor: string;
  currentColorName: string;
}

const BuzzDebugOverlay: React.FC<BuzzDebugOverlayProps> = ({
  areas,
  currentColor,
  currentColorName
}) => {
  // Debug overlay is now disabled - returning null to hide it completely
  return null;
};

export default BuzzDebugOverlay;
