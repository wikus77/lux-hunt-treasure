import React, { useMemo } from 'react';
import type { AgentDTO } from '../adapters/readOnlyData';

interface AgentsLayerProps {
  agents: AgentDTO[];
}

interface ClusterInfo {
  position: { lat: number; lng: number };
  count: number;
  agents: AgentDTO[];
}

const AgentsLayer: React.FC<AgentsLayerProps> = ({ agents }) => {
  // Simple clustering: group agents within 24px radius
  const clusters = useMemo(() => {
    const CLUSTER_THRESHOLD = 0.0005; // ~50m in degrees
    const processed = new Set<string>();
    const result: ClusterInfo[] = [];

    agents.forEach((agent) => {
      if (processed.has(agent.id)) return;

      const nearby = agents.filter((other) => {
        if (processed.has(other.id)) return false;
        const distance = Math.sqrt(
          Math.pow(agent.lat - other.lat, 2) + Math.pow(agent.lng - other.lng, 2)
        );
        return distance < CLUSTER_THRESHOLD;
      });

      nearby.forEach((a) => processed.add(a.id));

      result.push({
        position: {
          lat: nearby.reduce((sum, a) => sum + a.lat, 0) / nearby.length,
          lng: nearby.reduce((sum, a) => sum + a.lng, 0) / nearby.length
        },
        count: nearby.length,
        agents: nearby
      });
    });

    return result;
  }, [agents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#24E39E';
      case 'idle': return '#FFB347';
      default: return '#8DA3B8';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {clusters.map((cluster, idx) => (
        <div
          key={`cluster-${idx}`}
          className="absolute living-agent-marker"
          style={{
            left: `${(cluster.position.lng % 360 + 360) % 360}%`,
            top: `${(90 - cluster.position.lat) / 180 * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Main agent dot */}
          <div
            className="relative"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: getStatusColor(cluster.agents[0].status),
              boxShadow: `0 0 10px ${getStatusColor(cluster.agents[0].status)}`,
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Trail effect */}
            <div
              className="living-agent-trail"
              style={{
                width: 20,
                height: 20,
                top: -3,
                left: -3,
                background: getStatusColor(cluster.agents[0].status),
                opacity: 0.4
              }}
            />
          </div>

          {/* Cluster badge if >1 agent */}
          {cluster.count > 1 && (
            <div className="living-cluster-badge">
              {cluster.count}
            </div>
          )}

          {/* Tooltip on hover */}
          <div
            className="living-hud-glass absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-auto"
            style={{
              color: 'var(--living-map-text-primary)',
              fontSize: '10px'
            }}
          >
            {cluster.count === 1
              ? cluster.agents[0].username
              : `${cluster.count} agents`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
