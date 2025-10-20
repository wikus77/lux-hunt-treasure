import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AgentPresence {
  id: string;
  agent_code: string;
  lat: number;
  lng: number;
  timestamp: number;
}

let channel: RealtimeChannel | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let updateDebounceTimer: NodeJS.Timeout | null = null;

/**
 * Initialize agents presence tracking
 * @param agentCode - Current user's agent code (e.g., "AG-X0197")
 * @param getCoords - Function that returns current coordinates or null
 * @returns Promise that resolves when initialization is complete
 */
export async function initAgentsPresence(
  agentCode: string,
  getCoords: () => { lat: number; lng: number } | null
): Promise<void> {
  if (channel) {
    console.warn('⚠️ Agents presence already initialized');
    return;
  }

  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  
  if (!id) {
    console.error('❌ Cannot init agents presence: user not authenticated');
    return;
  }

  console.log('🟢 Initializing agents presence for', agentCode);

  // Create presence channel
  channel = supabase.channel('agents_presence', {
    config: {
      presence: {
        key: id,
      },
    },
  });

  // Subscribe to presence state
  await new Promise<void>((resolve) => {
    channel!
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState();
        if (import.meta.env.DEV) {
          console.log('👥 Agents presence sync:', Object.keys(state).length, 'online');
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Agents presence channel subscribed');
          // Track initial presence
          updatePresence(id, agentCode, getCoords);
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Agents presence channel error:', status);
          resolve(); // Resolve anyway to not block
        }
      });
  });

  // Heartbeat every 30s to keep presence alive
  heartbeatInterval = setInterval(() => {
    updatePresence(id, agentCode, getCoords);
  }, 30000);
  
  console.log('✅ Agents presence initialization complete');
}

/**
 * Update user's presence with debouncing (5s)
 */
function updatePresence(
  userId: string,
  agentCode: string,
  getCoords: () => { lat: number; lng: number } | null
) {
  if (updateDebounceTimer) {
    clearTimeout(updateDebounceTimer);
  }

  updateDebounceTimer = setTimeout(() => {
    const coords = getCoords();
    
    if (!coords) {
      if (import.meta.env.DEV) {
        console.log('⏸️ Skipping presence update: no coordinates available');
      }
      return;
    }

    if (!channel) return;

    const payload: AgentPresence = {
      id: userId,
      agent_code: agentCode,
      lat: coords.lat,
      lng: coords.lng,
      timestamp: Date.now(),
    };

    channel.track(payload);
    
    if (import.meta.env.DEV) {
      console.log('📍 Presence updated:', payload.agent_code, `(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
    }
  }, 5000);
}

/**
 * Subscribe to agents presence changes
 * @param callback - Called with array of online agents
 * @returns Unsubscribe function
 */
export function subscribeAgents(
  callback: (agents: AgentPresence[]) => void
): () => void {
  if (!channel) {
    console.error('❌ Cannot subscribe: agents presence not initialized');
    return () => {};
  }

  const handleSync = () => {
    const state = channel!.presenceState<AgentPresence>();
    const agents: AgentPresence[] = [];
    const now = Date.now();

    // Flatten presence state and filter out stale entries (>90s)
    Object.values(state).forEach((presences) => {
      presences.forEach((presence) => {
        if (now - presence.timestamp < 90000) {
          agents.push(presence);
        }
      });
    });

    // Expose debug info
    if (import.meta.env.DEV) {
      (window as any).__M1_DEBUG = {
        ...(window as any).__M1_DEBUG,
        lastAgentsPresence: agents,
        agentsPresenceRaw: state,
      };
    }

    callback(agents);
  };

  // Initial sync
  handleSync();

  // Listen for changes
  const syncSubscription = channel.on('presence', { event: 'sync' }, handleSync);
  const joinSubscription = channel.on('presence', { event: 'join' }, handleSync);
  const leaveSubscription = channel.on('presence', { event: 'leave' }, handleSync);

  // Return unsubscribe function
  return () => {
    // Note: Supabase Realtime doesn't have an 'off' method per se
    // The subscriptions are automatically cleaned up when channel is removed
    if (import.meta.env.DEV) {
      console.log('🔇 Unsubscribing from agents presence updates');
    }
  };
}

/**
 * Teardown presence tracking
 */
export function teardownAgentsPresence() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (updateDebounceTimer) {
    clearTimeout(updateDebounceTimer);
    updateDebounceTimer = null;
  }

  if (channel) {
    channel.untrack();
    supabase.removeChannel(channel);
    channel = null;
    console.log('🔴 Agents presence teardown complete');
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
