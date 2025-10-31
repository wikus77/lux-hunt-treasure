
import React from 'react';
import { SafeCircle } from '@/components/map/safe/SafeCircle';

interface PrizeLocationCircleProps {
  center: [number, number];
  radius: number;
}

const PrizeLocationCircle: React.FC<PrizeLocationCircleProps> = ({ center, radius }) => {
  return (
    <SafeCircle
      center={center}
      radius={radius}
      pathOptions={{
        color: '#00D1FF',
        fillColor: '#00D1FF',
        fillOpacity: 0.2,
        weight: 2
      }}
    />
  );
};

export default PrizeLocationCircle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

