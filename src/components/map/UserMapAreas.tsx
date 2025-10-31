
import React from 'react';
import { Popup } from 'react-leaflet';
import { SafeCircle } from '@/components/map/safe/SafeCircle';
import { isValidLatLng, isValidRadius, logGuard } from '@/lib/map/geoGuards';

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

  // 🚨 FORCE CHECK: Never render if no areas
  if (!areas || areas.length === 0) {
    console.log('🛑 UserMapAreas: No areas to render - returning null');
    return null;
  }

  // Guard robusta con validazione completa
  const validAreas = areas.filter(area => {
    const radiusMeters = (area?.radius_km ?? 0) * 1000;
    const createdAt = area?.created_at ? new Date(area.created_at) : null;
    const isRecent = createdAt && createdAt >= new Date('2025-07-17');
    const isValid = 
      isValidLatLng(area?.lat, area?.lng) && 
      isValidRadius(radiusMeters) &&
      isRecent;
    
    if (!isValid) {
      logGuard('UserMapAreas (src/components): area skipped', {
        id: area?.id,
        lat: area?.lat,
        lng: area?.lng,
        radius_km: area?.radius_km,
        created_at: area?.created_at
      });
    }
    
    return isValid;
  });

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
    <SafeCircle
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
    </SafeCircle>
  );
};

export default UserMapAreas;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

