
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
      {areas.map((area, index) => (
        <Circle
          key={area.id}
          center={[area.latitude, area.longitude]}
          radius={area.radius_km * 1000} // Converti km in metri per Leaflet
          pathOptions={{
            color: '#00cfff', // Neon blu M1SSION
            fillColor: '#00cfff',
            fillOpacity: 0.1,
            weight: 2,
            opacity: index === areas.length - 1 ? 1 : 0.6, // Area più recente più visibile
          }}
          className="buzz-map-area"
        />
      ))}
      
      <style>
        {`
        .buzz-map-area {
          filter: drop-shadow(0 0 10px rgba(0, 207, 255, 0.6));
          animation: buzzGlow 3s infinite ease-in-out;
        }
        
        @keyframes buzzGlow {
          0% { filter: drop-shadow(0 0 5px rgba(0, 207, 255, 0.4)); }
          50% { filter: drop-shadow(0 0 15px rgba(0, 207, 255, 0.8)); }
          100% { filter: drop-shadow(0 0 5px rgba(0, 207, 255, 0.4)); }
        }
        `}
      </style>
    </>
  );
};

export default BuzzMapAreas;
