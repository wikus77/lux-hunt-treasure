import React, { Suspense, lazy, useMemo, useState, useCallback } from 'react';
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
const ControlsTopRight = lazy(() => import('./components/ControlsTopRight'));

interface LivingMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapContainerRef?: React.RefObject<HTMLDivElement>;
}

const LivingMap: React.FC<LivingMapProps> = ({ center, zoom, mapContainerRef }) => {
  // Feature flag check
  const enabled = import.meta.env.VITE_ENABLE_LIVING_MAP !== 'false';

  const { portals, events, agents, zones, loading } = useLiveLayers(enabled);
  
  // Layer filters state
  const [filters, setFilters] = useState<Record<string, boolean>>({});

  // Derive dock items from live data
  const dockItems = useMemo(() => {
    const items: any[] = [];
    
    // Add portals
    portals.forEach(p => {
      items.push({
        id: p.id,
        type: 'Portal' as const,
        label: p.name,
        lat: p.lat,
        lng: p.lng,
        status: p.status,
        color: p.status === 'active' ? '#00E5FF' : '#8A2BE2'
      });
    });
    
    // Add events
    events.forEach(e => {
      items.push({
        id: e.id,
        type: 'Event' as const,
        label: e.title,
        lat: e.lat,
        lng: e.lng,
        color: e.type === 'rare' ? '#00E5FF' : e.type === 'success' ? '#24E39E' : '#FFB347'
      });
    });
    
    // Add zones as Alert Zones
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
  }, [portals, events, zones]);

  // Focus handler - only modifies view, not markers
  const handleFocus = useCallback((item: any) => {
    // Emit custom event for map to handle
    window.dispatchEvent(new CustomEvent('M1_FOCUS', {
      detail: { lat: item.lat, lng: item.lng, zoom: zoom || 15 }
    }));
    
    console.log('[Living Map] Focus on:', item.label, 'at', item.lat, item.lng);
  }, [zoom]);

  // Route handler - open external navigation
  const handleRoute = useCallback((item: any) => {
    const { lat, lng } = item;
    const url = /iPhone|iPad|iPod/.test(navigator.userAgent)
      ? `http://maps.apple.com/?daddr=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    console.log('[Living Map] Route to:', item.label);
  }, []);

  // Filter toggle handler
  const handleFilterToggle = useCallback((itemId: string) => {
    setFilters(prev => ({
      ...prev,
      [itemId]: !(prev[itemId] ?? true)
    }));
  }, []);

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
    <>
      {/* HUD Header - fuori dall'overlay non interattivo */}
      <Suspense fallback={null}>
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1002, pointerEvents: 'none' }}>
          <MapHUDHeader center={center} zoom={zoom} />
        </div>
      </Suspense>

      {/* Radar sweep overlay - non interattivo */}
      <Suspense fallback={null}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 998, pointerEvents: 'none' }}>
          <RadarOverlay center={center || { lat: 43.7874, lng: 7.6326 }} />
        </div>
      </Suspense>

      {/* Data layers - non interattivi, filtrabili */}
      <Suspense fallback={null}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 999, pointerEvents: 'none' }}>
          <PortalsLayer portals={portals} visible={filters.portals !== false} />
          <EventsLayer events={events} visible={filters.events !== false} />
          <AgentsLayer agents={agents} visible={filters.agents !== false} />
          <ControlZonesLayer zones={zones} visible={filters.zones !== false} />
        </div>
      </Suspense>

      {/* Dock Left - INTERATTIVO */}
      <Suspense fallback={null}>
        <DockLeft 
          items={dockItems}
          onFocus={handleFocus}
          onRoute={handleRoute}
          filters={filters}
          onFilterToggle={handleFilterToggle}
        />
      </Suspense>

      {/* Top-right controls - INTERATTIVI */}
      <Suspense fallback={null}>
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 12, zIndex: 1003 }}>
          <LegendHUD
            portalsCount={portals.length}
            eventsCount={events.length}
            agentsCount={agents.length}
            zonesCount={zones.length}
          />
          <ControlsTopRight mapContainerRef={mapContainerRef} />
        </div>
      </Suspense>
    </>
  );
};

export default LivingMap;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
