/**
 * Buzz Map Button Dock - Mounts existing BuzzMapButtonSecure component
 */
import React from 'react';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';

const BuzzMapButtonDock: React.FC = () => {
  const handleBuzzPress = () => {
    console.log('[Living Map 3D] Buzz pressed');
    // Additional logic can be added here if needed
  };

  const handleAreaGenerated = (lat: number, lng: number, radius: number) => {
    console.log('[Living Map 3D] Area generated:', { lat, lng, radius });
    // Additional logic for area generation can be added here
  };

  return (
    <div className="living-map-buzz-dock">
      <BuzzMapButtonSecure
        onBuzzPress={handleBuzzPress}
        onAreaGenerated={handleAreaGenerated}
      />
    </div>
  );
};

export default BuzzMapButtonDock;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
