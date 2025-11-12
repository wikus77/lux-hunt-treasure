// Areas Layer for MapLibre 3D - User map areas and search areas overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';

interface Area {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label?: string;
  color?: string;
}

interface AreasLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  userAreas?: Area[];
  searchAreas?: Area[];
}

const AreasLayer3D: React.FC<AreasLayer3DProps> = ({ 
  map, 
  enabled, 
  userAreas = [], 
  searchAreas = [] 
}) => {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    if (!map || !enabled) return;

    const updateSVG = () => {
      const container = map.getContainer();
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      let svg = '';

      // Render user areas (Buzz Map areas)
      userAreas.forEach(area => {
        const center = map.project([area.lng, area.lat]);
        const zoom = map.getZoom();
        const metersPerPixel = 156543.03392 * Math.cos(area.lat * Math.PI / 180) / Math.pow(2, zoom);
        const radiusPixels = area.radius / metersPerPixel;
        
        svg += `
          <circle
            cx="${center.x}"
            cy="${center.y}"
            r="${radiusPixels}"
            fill="rgba(0,209,255,0.15)"
            stroke="#00D1FF"
            stroke-width="3"
            opacity="0.8"
          />
        `;
      });

      // Render search areas
      searchAreas.forEach(area => {
        const center = map.project([area.lng, area.lat]);
        const zoom = map.getZoom();
        const metersPerPixel = 156543.03392 * Math.cos(area.lat * Math.PI / 180) / Math.pow(2, zoom);
        const radiusPixels = area.radius / metersPerPixel;
        
        svg += `
          <circle
            cx="${center.x}"
            cy="${center.y}"
            r="${radiusPixels}"
            fill="rgba(0,240,255,0.1)"
            stroke="#00f0ff"
            stroke-width="2"
            opacity="0.8"
            class="search-area-pulse"
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
  }, [map, enabled, userAreas, searchAreas]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 640 }}>
      <svg
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default AreasLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
