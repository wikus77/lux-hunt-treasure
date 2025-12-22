// @ts-nocheck
// Agents Layer for MapLibre 3D - GeoJSON Symbol Layer for 10.000+ agents performance
// 🔥 OPTIMIZED: GPU-rendered markers instead of DOM elements
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import type { AgentDTO } from '@/features/living-map/adapters/readOnlyData';
import { getLiveAgents, onAgentsChanged } from '@/features/living-map/adapters/readOnlyData';

interface AgentsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  agents?: AgentDTO[]; // Optional override for dev mocks
  mePosition?: { lat: number; lng: number } | null;
  currentUserId?: string | null; // ID utente corrente per unificare marker
  onAgentClick?: (agent: AgentDTO) => void;
}

const AGENTS_SOURCE_ID = 'm1-agents-source';
const AGENTS_GLOW_LAYER_ID = 'm1-agents-glow-layer';
const AGENTS_LAYER_ID = 'm1-agents-layer';
const ME_GLOW_LAYER_ID = 'm1-me-glow-layer';
const ME_LAYER_ID = 'm1-me-layer';
const ME_LABEL_LAYER_ID = 'm1-me-label-layer';

const AgentsLayer3D: React.FC<AgentsLayer3DProps> = ({ 
  map, 
  enabled, 
  agents: agentsProp, 
  mePosition, 
  currentUserId, 
  onAgentClick 
}) => {
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const sourceAddedRef = useRef(false);
  const agentsMapRef = useRef<Map<string, AgentDTO>>(new Map());

  // Augmented agents with current user position
  const augmentedAgents = useMemo(() => {
    const result = [...agents];
    
    if (mePosition) {
      const myAgentIndex = currentUserId 
        ? result.findIndex(a => a.id === currentUserId)
        : -1;
      
      if (myAgentIndex >= 0) {
        result[myAgentIndex] = {
          ...result[myAgentIndex],
          lat: mePosition.lat,
          lng: mePosition.lng,
          status: 'online',
          lastSeen: new Date().toISOString()
        };
      } else {
        const existingMeIndex = result.findIndex(a => a.id === 'me-local');
        if (existingMeIndex >= 0) {
          result[existingMeIndex] = {
            ...result[existingMeIndex],
            lat: mePosition.lat,
            lng: mePosition.lng,
            status: 'online',
            lastSeen: new Date().toISOString()
          };
        } else {
          result.push({
            id: 'me-local',
            lat: mePosition.lat,
            lng: mePosition.lng,
            username: 'Tu',
            status: 'online',
            lastSeen: new Date().toISOString()
          } as AgentDTO);
        }
      }
    }
    
    return result;
  }, [agents, mePosition?.lat, mePosition?.lng, currentUserId]);

  // Load agents
  useEffect(() => {
    if (!enabled) return;

    if (agentsProp) {
      setAgents(agentsProp);
    } else {
      getLiveAgents().then(setAgents);
      const unsubscribe = onAgentsChanged(setAgents);
      return () => unsubscribe();
    }
  }, [enabled, agentsProp]);

  // Update agents map for click lookup
  useEffect(() => {
    agentsMapRef.current.clear();
    augmentedAgents.forEach(agent => {
      agentsMapRef.current.set(agent.id, agent);
    });
  }, [augmentedAgents]);

  // 🔥 GeoJSON Symbol Layer implementation
  useEffect(() => {
    if (!map || !enabled) return;

    // 🔥 FIX: Wait for style to be loaded before adding layers
    const addLayers = () => {
      if (!map.isStyleLoaded()) {
        // Style not ready, wait for load event
        map.once('load', addLayers);
        return;
      }
      
      setupLayers();
    };

    const setupLayers = () => {
    // Separate "me" from other agents
    const meId = currentUserId || 'me-local';
    const otherAgents = augmentedAgents.filter(a => a.id !== meId && a.id !== 'me-local');
    const meAgent = augmentedAgents.find(a => a.id === meId || a.id === 'me-local');

    // Create GeoJSON for other agents
    const otherAgentsGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: otherAgents.map(agent => ({
        type: 'Feature',
        id: agent.id,
        properties: {
          id: agent.id,
          username: agent.username || 'Agent',
          status: agent.status,
          agent_code: agent.agent_code || ''
        },
        geometry: {
          type: 'Point',
          coordinates: [agent.lng, agent.lat]
        }
      }))
    };

    // Create GeoJSON for "me"
    const meGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: meAgent ? [{
        type: 'Feature',
        id: meAgent.id,
        properties: {
          id: meAgent.id,
          username: 'Tu',
          status: 'online'
        },
        geometry: {
          type: 'Point',
          coordinates: [meAgent.lng, meAgent.lat]
        }
      }] : []
    };

    // Add or update source
    const existingSource = map.getSource(AGENTS_SOURCE_ID);
    if (existingSource) {
      (existingSource as any).setData(otherAgentsGeoJSON);
    } else {
      map.addSource(AGENTS_SOURCE_ID, {
        type: 'geojson',
        data: otherAgentsGeoJSON
      });
    }

    // Add or update "me" source
    const meSourceId = 'm1-me-source';
    const existingMeSource = map.getSource(meSourceId);
    if (existingMeSource) {
      (existingMeSource as any).setData(meGeoJSON);
    } else {
      map.addSource(meSourceId, {
        type: 'geojson',
        data: meGeoJSON
      });
    }

    // Add layers if not exists
    if (!map.getLayer(AGENTS_GLOW_LAYER_ID)) {
      // Glow layer for other agents (larger, blurred circle) - REDUCED 30%
      map.addLayer({
        id: AGENTS_GLOW_LAYER_ID,
        type: 'circle',
        source: AGENTS_SOURCE_ID,
        paint: {
          'circle-radius': 8, // Was 12, now 30% smaller
          'circle-color': '#FF3B30',
          'circle-opacity': 0.25,
          'circle-blur': 0.8
        }
      });

      // Main layer for other agents - REDUCED 30%
      map.addLayer({
        id: AGENTS_LAYER_ID,
        type: 'circle',
        source: AGENTS_SOURCE_ID,
        paint: {
          'circle-radius': 4, // Was 6, now 30% smaller
          'circle-color': '#FF3B30',
          'circle-opacity': 1,
          'circle-stroke-width': 0.7,
          'circle-stroke-color': '#FF6B60'
        }
      });

      // Glow layer for "me" (cyan)
      map.addLayer({
        id: ME_GLOW_LAYER_ID,
        type: 'circle',
        source: meSourceId,
        paint: {
          'circle-radius': 16,
          'circle-color': '#00E5FF',
          'circle-opacity': 0.4,
          'circle-blur': 1
        }
      });

      // Main layer for "me"
      map.addLayer({
        id: ME_LAYER_ID,
        type: 'circle',
        source: meSourceId,
        paint: {
          'circle-radius': 8,
          'circle-color': '#00E5FF',
          'circle-opacity': 1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // Label "TU" for me
      map.addLayer({
        id: ME_LABEL_LAYER_ID,
        type: 'symbol',
        source: meSourceId,
        layout: {
          'text-field': 'TU',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#00E5FF',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      sourceAddedRef.current = true;
    }

    // Click handler for agents
    const handleClick = (e: any) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const agentId = feature.properties?.id;
        if (agentId) {
          const agent = agentsMapRef.current.get(agentId);
          if (agent && onAgentClick) {
            onAgentClick(agent);
          }
        }
      }
    };

    // Cursor change on hover
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', AGENTS_LAYER_ID, handleClick);
    map.on('click', ME_LAYER_ID, handleClick);
    map.on('mouseenter', AGENTS_LAYER_ID, handleMouseEnter);
    map.on('mouseleave', AGENTS_LAYER_ID, handleMouseLeave);
    map.on('mouseenter', ME_LAYER_ID, handleMouseEnter);
    map.on('mouseleave', ME_LAYER_ID, handleMouseLeave);
    }; // End of setupLayers

    // Start the process
    addLayers();

    // Cleanup
    return () => {
      try {
        // Remove event listener if style wasn't loaded yet
        if (map && typeof map.off === 'function') {
          map.off('load', addLayers);
          
          // Safe layer checks with try/catch
          try {
            if (map.getLayer && map.getLayer(AGENTS_LAYER_ID)) {
              map.off('click', AGENTS_LAYER_ID);
              map.off('mouseenter', AGENTS_LAYER_ID);
              map.off('mouseleave', AGENTS_LAYER_ID);
            }
            if (map.getLayer && map.getLayer(ME_LAYER_ID)) {
              map.off('click', ME_LAYER_ID);
              map.off('mouseenter', ME_LAYER_ID);
              map.off('mouseleave', ME_LAYER_ID);
            }
          } catch (e) {
            // Map already destroyed, ignore
          }
        }
      } catch (e) {
        // Silent cleanup - map may be destroyed
      }
    };
  }, [map, augmentedAgents, enabled, currentUserId, onAgentClick]);

  // Cleanup layers on unmount or disable
  useEffect(() => {
    if (!map) return;

    return () => {
      try {
        if (!map || typeof map.getLayer !== 'function') return;
        
        // Remove layers safely
        [ME_LABEL_LAYER_ID, ME_LAYER_ID, ME_GLOW_LAYER_ID, AGENTS_LAYER_ID, AGENTS_GLOW_LAYER_ID].forEach(layerId => {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
          } catch (e) {
            // Layer already removed
          }
        });
        // Remove sources safely
        [AGENTS_SOURCE_ID, 'm1-me-source'].forEach(sourceId => {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (e) {
            // Source already removed
          }
        });
        sourceAddedRef.current = false;
      } catch (e) {
        // Map already destroyed, ignore
      }
    };
  }, [map]);

  // Hide/show layers based on enabled
  useEffect(() => {
    if (!map || !sourceAddedRef.current) return;

    const visibility = enabled ? 'visible' : 'none';
    [AGENTS_GLOW_LAYER_ID, AGENTS_LAYER_ID, ME_GLOW_LAYER_ID, ME_LAYER_ID, ME_LABEL_LAYER_ID].forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [map, enabled]);

  // This component renders nothing - all rendering is done by MapLibre
  return null;
};

export default AgentsLayer3D;
