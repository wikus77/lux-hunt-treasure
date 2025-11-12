// Agents Layer for MapLibre 3D - Red markers overlay
import React, { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import type { AgentDTO } from '@/features/living-map/adapters/readOnlyData';
import { getLiveAgents, onAgentsChanged } from '@/features/living-map/adapters/readOnlyData';

interface AgentsLayer3DProps {
  map: MLMap | null;
  enabled: boolean;
  agents?: AgentDTO[]; // Optional override for dev mocks
  mePosition?: { lat: number; lng: number } | null;
}

const AgentsLayer3D: React.FC<AgentsLayer3DProps> = ({ map, enabled, agents: agentsProp, mePosition }) => {
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

useEffect(() => {
    if (!enabled) return;

    // If agents prop is provided (dev or live), use it
    if (agentsProp) {
      setAgents(agentsProp);
    } else {
      // Otherwise, load from adapter (dev mock or real if implemented)
      getLiveAgents().then(setAgents);
      const unsubscribe = onAgentsChanged(setAgents);
      return () => unsubscribe();
    }
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

  const augmentedAgents = [...agents];
  if (mePosition && !augmentedAgents.some(a => a.id === 'me-local')) {
    augmentedAgents.push({
      id: 'me-local',
      lat: mePosition.lat,
      lng: mePosition.lng,
      username: 'You',
      status: 'online',
      lastSeen: new Date().toISOString()
    } as AgentDTO);
  }

  if (!enabled || augmentedAgents.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 650 }}>
      {augmentedAgents.map((agent) => {
        const pos = positions.get(agent.id);
        if (!pos) return null;

        const isMe = agent.id === 'me-local' || /you/i.test(agent.username || '');

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
              className={isMe ? 'm1-agent-dot m1-agent-dot--me' : 'm1-agent-dot'}
              title={isMe ? 'You' : agent.username}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AgentsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
