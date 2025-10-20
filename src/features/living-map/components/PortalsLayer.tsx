import React, { useMemo } from 'react';
import { LayerGroup, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { PortalDTO } from '../adapters/readOnlyData';

interface PortalsLayerProps {
  portals: PortalDTO[];
  mapRef?: any;
  showLabels?: boolean;
  onPortalClick?: (portal: PortalDTO) => void;
}

// Factory per DivIcon dei Portals (rispetta il design esistente e il meteo/glow)
function makePortalIcon(portal: PortalDTO) {
  const html = `
    <div class="portal-badge-wrapper" data-layer="portals" data-status="${portal.status}">
      <div class="living-portal-marker ${portal.status === 'active' ? 'active' : ''}" style="position: relative; pointer-events: auto;">
        <div class="living-portal-inner"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'portal-icon', // className del DivIcon (stilabile via CSS globale)
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -18],
  });
}

const PortalsLayer: React.FC<PortalsLayerProps> = ({ portals, showLabels = true, onPortalClick }) => {
  // Prepara icone memoizzate per evitare ricreazioni a ogni render
  const iconById = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    portals.forEach((p) => {
      map.set(p.id, makePortalIcon(p));
    });
    return map;
  }, [portals]);

  // Handler click: emette evento DOM + callback opzionale
  const handleClick = (portal: PortalDTO) => {
    try {
      window.dispatchEvent(new CustomEvent('M1_PORTAL_OPEN', { detail: { id: portal.id, portal } }));
      // eslint-disable-next-line no-console
      console.info('[M1] M1_PORTAL_OPEN', { id: portal.id, name: portal.name });
    } catch {}
    onPortalClick?.(portal);
  };

  // NOTA: Nessun overlay assoluto. Marker Leaflet gestisce pan/zoom/hit test.
  return (
    <LayerGroup>
      {portals.map((portal) => (
        <Marker
          key={portal.id}
          position={[portal.lat, portal.lng]}
          icon={iconById.get(portal.id)}
          eventHandlers={{
            click: () => handleClick(portal),
          }}
        >
          {showLabels && (
            <Tooltip direction="top" offset={[0, -14]} opacity={1} permanent={false} className="living-hud-glass text-[10px] font-semibold">
              <span title={`${portal.name} – ${portal.status}`}>{portal.name}</span>
            </Tooltip>
          )}
        </Marker>
      ))}
    </LayerGroup>
  );
};

export default PortalsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
