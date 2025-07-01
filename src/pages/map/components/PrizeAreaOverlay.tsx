
import React from 'react';
import { Circle, Popup } from 'react-leaflet';

interface PrizeAreaOverlayProps {
  prizeLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
  visible?: boolean;
}

const PrizeAreaOverlay: React.FC<PrizeAreaOverlayProps> = ({ 
  prizeLocation, 
  visible = true 
}) => {
  if (!prizeLocation || !visible) {
    return null;
  }

  return (
    <Circle
      center={[prizeLocation.lat, prizeLocation.lng]}
      radius={prizeLocation.radius}
      pathOptions={{
        fillColor: '#FFD700',
        fillOpacity: 0.2,
        color: '#FFD700',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10'
      }}
    >
      <Popup>
        <div className="p-2 bg-black/90 text-white rounded">
          <h3 className="font-bold text-yellow-400 mb-2">🏆 Area Premio</h3>
          <p className="text-sm">Il premio si trova in questa zona!</p>
        </div>
      </Popup>
    </Circle>
  );
};

export default PrizeAreaOverlay;
