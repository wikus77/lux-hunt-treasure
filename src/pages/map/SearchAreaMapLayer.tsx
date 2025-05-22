
import React, { useEffect, useRef } from 'react';
import { Circle, Popup, useMap } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import L from 'leaflet';
import { useMapContext } from './context/MapContext';

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
  const { mapRef } = useMapContext();
  const areaLayerGroup = useRef<L.LayerGroup | null>(null);
  
  // Ensure map reference is always available
  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  // Initialize persistent layer group
  useEffect(() => {
    const currentMap = mapRef.current || map;
    
    if (currentMap && !areaLayerGroup.current) {
      console.log("📍 Initializing persistent layer group");
      areaLayerGroup.current = L.layerGroup().addTo(currentMap);
      console.log("✅ Layer group initialized and added to map");
    }
  }, [map, mapRef]);
  
  // IMPROVED: Enhanced rendering using persistent layer group
  useEffect(() => {
    console.log("🎯 DISEGNO CERCHIO SU MAPPA:", searchAreas.length);
    const currentMap = mapRef.current || map;
    
    if (!currentMap) {
      console.warn("MAP REF NON DISPONIBILE PER IL DISEGNO");
      return;
    }
    
    // Use the persistent layer group to manage circles
    if (areaLayerGroup.current) {
      // Clear only the layer group contents, not other map layers
      areaLayerGroup.current.clearLayers();
      console.log("🧹 Layer group cleared for fresh drawing");
      
      // Add circles to the persistent layer group
      searchAreas.forEach(area => {
        console.log("Drawing circle at:", area.lat, area.lng, "with radius:", area.radius);
        try {
          const circle = L.circle([area.lat, area.lng], {
            radius: area.radius,
            color: area.isAI ? '#9b87f5' : '#00D1FF',
            fillColor: area.isAI ? '#7E69AB' : '#00D1FF',
            fillOpacity: 0.2,
            weight: 2
          });
          
          circle.on('click', () => {
            setActiveSearchArea(area.id);
          });
          
          // Add to the persistent layer group instead of directly to map
          circle.addTo(areaLayerGroup.current!);
          console.log("✅ CERCHIO INSERITO IN LAYER GROUP:", area.lat, area.lng);
        } catch (error) {
          console.error("Error adding circle to layer group:", error);
        }
      });
      
      console.log("✅ CERCHI AGGIUNTI A LAYER GROUP - Totale:", searchAreas.length);
    } else {
      console.error("LAYER GROUP NON DISPONIBILE PER IL DISEGNO");
    }
  }, [searchAreas, map, mapRef, setActiveSearchArea]);
  
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
