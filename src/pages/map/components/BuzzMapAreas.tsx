
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import BuzzCircleRenderer from './BuzzCircleRenderer';
import BuzzDebugOverlay from './BuzzDebugOverlay';
import { getCurrentColor, getCurrentColorName, getBuzzGlowStyles } from './BuzzColorManager';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas }) => {
  const currentColor = getCurrentColor();
  const currentColorName = getCurrentColorName();
  
  console.log('🗺️ BuzzMapAreas - Main component rendering with FIXED COLOR:', {
    areas: areas,
    currentColor: currentColor,
    currentColorName: currentColorName
  });

  return (
    <>
      {/* Circle rendering logic */}
      <BuzzCircleRenderer areas={areas} />
      
      {/* Debug overlay is now disabled */}
      
      {/* Glow styles */}
      <style>
        {getBuzzGlowStyles(currentColor)}
      </style>
    </>
  );
};

export default BuzzMapAreas;
