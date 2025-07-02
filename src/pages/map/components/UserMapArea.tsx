
import React from 'react';
import { Circle, Popup } from 'react-leaflet';

interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  created_at: string;
  week: number;
  isActive: boolean;
}

interface UserMapAreasProps {
  areas: BuzzMapArea[];
}

const UserMapAreas: React.FC<UserMapAreasProps> = ({ areas }) => {
  console.log('🗺️ UserMapAreas - Rendering areas:', areas.length);

  if (areas.length === 0) {
    return null;
  }

  // Show only the latest area
  const latestArea = areas.reduce((latest, current) => {
    const latestTime = new Date(latest.created_at).getTime();
    const currentTime = new Date(current.created_at).getTime();
    return currentTime > latestTime ? current : latest;
  });

  const radiusMeters = latestArea.radius_km * 1000;

  return (
    <Circle
      center={[latestArea.lat, latestArea.lng]}
      radius={radiusMeters}
      pathOptions={{
        color: '#00D1FF',
        fillColor: '#00D1FF',
        fillOpacity: 0.15,
        weight: 3,
        opacity: 0.8,
        className: 'buzz-area-glow'
      }}
      eventHandlers={{
        mouseover: (e) => {
          e.target.setStyle({ fillOpacity: 0.25, weight: 4 });
        },
        mouseout: (e) => {
          e.target.setStyle({ fillOpacity: 0.15, weight: 3 });
        }
      }}
    >
      <Popup>
        <div className="p-3 text-center">
          <div className="font-bold text-cyan-400 mb-2">🎯 AREA BUZZ MAPPA</div>
          <div className="text-sm mb-1">Raggio: {latestArea.radius_km.toFixed(1)} km</div>
          <div className="text-xs text-gray-400 mb-2">
            Generata: {new Date(latestArea.created_at).toLocaleDateString()}
          </div>
          <div className="text-xs text-cyan-300">
            Settimana: {latestArea.week}
          </div>
        </div>
      </Popup>
    </Circle>
  );
};

export default UserMapAreas;
