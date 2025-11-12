// Agents Layer for MapLibre 3D - Red markers overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import type { AgentDTO } from '@/features/living-map/adapters/readOnlyData';
import { getLiveAgents, onAgentsChanged } from '@/features/living-map/adapters/readOnlyData';

interface AgentsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  agents?: AgentDTO[]; // Optional override for dev mocks
}

const AgentsLayer3D: React.FC<AgentsLayer3DProps> = ({ map, enabled, agents: agentsProp }) => {
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    // If agents prop is provided (dev mocks), use it directly
    if (agentsProp) {
      setAgents(agentsProp);
      return;
    }

    // Otherwise, load from API (production behavior)
    getLiveAgents().then(setAgents);
    const unsubscribe = onAgentsChanged(setAgents);

    return () => {
      unsubscribe();
    };
  }, [enabled, agentsProp]);

  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      agents.forEach(agent => {
        const point = map.project([agent.lng, agent.lat]);
        newPositions.set(agent.id, { x: point.x, y: point.y });
      });
      setPositions(newPositions);
    };

    updatePositions();
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
    };
  }, [map, agents, enabled]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#24E39E';
      case 'idle': return '#FFB347';
      default: return '#8DA3B8';
    }
  };

  if (!enabled || agents.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {agents.map((agent) => {
        const pos = positions.get(agent.id);
        if (!pos) return null;

        return (
          <div
            key={agent.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="m1-agent-dot"
              style={{
                background: getStatusColor(agent.status),
                boxShadow: `0 0 10px ${getStatusColor(agent.status)}`
              }}
              title={agent.username}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AgentsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
