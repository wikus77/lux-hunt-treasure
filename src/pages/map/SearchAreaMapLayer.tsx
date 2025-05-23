
import React, { useState } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type SearchAreaMapLayerProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
};

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea
}) => {
  console.log("Rendering SearchAreaMapLayer with areas:", searchAreas);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  
  // Define the pulse animation class
  const pulseStyle = `
    @keyframes pulse {
      0% { opacity: 0.4; }
      50% { opacity: 0.6; }
      100% { opacity: 0.4; }
    }
    .search-area-pulse {
      animation: pulse 3s infinite ease-in-out;
    }
  `;
  
  return (
    <>
      {/* Add the pulse animation style */}
      <style>{pulseStyle}</style>
      
      {searchAreas.map((area) => {
        console.log("Rendering area:", area.id, area.lat, area.lng, area.radius);
        // Determine if this area is being hovered
        const isHovered = hoveredArea === area.id;
        
        return (
          <React.Fragment key={area.id}>
            <Circle
              center={[area.lat, area.lng]}
              radius={area.radius}
              className="search-area-pulse"
              pathOptions={{
                color: area.isAI ? '#9b87f5' : '#00f0ff', // Use specified color or default to neon blue
                fillColor: area.isAI ? '#9b87f5' : '#00f0ff',
                fillOpacity: isHovered ? 0.15 : 0.1,
                weight: isHovered ? 3 : 2,
                opacity: isHovered ? 1 : 0.8
              }}
              eventHandlers={{
                click: () => {
                  setActiveSearchArea(area.id);
                  console.log("Area selezionata:", area.id);
                },
                mouseover: () => setHoveredArea(area.id),
                mouseout: () => setHoveredArea(null)
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-medium mb-2">{area.label || "Area di ricerca"}</div>
                  <div className="text-sm mb-3">Raggio: {(area.radius/1000).toFixed(1)} km</div>
                  <div className="flex gap-2">
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
        );
      })}
    </>
  );
};

export default SearchAreaMapLayer;
