
import React from 'react';
import { Circle, Popup } from 'react-leaflet';

interface UserMapAreaProps {
  areas: {
    id: string;
    lat: number;
    lng: number;
    radius_km: number;
    created_at: string;
    isActive: boolean;
  }[];
  onAreaClick?: (areaId: string) => void;
}

const UserMapArea: React.FC<UserMapAreaProps> = ({ areas, onAreaClick }) => {
  console.log('🗺️ UserMapArea rendering:', areas.length, 'areas');

  if (areas.length === 0) {
    return null;
  }

  return (
    <>
      {areas.map((area) => (
        <Circle
          key={area.id}
          center={[area.lat, area.lng]}
          radius={area.radius_km * 1000}
          pathOptions={{
            fillColor: '#00D1FF',
            fillOpacity: 0.3,
            color: '#00D1FF',
            weight: 2,
            opacity: 0.8
          }}
          eventHandlers={{
            click: () => {
              console.log('🔍 Area clicked:', area.id);
              if (onAreaClick) {
                onAreaClick(area.id);
              }
            }
          }}
        >
          <Popup>
            <div className="p-2 bg-black/90 text-white rounded">
              <h3 className="font-bold text-cyan-400 mb-2">Area BUZZ</h3>
              <p className="text-sm mb-2">Raggio: {area.radius_km.toFixed(1)} km</p>
              <p className="text-xs text-gray-300">
                Creata: {new Date(area.created_at).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default UserMapArea;
