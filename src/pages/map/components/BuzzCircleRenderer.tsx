
import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import { getCurrentColor } from './BuzzColorManager';

interface BuzzCircleRendererProps {
  areas: BuzzMapArea[];
}

const BuzzCircleRenderer: React.FC<BuzzCircleRendererProps> = ({ areas }) => {
  const currentColor = getCurrentColor();
  
  console.log('🔵 BuzzCircleRenderer - Rendering circles for areas:', {
    count: areas.length,
    areas: areas.map(area => ({
      id: area.id,
      center: [area.lat, area.lng],
      radius: area.radius_km * 1000, // Convert km to meters for Leaflet
      isActive: area.isActive
    }))
  });

  return (
    <>
      {areas.map((area, index) => {
        const radiusMeters = area.radius_km * 1000; // Convert km to meters
        
        console.log(`🔵 Rendering BUZZ area ${index + 1}:`, {
          id: area.id,
          center: [area.lat, area.lng],
          radiusKm: area.radius_km,
          radiusMeters: radiusMeters,
          color: currentColor,
          isActive: area.isActive
        });

        return (
          <React.Fragment key={`buzz-area-${area.id}-${area.created_at}`}>
            <Circle
              center={[area.lat, area.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: currentColor,
                fillColor: currentColor,
                fillOpacity: 0.15,
                weight: 3,
                opacity: 0.8,
                className: 'buzz-area-glow'
              }}
              eventHandlers={{
                click: () => {
                  console.log('🔵 BUZZ area clicked:', area.id);
                },
                mouseover: (e) => {
                  e.target.setStyle({ fillOpacity: 0.25, weight: 4 });
                },
                mouseout: (e) => {
                  e.target.setStyle({ fillOpacity: 0.15, weight: 3 });
                }
              }}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-bold text-sm mb-1">Area BUZZ MAPPA</div>
                  <div className="text-xs mb-1">Raggio: {area.radius_km.toFixed(1)} km</div>
                  <div className="text-xs text-gray-600">
                    Generata: {new Date(area.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    Settimana: {area.week}
                  </div>
                </div>
              </Popup>
            </Circle>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default BuzzCircleRenderer;
