import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { PortalDTO } from '../adapters/readOnlyData';

interface PortalsLayerProps {
  portals: PortalDTO[];
  mapRef?: React.MutableRefObject<L.Map | null> | any;
  showLabels?: boolean;
  onPortalClick?: (portal: PortalDTO) => void;
}

// DivIcon factory (usa solo classi: il glow/meteo viene dal design system esistente)
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
    className: 'portal-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -18],
  });
}

// Imperative Leaflet layer so it can live outside React-Leaflet context (no hooks)
const PortalsLayer: React.FC<PortalsLayerProps> = ({ portals, mapRef, showLabels = true, onPortalClick }) => {
  const groupRef = useRef<L.LayerGroup | null>(null);
  const paneName = 'm1-portals';

  useEffect(() => {
    const map: L.Map | null = mapRef?.current ?? null;
    if (!map) return; // Nessun crash: attendiamo che la mappa esista

    // Ensure pane exists once
    let pane = map.getPane(paneName);
    if (!pane) {
      pane = map.createPane(paneName);
      // z-index tra marker e HUD, non toccare meteo/glow
      if (pane) {
        pane.style.zIndex = '450';
        pane.style.pointerEvents = 'auto';
        pane.setAttribute('data-layer', 'portals');
      }
    }

    // Create or reattach group
    if (!groupRef.current) {
      groupRef.current = L.layerGroup();
      groupRef.current.addTo(map);
    } else {
      groupRef.current.clearLayers();
    }

    // Add markers
    portals
      .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
      .forEach((p) => {
        const marker = L.marker([p.lat, p.lng], {
          icon: makePortalIcon(p),
          pane: paneName,
          bubblingMouseEvents: true,
          keyboard: false,
          riseOnHover: true,
        });

        // Tooltip opzionale
        if (showLabels) {
          marker.bindTooltip(p.name, { direction: 'top', offset: L.point(0, -14), opacity: 1, permanent: false, className: 'living-hud-glass text-[10px] font-semibold' });
        }

        marker.on('click', () => {
          try {
            window.dispatchEvent(new CustomEvent('M1_PORTAL_OPEN', { detail: { id: p.id, portal: p } }));
            // eslint-disable-next-line no-console
            console.info('[M1] M1_PORTAL_OPEN', { id: p.id, name: p.name });
          } catch {}
          onPortalClick?.(p);
        });

        groupRef.current?.addLayer(marker);
      });

    // Cleanup
    return () => {
      if (groupRef.current) {
        try {
          groupRef.current.clearLayers();
          groupRef.current.remove();
        } catch {}
        groupRef.current = null;
      }
    };
  }, [portals, mapRef, showLabels, onPortalClick]);

  return null; // Layer puramente imperativo
};

export default PortalsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
