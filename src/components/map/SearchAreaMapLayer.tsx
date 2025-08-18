// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useState } from 'react';
import { Circle } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
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
  const [location] = useLocation();

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
            {/* Popup removed on /map to avoid interference with M1SSION modal */}
          </Circle>
        );
      })}
    </>
  );
};

export default SearchAreaMapLayer;
