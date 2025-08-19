// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useState } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SearchAreaMapLayerProps {
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea
}) => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const validAreas = (searchAreas || []).filter((a) =>
    Number.isFinite(a?.lat) && Number.isFinite(a?.lng) && Number.isFinite(a?.radius)
  );
  if (import.meta.env.DEV) {
    const filtered = (searchAreas || []).length - validAreas.length;
    if (filtered > 0) {
      console.groupCollapsed('[MAP] invalid lat/lng filtered in SearchAreaMapLayer');
      console.log('discarded:', filtered);
      console.groupEnd();
    }
  }

  const handleDelete = async (areaId: string, areaLabel: string) => {
    try {
      const success = await deleteSearchArea(areaId);
      if (success) {
        console.log("✅ Area successfully deleted");
      }
    } catch (error) {
      console.error("❌ Error deleting area:", error);
    }
  };

  return (
    <>
      {validAreas.map((area) => {
        const isHovered = hoveredArea === area.id;
        
        return (
          <Circle
            key={`search-area-${area.id}`}
            center={[area.lat as number, area.lng as number]}
            radius={area.radius as number}
            className="search-area-pulse"
            pathOptions={{
              color: "#00f0ff",
              fillColor: "#00f0ff",
              fillOpacity: isHovered ? 0.15 : 0.1,
              weight: isHovered ? 3 : 2,
              opacity: isHovered ? 1 : 0.8
            }}
            eventHandlers={{
              click: () => {
                setActiveSearchArea(area.id);
              },
              mouseover: () => {
                setHoveredArea(area.id);
              },
              mouseout: () => {
                setHoveredArea(null);
              }
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="font-medium mb-2">{area.label || "Area di ricerca"}</div>
                <div className="text-sm mb-3">Raggio: {((area.radius as number)/1000).toFixed(1)} km</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="text-xs flex items-center gap-1 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(area.id, area.label || "Area di ricerca");
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Elimina
                  </Button>
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};

export default SearchAreaMapLayer;
