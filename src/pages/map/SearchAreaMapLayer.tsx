// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React from 'react';
import { Circle } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SearchArea {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
}

interface SearchAreaMapLayerProps {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea
}) => {
  if (!searchAreas || searchAreas.length === 0) {
    return null;
  }

  const validAreas = searchAreas.filter(a => Number.isFinite(a?.lat) && Number.isFinite(a?.lng) && Number.isFinite(a?.radius));
  if (validAreas.length === 0) {
    if (import.meta.env.DEV) console.warn('Layer skipped: missing lat/lng', { comp: 'SearchAreaMapLayer' });
    return null;
  }

  return (
    <>
      {validAreas.map((area) => (
        <Circle
          key={area.id}
          center={[area.lat, area.lng]}
          radius={area.radius}
          pathOptions={{
            color: '#00f0ff',
            fillColor: '#00f0ff',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.6,
            className: 'search-area-pulse'
          }}
          eventHandlers={{
            click: () => setActiveSearchArea(area.id),
            mouseover: (e) => {
              e.target.setStyle({ fillOpacity: 0.2, weight: 3 });
            },
            mouseout: (e) => {
              e.target.setStyle({ fillOpacity: 0.1, weight: 2 });
            }
          }}
        />
      ))}
    </>
  );
};

export default SearchAreaMapLayer;
