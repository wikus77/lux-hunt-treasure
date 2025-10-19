import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getLivePortals,
  getLiveEvents,
  getLiveAgents,
  getControlZones,
  onPortalsChanged,
  onEventsChanged,
  onAgentsChanged,
  type PortalDTO,
  type EventDTO,
  type AgentDTO,
  type ZoneDTO
} from '../adapters/readOnlyData';

interface LiveLayersState {
  portals: PortalDTO[];
  events: EventDTO[];
  agents: AgentDTO[];
  zones: ZoneDTO[];
  loading: boolean;
}

export function useLiveLayers(enabled = true) {
  const [state, setState] = useState<LiveLayersState>({
    portals: [],
    events: [],
    agents: [],
    zones: [],
    loading: true
  });

  const throttleRef = useRef<{ [key: string]: number }>({});

  const throttledUpdate = useCallback((key: string, updateFn: () => void) => {
    const now = Date.now();
    const lastUpdate = throttleRef.current[key] || 0;
    
    if (now - lastUpdate > 250) { // 250ms throttle
      throttleRef.current[key] = now;
      updateFn();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    // Initial data load
    Promise.all([
      getLivePortals(),
      getLiveEvents(),
      getLiveAgents(),
      getControlZones()
    ]).then(([portals, events, agents, zones]) => {
      if (mounted) {
        setState({
          portals,
          events,
          agents,
          zones,
          loading: false
        });
      }
    });

    // Subscribe to realtime updates
    const unsubPortals = onPortalsChanged((portals) => {
      if (mounted) {
        throttledUpdate('portals', () => {
          setState(prev => ({ ...prev, portals }));
        });
      }
    });

    const unsubEvents = onEventsChanged((events) => {
      if (mounted) {
        throttledUpdate('events', () => {
          setState(prev => ({ ...prev, events }));
        });
      }
    });

    const unsubAgents = onAgentsChanged((agents) => {
      if (mounted) {
        throttledUpdate('agents', () => {
          setState(prev => ({ ...prev, agents }));
        });
      }
    });

    return () => {
      mounted = false;
      unsubPortals();
      unsubEvents();
      unsubAgents();
    };
  }, [enabled, throttledUpdate]);

  return state;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
