// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState, useCallback } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { useBattleRealtimeSubscription, BattleRealtimeState } from '@/hooks/useBattleRealtimeSubscription';
import { renderBattleFX, BattleFXType, BattleFXMode } from '@/fx/battle';
import type { BattleFxPerformanceMode } from '@/hooks/usePerformanceSettings';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';

interface BattleFxLayerProps {
  map: MLMap | null;
  battleFxMode: BattleFxPerformanceMode;
}

interface ActiveFx {
  id: string;
  node: React.ReactNode;
  createdAt: number;
}

interface AgentPosition {
  lat: number;
  lng: number;
}

/**
 * Battle FX Layer - Renders visual effects for battle events on the 3D map
 * Subscribes to realtime battle events and displays attack/defense/resolution FX
 */
export default function BattleFxLayer({ map, battleFxMode }: BattleFxLayerProps) {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [activeFx, setActiveFx] = useState<ActiveFx[]>([]);
  const [currentBattleSessionId, setCurrentBattleSessionId] = useState<string | null>(null);
  const [agentPositions, setAgentPositions] = useState<Map<string, AgentPosition>>(new Map());

  // Subscribe to battle realtime events
  const { state: battleState } = useBattleRealtimeSubscription(currentBattleSessionId);

  // Fetch current active battle for user
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchActiveBattle = async () => {
      try {
        // Query TRON battles table (canonical)
        const { data, error } = await supabase
          .from('battles' as any)
          .select('id, creator_id, opponent_id, status')
          .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .in('status', ['pending', 'accepted', 'countdown', 'active'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.warn('[BattleFxLayer] Error fetching battles:', error);
          return;
        }

        if (data) {
          const activeBattle = data as any;
          setCurrentBattleSessionId(activeBattle.id);
          console.log('[BattleFxLayer] Active battle found:', activeBattle.id);
        } else {
          setCurrentBattleSessionId(null);
        }
      } catch (e) {
        console.warn('[BattleFxLayer] Exception fetching battles:', e);
      }
    };

    fetchActiveBattle();

    // Poll for active battles every 10s
    const interval = setInterval(fetchActiveBattle, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Fetch agent positions from agent_locations table
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAgentPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_locations' as any)
          .select('agent_id, lat, lng, updated_at')
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(100);

        if (error) {
          console.error('[BattleFxLayer] agent_locations query error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return;
        }

        if (data) {
          const posMap = new Map<string, AgentPosition>();
          data.forEach((loc: any) => {
            if (!posMap.has(loc.agent_id)) {
              posMap.set(loc.agent_id, { lat: loc.lat, lng: loc.lng });
            }
          });
          setAgentPositions(posMap);
        }
      } catch (e) {
        console.error('[BattleFxLayer] Exception fetching agent positions:', e);
      }
    };

    fetchAgentPositions();

    // Subscribe to realtime position updates
    const channel = supabase
      .channel('agent-locations-fx')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_locations' as any
      }, () => {
        fetchAgentPositions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Handle battle state changes
  useEffect(() => {
    if (!battleState || !map) return;

    const handleBattleEvent = async () => {
      const event = battleState.lastEvent;
      if (!event) return;

      console.log('[BattleFxLayer] Battle event received:', event.type);

      try {
        // Fetch battle session details to get attacker/defender IDs
        if (!currentBattleSessionId) return;

        const { data: session, error } = await supabase
          .from('battles' as any)
          .select('creator_id, opponent_id, stake_type, stake_amount')
          .eq('id', currentBattleSessionId)
          .maybeSingle();

        if (error || !session) {
          console.warn('[BattleFxLayer] Could not fetch session:', error);
          return;
        }

        const sessionData = session as any;
        const attackerPos = agentPositions.get(sessionData.creator_id);
        const defenderPos = agentPositions.get(sessionData.opponent_id);

        if (!attackerPos || !defenderPos) {
          console.warn('[BattleFxLayer] Missing agent positions');
          return;
        }

        // Determine FX mode based on performance setting
        const fxMode: BattleFXMode = battleFxMode === 'high' ? '3d-auto' : '2d';

        // Handle different event types
        switch (event.type) {
          case 'attack_started': {
            const fxId = `attack-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: 'missile',
              from: [attackerPos.lat, attackerPos.lng],
              to: [defenderPos.lat, defenderPos.lng],
              mode: fxMode,
              onEnd: () => removeFx(fxId)
            });

            setActiveFx(prev => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);

            console.log('[BattleFxLayer] Attack FX triggered');
            break;
          }

          case 'defense_needed': {
            // Show defense FX when defender needs to respond
            const fxId = `defense-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: 'shield',
              center: [defenderPos.lat, defenderPos.lng],
              mode: fxMode,
              onEnd: () => removeFx(fxId)
            });

            setActiveFx(prev => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);

            console.log('[BattleFxLayer] Defense FX triggered');
            break;
          }

          case 'battle_resolved': {
            // Show resolution FX on winner's position
            const winnerId = battleState.winnerId;
            if (!winnerId) return;

            const winnerPos = agentPositions.get(winnerId);
            if (!winnerPos) return;

            const fxId = `resolved-${Date.now()}`;
            const fxNode = renderBattleFX({
              type: 'emp',
              center: [winnerPos.lat, winnerPos.lng],
              mode: fxMode,
              onEnd: () => {
                removeFx(fxId);
                setCurrentBattleSessionId(null); // Clear battle session after resolution
              }
            });

            setActiveFx(prev => [...prev, {
              id: fxId,
              node: fxNode,
              createdAt: Date.now()
            }]);

            console.log('[BattleFxLayer] Resolution FX triggered');
            break;
          }
        }
      } catch (e) {
        console.error('[BattleFxLayer] Error handling battle event:', e);
      }
    };

    handleBattleEvent();
  }, [battleState, map, battleFxMode, currentBattleSessionId, agentPositions]);

  // Remove FX by ID
  const removeFx = useCallback((id: string) => {
    setActiveFx(prev => prev.filter(fx => fx.id !== id));
  }, []);

  // Cleanup old FX after max duration (failsafe)
  useEffect(() => {
    const MAX_FX_DURATION = 5000; // 5 seconds max
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveFx(prev => prev.filter(fx => now - fx.createdAt < MAX_FX_DURATION));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Hard limit on simultaneous FX
  useEffect(() => {
    const MAX_SIMULTANEOUS_FX = battleFxMode === 'high' ? 10 : 5;
    if (activeFx.length > MAX_SIMULTANEOUS_FX) {
      console.warn('[BattleFxLayer] Too many FX, removing oldest');
      setActiveFx(prev => prev.slice(-MAX_SIMULTANEOUS_FX));
    }
  }, [activeFx.length, battleFxMode]);

  // Render active FX
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 999 }}
    >
      {activeFx.map(fx => (
        <div key={fx.id}>{fx.node}</div>
      ))}
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
