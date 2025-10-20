import React, { Suspense, lazy, useMemo, useRef, useCallback } from 'react';
import { useLiveLayers } from './hooks/useLiveLayers';
import './styles/livingMap.css';

// Lazy load components for performance
const RadarOverlay = lazy(() => import('./components/RadarOverlay'));
const PortalsLayer = lazy(() => import('./components/PortalsLayer'));
const EventsLayer = lazy(() => import('./components/EventsLayer'));
const AgentsLayer = lazy(() => import('./components/AgentsLayer'));
const ControlZonesLayer = lazy(() => import('./components/ControlZonesLayer'));
const LegendHUD = lazy(() => import('./components/LegendHUD'));
const MapHUDHeader = lazy(() => import('./components/MapHUDHeader'));
const DockLeft = lazy(() => import('./components/DockLeft'));
const BadgeStackOverlay = lazy(() => import('./components/BadgeStackOverlay'));


interface LivingMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapContainerRef?: React.RefObject<HTMLDivElement>;
  hidePortalBadges?: boolean;
}

const LivingMap: React.FC<LivingMapProps> = ({ center, zoom, mapContainerRef, hidePortalBadges = false }) => {
  // Feature flag check
  const enabled = import.meta.env.VITE_ENABLE_LIVING_MAP !== 'false';

  const { portals, events, agents, zones, loading } = useLiveLayers(enabled);

  // Derive dock items from live data (only SECTOR = zones)
  const dockItems = useMemo(() => {
    const items: any[] = [];

    // Add zones as SECTOR badges only
    zones.forEach(z => {
      const center = z.polygon.reduce(
        (acc, [lat, lng]) => ({ lat: acc.lat + lat / z.polygon.length, lng: acc.lng + lng / z.polygon.length }),
        { lat: 0, lng: 0 }
      );
      items.push({
        id: z.id,
        type: 'Alert Zone' as const,
        label: z.label,
        lat: center.lat,
        lng: center.lng,
        color: z.color
      });
    });

    return items;
  }, [zones]);

  // Focus handler - only modifies view, not markers
  const handleFocus = useCallback((item: any) => {
    // Emit custom event for map to handle
    window.dispatchEvent(new CustomEvent('M1_FOCUS', {
      detail: { lat: item.lat, lng: item.lng, zoom: zoom || 15 }
    }));
    
    console.log('Focus on:', item.label, 'at', item.lat, item.lng);
  }, [zoom]);

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 999 }}
      >
        <div
          className="living-hud-glass px-4 py-2 text-sm"
          style={{ color: 'var(--living-map-text-primary)' }}
        >
          Loading Living Map™...
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 999 }}
    >
      <Suspense fallback={null}>
        {/* HUD Header */}
        <MapHUDHeader center={center} zoom={zoom} />

        {/* Radar sweep overlay */}
        <RadarOverlay center={center || { lat: 43.7874, lng: 7.6326 }} />

        {/* Data layers */}
        <PortalsLayer portals={portals} showLabels={false} />
        <EventsLayer events={events} showLabels={false} />
        <AgentsLayer agents={agents} />
        <ControlZonesLayer zones={zones} showLabels={false} />
        <BadgeStackOverlay portals={portals} events={events} zones={zones} />

        {/* Dock Left - Badge pills (hidden when Portal Container active) */}
        {!hidePortalBadges && <DockLeft items={dockItems} onFocus={handleFocus} />}

        {/* Bottom-left HUD controls */}
        <div
          className="absolute bottom-4 left-4 flex items-end gap-3"
          style={{ zIndex: 1000 }}
        >
          {/* Legend */}
          <LegendHUD
            portalsCount={portals.length}
            eventsCount={events.length}
            agentsCount={agents.length}
            zonesCount={zones.length}
          />

        </div>
      </Suspense>
    </div>
  );
};

export default LivingMap;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
