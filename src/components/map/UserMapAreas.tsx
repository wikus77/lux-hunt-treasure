
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

  // 🚨 FORCE CHECK: Never render if no areas or invalid areas
  if (!areas || areas.length === 0) {
    console.log('🛑 UserMapAreas: No areas to render - returning null');
    return null;
  }

  // 🚨 TRIPLE VALIDATION: Validate area data + recent date filter
  const validAreas = areas.filter(area => 
    area.lat && area.lng && area.radius_km && 
    area.lat !== 0 && area.lng !== 0 &&
    area.created_at && new Date(area.created_at) >= new Date('2025-07-17')
  );

  if (validAreas.length === 0) {
    console.log('🛑 UserMapAreas: No valid recent areas found - returning null');
    return null;
  }

  // Show only the latest valid area
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
    />
  );
};

export default UserMapAreas;
