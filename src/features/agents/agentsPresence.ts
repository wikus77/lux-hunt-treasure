import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AgentPresence {
  id: string;
  agent_code: string;
  lat?: number; // Optional - agent can be online without location
  lng?: number; // Optional - agent can be online without location
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

  // Create presence channel (v1) with presence + broadcast ack
  channel = supabase.channel('m1_agents_presence_v1', {
    config: {
      presence: { key: id },
      broadcast: { ack: true }
    },
  });

  // Subscribe to presence state and wait for SUBSCRIBED
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('❌ PRESENCE_SUBSCRIBE_TIMEOUT (8s)');
      reject(new Error('PRESENCE_SUBSCRIBE_TIMEOUT'));
    }, 8000);

    channel!
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState();
        console.log('👥 Agents presence sync:', Object.keys(state).length, 'online');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          console.log('✅ Agents presence channel SUBSCRIBED');
          
          // Track initial presence (await to ensure ACK)
          // ALWAYS track self, even without coordinates (online marker)
          try {
            const initialPayload = {
              id,
              agent_code: agentCode,
              timestamp: Date.now(),
              ...(getCoords() || {}), // Add coords if available
            };
            console.log('📤 Tracking initial presence:', initialPayload);
            await channel!.track(initialPayload as any);
            console.log('✅ Initial presence tracked successfully');
          } catch (e) {
            console.warn('⚠️ Initial presence track failed:', e);
          }
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          console.error('❌ Agents presence channel error:', status);
          reject(new Error(String(status)));
        }
      });
  });

  // Heartbeat every 30s to refresh presence (requirement)
  // Always track, even without coordinates (keep agent online)
  heartbeatInterval = setInterval(() => {
    if (!channel) return;
    
    const coords = getCoords();
    const payload = {
      id,
      agent_code: agentCode,
      timestamp: Date.now(),
      ...(coords || {}), // Include coords if available
    };
    
    console.log('💓 Heartbeat: Refreshing presence', { 
      timestamp: payload.timestamp, 
      hasCoords: !!coords 
    });
    
    channel.track(payload as any).catch(err => {
      console.warn('⚠️ Heartbeat track failed:', err);
    });
  }, 30000); // 30s heartbeat
  
  console.log('✅ Agents presence initialization complete (heartbeat: 30s)');
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

    // Expose debug info (always available)
    (window as any).__M1_DEBUG = {
      ...(window as any).__M1_DEBUG,
      lastAgentsPresence: agents,
      agentsPresenceRaw: state,
    };

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
