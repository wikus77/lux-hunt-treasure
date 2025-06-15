
import React, { useState, useEffect } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type SearchAreaMapLayerProps = {
  searchAreas?: SearchArea[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
};

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas = [],
  setActiveSearchArea,
  deleteSearchArea
}) => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  
  // CRITICAL DEBUG: Enhanced logging for search areas visibility
  useEffect(() => {
    console.log("🗺️ SEARCH LAYER: SearchAreaMapLayer - Areas received for rendering:", {
      count: searchAreas.length,
      areas: searchAreas.map(area => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius: area.radius,
        label: area.label
      })),
      timestamp: new Date().toISOString()
    });
    
    if (searchAreas.length === 0) {
      console.log("⚠️ SEARCH LAYER: No search areas to display");
    } else {
      console.log("✅ SEARCH LAYER: Ready to render", searchAreas.length, "search areas");
    }
  }, [searchAreas]);
  
  // Define the pulse animation class for search areas
  const pulseStyle = `
    @keyframes searchAreaPulse {
      0% { opacity: 0.3; }
      50% { opacity: 0.5; }
      100% { opacity: 0.3; }
    }
    .search-area-pulse {
      animation: searchAreaPulse 4s infinite ease-in-out;
    }
  `;

  // Handle delete - now without browser confirm
  const handleDelete = async (areaId: string, areaLabel: string) => {
    console.log("🗑️ DELETE FROM POPUP: Delete requested for area:", areaId, areaLabel);
    
    if (!deleteSearchArea) return;
    
    try {
      const success = await deleteSearchArea(areaId);
      if (success) {
        console.log("✅ DELETE SUCCESS: Area successfully deleted from popup");
      } else {
        console.log("❌ DELETE FAILED: Area deletion failed from popup");
      }
    } catch (error) {
      console.error("❌ DELETE ERROR: Exception during deletion from popup:", error);
    }
  };
  
  return (
    <>
      {/* Add the pulse animation style for search areas */}
      <style>{pulseStyle}</style>
      
      {searchAreas.map((area) => {
        console.log("🔵 RENDERING: Rendering search area:", {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius: area.radius,
          label: area.label,
          renderTime: new Date().toISOString()
        });
        
        // Determine if this area is being hovered
        const isHovered = hoveredArea === area.id;
        
        return (
          <React.Fragment key={`search-area-${area.id}-${Date.now()}`}>
            <Circle
              center={[area.lat, area.lng]}
              radius={area.radius}
              className="search-area-pulse"
              pathOptions={{
                color: "#00f0ff", // Fixed cyan color for search areas
                fillColor: "#00f0ff",
                fillOpacity: isHovered ? 0.15 : 0.1,
                weight: isHovered ? 3 : 2,
                opacity: isHovered ? 1 : 0.8
              }}
              eventHandlers={{
                click: () => {
                  console.log("🔵 CLICK: Search area clicked:", area.id);
                  if (setActiveSearchArea) {
                    setActiveSearchArea(area.id);
                  }
                },
                mouseover: () => {
                  console.log("🔵 HOVER: Mouse over search area:", area.id);
                  setHoveredArea(area.id);
                },
                mouseout: () => {
                  console.log("🔵 HOVER OUT: Mouse out search area:", area.id);
                  setHoveredArea(null);
                }
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
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("🗑️ POPUP DELETE: Delete button clicked for area:", area.id);
                        handleDelete(area.id, area.label || "Area di ricerca");
                      }}
                    >
                      <Trash2 className="w-3 h-3" /> 🗑 Elimina
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
