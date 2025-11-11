/**
 * Living Layers Hook - Manages portals, events, agents, zones
 */
import { useState, useEffect } from 'react';
import { PORTALS_SEED } from '@/data/portals.seed';
import { MOCK_EVENTS, MOCK_AGENTS, MOCK_ZONES } from '@/data/mockLayers';

export interface Portal {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Event {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Agent {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export const useLivingLayers = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load seed data (read-only for now)
    setPortals(PORTALS_SEED);
    setEvents(MOCK_EVENTS);
    setAgents(MOCK_AGENTS);
    setZones(MOCK_ZONES);
    setLoading(false);

    console.log('[Living Layers] Loaded seed data:', {
      portals: PORTALS_SEED.length,
      events: MOCK_EVENTS.length,
      agents: MOCK_AGENTS.length,
      zones: MOCK_ZONES.length
    });
  }, []);

  return {
    portals,
    events,
    agents,
    zones,
    loading
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
