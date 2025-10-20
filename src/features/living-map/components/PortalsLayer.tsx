import React from 'react';
import type { PortalDTO } from '../adapters/readOnlyData';

interface PortalsLayerProps {
  portals: PortalDTO[];
  mapRef?: any;
  showLabels?: boolean;
  onPortalClick?: (portal: PortalDTO) => void;
}

const PortalsLayer: React.FC<PortalsLayerProps> = ({ portals, showLabels = true, onPortalClick }) => {
  // Calculate pixel position from lat/lng using Web Mercator projection
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number, mapCenter: { lat: number; lng: number }, zoom: number) => {
    const scale = 256 * Math.pow(2, zoom);
    const centerX = (mapCenter.lng + 180) / 360 * scale;
    const centerY = (1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    const pointX = (lng + 180) / 360 * scale;
    const pointY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    return {
      x: (pointX - centerX) + mapWidth / 2,
      y: (pointY - centerY) + mapHeight / 2
    };
  };

  // Use current map viewport (fallback to Monaco center)
  const mapCenter = { lat: 43.7874, lng: 7.6326 };
  const mapZoom = 14;
  const mapWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const mapHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 900 }}>
      {portals.map((portal) => {
        const pos = latLngToPixel(portal.lat, portal.lng, mapWidth, mapHeight, mapCenter, mapZoom);
        
        return (
          <div
            key={portal.id}
            className="absolute"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Portal marker */}
            <div
              className={`living-portal-marker ${portal.status === 'active' ? 'active' : ''} cursor-pointer hover:scale-110 transition-transform`}
              style={{
                width: 32,
                height: 32,
                position: 'relative',
                pointerEvents: 'auto'
              }}
              onClick={() => onPortalClick?.(portal)}
              title={`${portal.name} - Click per dettagli`}
            >
              {/* Inner ring */}
              <div
                className="absolute inset-1 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}40, transparent)`,
                  border: `2px solid ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}`,
                  boxShadow: `0 0 20px ${portal.status === 'active' ? '#00E5FF' : '#8A2BE2'}80`
                }}
              />
            </div>

            {showLabels && (
              <div
                className="living-hud-glass mt-2 px-2 py-1 text-xs whitespace-nowrap pointer-events-auto cursor-pointer"
                style={{
                  color: 'var(--living-map-text-primary)',
                  fontSize: '10px',
                  fontWeight: 600
                }}
                title={`${portal.name} - ${portal.intensity}% intensity`}
              >
                {portal.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PortalsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
