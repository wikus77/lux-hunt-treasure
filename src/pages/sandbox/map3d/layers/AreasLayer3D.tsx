// Areas Layer for MapLibre 3D - User map areas and search areas overlay
import React, { useEffect, useState, useRef } from 'react';
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
  onDeleteSearchArea?: (id: string) => void;
}

const AreasLayer3D: React.FC<AreasLayer3DProps> = ({ 
  map, 
  enabled, 
  userAreas = [], 
  searchAreas = [],
  onDeleteSearchArea
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [tooltip, setTooltip] = useState<null | { id: string; type: 'user'|'search'; label?: string; radius: number; screenX: number; screenY: number; lat: number; lng: number }>(null);
  const svgRef = useRef<SVGSVGElement | null>(null as any);
  const rafRef = useRef<number | null>(null);

  // Reset tooltip when userAreas changes or buzzAreaCreated event fires
  useEffect(() => {
    setTooltip(null);
  }, [userAreas]);

  useEffect(() => {
    const handleBuzzCreated = () => {
      setTooltip(null);
    };
    window.addEventListener('buzzAreaCreated', handleBuzzCreated);
    return () => window.removeEventListener('buzzAreaCreated', handleBuzzCreated);
  }, []);

  // Update tooltip position using map.project when tooltip is open
  useEffect(() => {
    if (!map || !tooltip) return;

    const updateTooltipPosition = () => {
      const point = map.project([tooltip.lng, tooltip.lat]);
      setTooltip(prev => prev ? { ...prev, screenX: point.x, screenY: point.y } : null);
    };

    updateTooltipPosition();
    map.on('move', updateTooltipPosition);
    map.on('zoom', updateTooltipPosition);
    map.on('rotate', updateTooltipPosition);
    map.on('pitch', updateTooltipPosition);
    map.on('render', updateTooltipPosition);

    return () => {
      map.off('move', updateTooltipPosition);
      map.off('zoom', updateTooltipPosition);
      map.off('rotate', updateTooltipPosition);
      map.off('pitch', updateTooltipPosition);
      map.off('render', updateTooltipPosition);
    };
  }, [map, tooltip?.lat, tooltip?.lng]);

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
            class="interactive buzz-area-glow"
            data-id="${area.id}"
            data-type="user"
            data-label="${(area.label || 'Buzz Area')}"
            data-radius="${area.radius}"
            data-lat="${area.lat}"
            data-lng="${area.lng}"
            style="pointer-events:auto;cursor:pointer"
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
            class="interactive search-area-pulse"
            data-id="${area.id}"
            data-type="search"
            data-label="${(area.label || 'Area di ricerca')}"
            data-radius="${area.radius}"
            data-lat="${area.lat}"
            data-lng="${area.lng}"
            style="pointer-events:auto;cursor:pointer"
          />
        `;
      });

      setSvgContent(svg);
    };

    const updateOnRender = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateSVG);
    };

    updateSVG();
    map.on('move', updateSVG);
    map.on('zoom', updateSVG);
    map.on('resize', updateSVG);
    map.on('render', updateOnRender);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off('move', updateSVG);
      map.off('zoom', updateSVG);
      map.off('resize', updateSVG);
      map.off('render', updateOnRender);
    };
  }, [map, enabled, userAreas, searchAreas]);

  if (!enabled) return null;

  useEffect(() => {
    const svgEl = svgRef.current as unknown as SVGSVGElement | null;
    if (!svgEl || !enabled) return;

    const handler = (e: Event) => {
      const target = e.target as SVGCircleElement | null;
      if (!target || target.tagName.toLowerCase() !== 'circle') return;
      const id = target.getAttribute('data-id') || '';
      const type = (target.getAttribute('data-type') as 'user'|'search') || 'user';
      const label = target.getAttribute('data-label') || undefined;
      const radius = parseFloat(target.getAttribute('data-radius') || '0');
      const lat = parseFloat(target.getAttribute('data-lat') || '0');
      const lng = parseFloat(target.getAttribute('data-lng') || '0');

      setTooltip({ id, type, label, radius, screenX: (e as any).clientX, screenY: (e as any).clientY, lat, lng });
    };

    svgEl.addEventListener('click', handler as any, { passive: true } as any);
    return () => svgEl.removeEventListener('click', handler as any);
  }, [enabled]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 640 }}>
      <svg
        ref={svgRef as any}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {tooltip && (
        <div
          className="absolute rounded-xl border border-cyan-500/30 bg-black/80 backdrop-blur-md p-2 text-xs text-white pointer-events-auto"
          style={{ left: tooltip.screenX + 8, top: tooltip.screenY + 8 }}
        >
          <div className="font-medium mb-1">
            {tooltip.type === 'user' ? 'Buzz Area (ultima valida)' : 'Search Area'}
          </div>
          {tooltip.label && <div className="opacity-80">{tooltip.label}</div>}
          <div className="opacity-80">Raggio: {(tooltip.radius/1000).toFixed(1)} km</div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-2 py-1 rounded bg-black/60 border border-cyan-500/30 hover:bg-black/80"
              onClick={(e) => {
                e.stopPropagation();
                if (!map) return;
                map.flyTo({ center: [tooltip.lng, tooltip.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
                setTooltip(null);
              }}
            >
              Focus
            </button>
            {tooltip.type === 'search' && onDeleteSearchArea && (
              <button
                className="px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10"
                onClick={(e) => { e.stopPropagation(); onDeleteSearchArea(tooltip.id); setTooltip(null); }}
              >
                Elimina
              </button>
            )}
            <button
              className="px-2 py-1 rounded border border-white/10 opacity-70 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); setTooltip(null); }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
