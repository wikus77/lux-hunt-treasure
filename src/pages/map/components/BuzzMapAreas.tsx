
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import BuzzCircleRenderer from './BuzzCircleRenderer';
import BuzzDebugOverlay from './BuzzDebugOverlay';
import { getCurrentColor, getCurrentColorName, getBuzzGlowStyles } from './BuzzColorManager';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
  buzzCounter?: number; // For dynamic color calculation
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas, buzzCounter = 0 }) => {
  const currentColor = getCurrentColor(buzzCounter);
  const currentColorName = getCurrentColorName(buzzCounter);
  
  console.log('🗺️ BuzzMapAreas - Main component rendering with:', {
    areas: areas,
    buzzCounter: buzzCounter,
    currentColor: currentColor,
    currentColorName: currentColorName
  });

  return (
    <>
      {/* Circle rendering logic */}
      <BuzzCircleRenderer areas={areas} buzzCounter={buzzCounter} />
      
      {/* Debug overlay */}
      <BuzzDebugOverlay 
        areas={areas}
        buzzCounter={buzzCounter}
        currentColor={currentColor}
        currentColorName={currentColorName}
      />
      
      {/* Glow styles */}
      <style>
        {getBuzzGlowStyles(currentColor)}
      </style>
    </>
  );
};

export default BuzzMapAreas;
