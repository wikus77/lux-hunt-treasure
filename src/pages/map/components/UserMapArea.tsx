// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
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

  // Guard robusta con validazione completa
  const validAreas = (areas || []).filter(a => {
    const radiusMeters = (a?.radius_km ?? 0) * 1000;
    const isValid = isValidLatLng(a?.lat, a?.lng) && isValidRadius(radiusMeters);
    
    if (!isValid) {
      logGuard('UserMapAreas: area skipped', {
        id: a?.id,
        lat: a?.lat,
        lng: a?.lng,
        radius_km: a?.radius_km
      });
    }
    
    return isValid;
  });
  
  if (validAreas.length === 0) {
    return null;
  }

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
