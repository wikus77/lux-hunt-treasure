// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React from 'react';
import { Circle } from 'react-leaflet';

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

  const validAreas = (areas || []).filter(a => Number.isFinite(a?.lat) && Number.isFinite(a?.lng) && Number.isFinite(a?.radius_km));
  if (validAreas.length === 0) {
    if (import.meta.env.DEV) console.warn('Layer skipped: missing lat/lng', { comp: 'UserMapAreas' });
    return null;
  }

  const latestArea = validAreas.reduce((latest, current) => {
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
      {/* Popup removed on /map to avoid interference with M1SSION modal */}
    </Circle>
  );
};

export default UserMapAreas;
