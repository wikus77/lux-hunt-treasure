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

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas }) => {
  console.log('🗺️ BuzzMapAreas - Rendering areas:', areas?.length || 0);

  if (!areas || areas.length === 0) {
    console.log('🗺️ BuzzMapAreas - No areas to display');
    return null;
  }

  const validAreas = areas.filter(a => 
    Number.isFinite(a?.lat) && 
    Number.isFinite(a?.lng) && 
    Number.isFinite(a?.radius_km) &&
    a.isActive
  );

  if (validAreas.length === 0) {
    console.warn('🗺️ BuzzMapAreas - No valid areas after filtering');
    return null;
  }

  return (
    <>
      {validAreas.map((area) => {
        const radiusMeters = area.radius_km * 1000;
        
        return (
          <Circle
            key={area.id}
            center={[area.lat, area.lng]}
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
      })}
    </>
  );
};

export default BuzzMapAreas;