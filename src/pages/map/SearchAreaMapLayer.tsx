
import React from 'react';
import { Circle, Popup } from 'react-leaflet';
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
  if (searchAreas.length === 0) {
    return null;
  }

  return (
    <>
      {searchAreas.map((area) => (
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
        >
          <Popup>
            <div className="p-3 text-center">
              <div className="font-bold text-cyan-400 mb-2">🔍 {area.label}</div>
              <div className="text-sm mb-2">Raggio: {(area.radius / 1000).toFixed(1)} km</div>
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteSearchArea(area.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Elimina
                </Button>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default SearchAreaMapLayer;
