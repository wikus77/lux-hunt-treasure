// Areas Layer for MapLibre 3D - User map areas and search areas overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Area {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label?: string;
  color?: string;
  week?: number;
  created_at?: string;
}

interface AreasLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  userAreas?: Area[];
  searchAreas?: Area[];
  onDeleteSearchArea?: (id: string) => Promise<boolean>;
}

const AreasLayer3D: React.FC<AreasLayer3DProps> = ({ 
  map, 
  enabled, 
  userAreas = [], 
  searchAreas = [],
  onDeleteSearchArea
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ type: 'user' | 'search'; area: Area } | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!map || !enabled) return;

    const updateSVG = () => {
      const container = map.getContainer();
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      let svg = '';

      // Render user areas (Buzz Map areas) with hover effect
      userAreas.forEach(area => {
        const center = map.project([area.lng, area.lat]);
        const zoom = map.getZoom();
        const metersPerPixel = 156543.03392 * Math.cos(area.lat * Math.PI / 180) / Math.pow(2, zoom);
        const radiusPixels = area.radius / metersPerPixel;
        const isHovered = hoveredArea === `user-${area.id}`;
        
        svg += `
          <circle
            cx="${center.x}"
            cy="${center.y}"
            r="${radiusPixels}"
            fill="rgba(0,209,255,${isHovered ? 0.25 : 0.15})"
            stroke="#00D1FF"
            stroke-width="${isHovered ? 4 : 3}"
            opacity="0.8"
            class="buzz-area-glow"
            data-area-id="user-${area.id}"
            style="cursor: pointer; pointer-events: auto;"
          />
        `;
      });

      // Render search areas with hover effect
      searchAreas.forEach(area => {
        const center = map.project([area.lng, area.lat]);
        const zoom = map.getZoom();
        const metersPerPixel = 156543.03392 * Math.cos(area.lat * Math.PI / 180) / Math.pow(2, zoom);
        const radiusPixels = area.radius / metersPerPixel;
        const isHovered = hoveredArea === `search-${area.id}`;
        
        svg += `
          <circle
            cx="${center.x}"
            cy="${center.y}"
            r="${radiusPixels}"
            fill="rgba(0,240,255,${isHovered ? 0.2 : 0.1})"
            stroke="#00f0ff"
            stroke-width="${isHovered ? 3 : 2}"
            opacity="0.6"
            class="search-area-pulse"
            data-area-id="search-${area.id}"
            style="cursor: pointer; pointer-events: auto;"
          />
        `;
      });

      setSvgContent(svg);
    };

    updateSVG();
    map.on('move', updateSVG);
    map.on('zoom', updateSVG);
    map.on('resize', updateSVG);

    return () => {
      map.off('move', updateSVG);
      map.off('zoom', updateSVG);
      map.off('resize', updateSVG);
    };
  }, [map, enabled, userAreas, searchAreas, hoveredArea]);

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGCircleElement;
    const areaId = target.getAttribute('data-area-id');
    
    if (areaId) {
      const [type, id] = areaId.split('-');
      const area = type === 'user'
        ? userAreas.find(a => a.id === id)
        : searchAreas.find(a => a.id === id);

      if (area) {
        setSelectedArea({ type: type as 'user' | 'search', area });
        setPopupPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGCircleElement;
    const areaId = target.getAttribute('data-area-id');
    setHoveredArea(areaId);
  };

  if (!enabled) return null;

  return (
    <>
      <div className="absolute inset-0" style={{ zIndex: 640, pointerEvents: 'none' }}>
        <svg
          className="absolute inset-0"
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          onClick={handleSVGClick}
          onMouseMove={handleSVGMouseMove}
          onMouseLeave={() => setHoveredArea(null)}
        />
      </div>

      {/* Popup for area details */}
      {selectedArea && popupPosition && (
        <div
          className="fixed z-[9999] bg-black/90 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-xl pointer-events-auto"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%) translateY(-10px)',
            maxWidth: '300px'
          }}
        >
          <div className="space-y-2">
            {selectedArea.type === 'user' ? (
              <>
                <div className="font-bold text-cyan-400">🎯 AREA BUZZ MAPPA</div>
                <div className="text-sm">Raggio: {(selectedArea.area.radius / 1000).toFixed(1)} km</div>
                {selectedArea.area.created_at && (
                  <div className="text-xs text-gray-400">
                    Generata: {new Date(selectedArea.area.created_at).toLocaleDateString()}
                  </div>
                )}
                {selectedArea.area.week && (
                  <div className="text-xs text-cyan-300">Settimana: {selectedArea.area.week}</div>
                )}
              </>
            ) : (
              <>
                <div className="font-bold text-cyan-400">🔍 {selectedArea.area.label || 'Area di Ricerca'}</div>
                <div className="text-sm">Raggio: {(selectedArea.area.radius / 1000).toFixed(1)} km</div>
                {onDeleteSearchArea && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await onDeleteSearchArea(selectedArea.area.id);
                      setSelectedArea(null);
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Trash2 className="h-3 w-3" />
                    Elimina
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArea(null)}
              className="w-full"
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default AreasLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
