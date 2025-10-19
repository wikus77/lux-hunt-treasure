import React, { Suspense, lazy } from 'react';
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

interface LivingMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

const LivingMap: React.FC<LivingMapProps> = ({ center, zoom }) => {
  // Feature flag check
  const enabled = import.meta.env.VITE_ENABLE_LIVING_MAP !== 'false';

  const { portals, events, agents, zones, loading } = useLiveLayers(enabled);

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
        <PortalsLayer portals={portals} />
        <EventsLayer events={events} />
        <AgentsLayer agents={agents} />
        <ControlZonesLayer zones={zones} />

        {/* Legend */}
        <LegendHUD
          portalsCount={portals.length}
          eventsCount={events.length}
          agentsCount={agents.length}
          zonesCount={zones.length}
        />
      </Suspense>
    </div>
  );
};

export default LivingMap;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
