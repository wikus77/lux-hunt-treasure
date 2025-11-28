// @ts-nocheck
// Agents Layer for MapLibre 3D - Red markers overlay
import React, { useEffect, useState, useMemo } from 'react';
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

const AgentsLayer3D: React.FC<AgentsLayer3DProps> = ({ map, enabled, agents: agentsProp, mePosition, currentUserId, onAgentClick }) => {
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // 🔥 UNIFIED FIX: Aggiorna la posizione dell'agente corrente invece di crearne uno nuovo
  const augmentedAgents = useMemo(() => {
    const result = [...agents];
    
    if (mePosition) {
      // Cerca l'agente corrente nella lista (per user_id)
      const myAgentIndex = currentUserId 
        ? result.findIndex(a => a.id === currentUserId)
        : -1;
      
      if (myAgentIndex >= 0) {
        // 🎯 UNIFICA: Aggiorna le coordinate dell'agente esistente con GPS reale
        result[myAgentIndex] = {
          ...result[myAgentIndex],
          lat: mePosition.lat,
          lng: mePosition.lng,
          status: 'online',
          lastSeen: new Date().toISOString()
        };
        console.debug('📍 [AgentsLayer3D] Updated existing agent position:', { 
          id: result[myAgentIndex].id,
          username: result[myAgentIndex].username,
          lat: mePosition.lat, 
          lng: mePosition.lng 
        });
      } else {
        // Se l'utente NON è nella lista dal DB, aggiungi marker locale "me"
        // (solo se non è già presente)
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
        console.debug('📍 [AgentsLayer3D] Added local me marker:', { lat: mePosition.lat, lng: mePosition.lng });
      }
    }
    
    return result;
  }, [agents, mePosition?.lat, mePosition?.lng, currentUserId]);

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

  // 🔥 FIX: Update positions with requestAnimationFrame for smooth map-locked movement
  const rafRef = React.useRef<number | null>(null);
  
  useEffect(() => {
    if (!map || !enabled) return;

    const updatePositions = () => {
      const newPositions = new Map<string, { x: number; y: number }>();
      
      // Project ALL agents including "me-local"
      augmentedAgents.forEach(agent => {
        try {
          const point = map.project([agent.lng, agent.lat]);
          newPositions.set(agent.id, { x: point.x, y: point.y });
        } catch (e) {
          // Skip invalid coordinates
        }
      });
      
      setPositions(newPositions);
    };

    // 🎯 Use requestAnimationFrame for smoother updates during map movement
    const updateOnRender = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };

    updatePositions();
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);
    map.on('render', updateOnRender); // 🔥 Sync with map render for smooth tracking

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
      map.off('render', updateOnRender);
    };
  }, [map, augmentedAgents, enabled]);

  if (!enabled || augmentedAgents.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 650 }}>
      {augmentedAgents.map((agent) => {
        const pos = positions.get(agent.id);
        if (!pos) return null;

        // 🔥 UNIFIED: Identifico se questo marker è "me" (sia da DB che locale)
        const isMe = agent.id === 'me-local' || (currentUserId && agent.id === currentUserId);

        return (
          <div
            key={agent.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              // 🔥 NO transition - marker agganciato alla mappa senza lag
              willChange: 'left, top' // GPU acceleration hint
            }}
            onClick={() => onAgentClick?.(agent)}
          >
            <div
              className={isMe ? 'm1-agent-dot m1-agent-dot--me' : 'm1-agent-dot'}
              title={isMe ? 'Tu (la tua posizione)' : agent.username}
            />
            {/* Label "TU" sotto il marker dell'utente corrente */}
            {isMe && (
              <div 
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-400 whitespace-nowrap"
                style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
              >
                TU
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AgentsLayer3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
