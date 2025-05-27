
import React from 'react';
import { Circle } from 'react-leaflet';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas }) => {
  console.log('🗺️ Rendering BUZZ map areas:', areas);

  return (
    <>
      {areas.map((area, index) => {
        // 🚨 CONVERSIONE CORRETTA: radius_km → metri per Leaflet
        const radiusInMeters = area.radius_km * 1000;
        
        console.log(`📏 Area ${area.id}: radius_km=${area.radius_km} → ${radiusInMeters}m per Leaflet`);
        
        return (
          <Circle
            key={area.id}
            center={[area.lat, area.lng]}
            radius={radiusInMeters} // 🚨 CRITICO: Converti km in metri per Leaflet
            pathOptions={{
              color: '#00cfff', // Neon blu M1SSION
              fillColor: '#00cfff',
              fillOpacity: 0.15,
              weight: 3,
              opacity: 1, // Sempre visibile al 100% - solo UNA area mostrata
            }}
            className="buzz-map-area"
          />
        );
      })}
      
      <style>
        {`
        .buzz-map-area {
          filter: drop-shadow(0 0 12px rgba(0, 207, 255, 0.7));
          animation: buzzGlow 3s infinite ease-in-out;
        }
        
        @keyframes buzzGlow {
          0% { filter: drop-shadow(0 0 6px rgba(0, 207, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 18px rgba(0, 207, 255, 0.9)); }
          100% { filter: drop-shadow(0 0 6px rgba(0, 207, 255, 0.5)); }
        }
        `}
      </style>
    </>
  );
};

export default BuzzMapAreas;
