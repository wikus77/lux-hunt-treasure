
import React from 'react';
import { Circle } from 'react-leaflet';

interface PrizeLocationCircleProps {
  center?: [number, number];
  radius?: number;
}

const PrizeLocationCircle: React.FC<PrizeLocationCircleProps> = ({ center, radius }) => {
  if (!center || !Array.isArray(center) || center.length !== 2 || !radius) {
    return null;
  }
  
  return (
    <Circle
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
