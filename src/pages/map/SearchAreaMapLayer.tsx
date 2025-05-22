
import React, { useEffect } from 'react';
import { Circle, Popup, useMap } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import L from 'leaflet';

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
  console.log("AREAS STATE:", searchAreas);
  const map = useMap();
  
  // Fallback rendering using direct Leaflet API to ensure areas are visible
  useEffect(() => {
    console.log("RENDERING AREAS:", searchAreas);
    if (map && searchAreas.length > 0) {
      // Clear previous circles that might have been added directly to the map
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle && !(layer instanceof Circle)) {
          map.removeLayer(layer);
        }
      });
      
      // Add circles directly to the map as a fallback
      searchAreas.forEach(area => {
        L.circle([area.lat, area.lng], {
          radius: area.radius,
          color: area.isAI ? '#9b87f5' : '#00D1FF',
          fillColor: area.isAI ? '#7E69AB' : '#00D1FF',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);
      });
    }
  }, [searchAreas, map]);
  
  return (
    <>
      {searchAreas.map((area) => {
        console.log("Rendering area:", area.id, area.lat, area.lng, area.radius);
        return (
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
                  console.log("Area selezionata:", area.id);
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
                      <Edit className="mr-2 h-3 w-3" /> Modifica
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="text-xs flex items-center gap-1 flex-1"
                      onClick={() => deleteSearchArea(area.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Elimina
                    </Button>
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

export default SearchAreaMapLayer;
