
import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

type SearchAreaMapLayerProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => void;
};

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea
}) => {
  return (
    <>
      {searchAreas.map((area) => (
        <React.Fragment key={area.id}>
          <Circle
            center={[area.lat, area.lng]}
            radius={area.radius}
            pathOptions={{
              color: area.isAI ? '#9b87f5' : '#00D1FF',
              fillColor: area.isAI ? '#7E69AB' : '#00D1FF',
              fillOpacity: 0.2,
              weight: 2
            }}
            eventHandlers={{
              click: () => {
                setActiveSearchArea(area.id);
              }
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="font-medium mb-2">{area.label || "Area di interesse"}</div>
                <div className="text-sm mb-3">Raggio: {(area.radius/1000).toFixed(2)} km</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs flex items-center gap-1 flex-1"
                    onClick={() => setActiveSearchArea(area.id)}
                  >
                    <Edit className="w-3 h-3" /> Modifica
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="text-xs flex items-center gap-1 flex-1"
                    onClick={() => deleteSearchArea(area.id)}
                  >
                    <Trash2 className="w-3 h-3" /> Elimina
                  </Button>
                </div>
              </div>
            </Popup>
          </Circle>
        </React.Fragment>
      ))}
    </>
  );
};

export default SearchAreaMapLayer;
