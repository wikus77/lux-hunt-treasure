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

// Internal state machine for channel status
type ChannelState = 'idle' | 'joining' | 'subscribed' | 'error';
let channelState: ChannelState = 'idle';
let pendingTrack: AgentPresence | null = null;

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
  // Update debug status
  (window as any).__M1_DEBUG = Object.assign((window as any).__M1_DEBUG ?? {}, {
    presence: { status: 'INIT', last: null, error: null, count: 0 }
  });
  
  if (channel) {
    console.warn('⚠️ Agents presence already initialized');
    (window as any).__M1_DEBUG.presence.status = 'ALREADY_INIT';
    return;
  }

  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  
  if (!id) {
    console.error('❌ Cannot init agents presence: user not authenticated');
    (window as any).__M1_DEBUG.presence = { status: 'ERROR', error: 'NOT_AUTHENTICATED', last: null, count: 0 };
    return;
  }

  console.log('🟢 Initializing agents presence for', agentCode);
  console.log('[Presence] Channel: m1_agents_presence_v1');

  // Create presence channel (v1) with presence + broadcast ack
  channel = supabase.channel('m1_agents_presence_v1', {
    config: {
      presence: { key: id },
      broadcast: { ack: true }
    },
  });

  console.log('[Presence] status → CHANNEL_CREATED');
  channelState = 'joining';
  (window as any).__M1_DEBUG.presence = { status: 'CHANNEL_CREATED', state: channelState, queued: false, count: 0 };

  // Subscribe with retries (1s, 2s, 4s, 8s, 16s) before failing
  async function subscribeWithRetry(maxAttempts = 5): Promise<void> {
    let attempt = 1;
    while (attempt <= maxAttempts) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.error('❌ PRESENCE_SUBSCRIBE_TIMEOUT (15s)');
            channelState = 'error';
            (window as any).__M1_DEBUG.presence = { status: 'ERROR', error: 'TIMEOUT', state: channelState, queued: !!pendingTrack, count: 0 };
            reject(new Error('PRESENCE_SUBSCRIBE_TIMEOUT'));
          }, 15000);

          console.log('[Presence] status → SUBSCRIBING (attempt', attempt, ')');
          (window as any).__M1_DEBUG.presence = { status: 'SUBSCRIBING', state: channelState, queued: !!pendingTrack, count: 0 };

          channel!
            .on('presence', { event: 'sync' }, () => {
              const state = channel!.presenceState();
              const count = Object.keys(state).length;
              console.log('[Presence] status → SYNC', { count });
              (window as any).__M1_DEBUG.presence = {
                status: 'SYNC',
                last: Date.now(),
                error: null,
                count
              };
            })
            .subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(timeout);
                console.log('[Presence] status → SUBSCRIBED');
                channelState = 'subscribed';
                (window as any).__M1_DEBUG.presence = { status: 'SUBSCRIBED', state: channelState, queued: !!pendingTrack, count: 0 };

                // Track initial presence (await to ensure ACK)
                try {
                  const initialPayload = {
                    id,
                    agent_code: agentCode,
                    timestamp: Date.now(),
                    ...(getCoords() || {}),
                  };
                  console.log('[Presence] Tracking initial payload:', { agent_code: agentCode, hasCoords: !!getCoords() });
                  await channel!.track(initialPayload as any);
                  console.log('[Presence] status → TRACKED');
                  (window as any).__M1_DEBUG.presence = { status: 'TRACKED', state: channelState, queued: !!pendingTrack, count: 0 };
                  
                  // Send any pending track from queue
                  if (pendingTrack) {
                    console.log('[Presence] ♻️ Sending queued track:', pendingTrack);
                    try {
                      await channel!.track(pendingTrack as any);
                      console.log('[Presence] ✅ Queued track sent successfully');
                      pendingTrack = null;
                      (window as any).__M1_DEBUG.presence.queued = false;
                    } catch (queueErr) {
                      console.error('[Presence] ❌ Queued track failed:', queueErr);
                    }
                  }
                } catch (e) {
                  console.error('[Presence] Initial track failed:', e);
                  channelState = 'error';
                  (window as any).__M1_DEBUG.presence = { status: 'ERROR', error: 'TRACK_FAILED', state: channelState, queued: !!pendingTrack, count: 0 };
                }
                resolve();
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                clearTimeout(timeout);
                console.error('[Presence] Channel error:', status);
                channelState = 'error';
                (window as any).__M1_DEBUG.presence = { status: 'ERROR', error: status, state: channelState, queued: !!pendingTrack, count: 0 };
                reject(new Error(String(status)));
              }
            });
        });
        console.log(`[Presence] ✅ SUBSCRIBED on attempt #${attempt}`);
        return; // success
      } catch (e) {
        console.warn(`[Presence] Retry #${attempt} failed`, e);
        if (attempt >= maxAttempts) throw e;
        // Recreate channel before retry to avoid stale listeners
        if (channel) {
          try { supabase.removeChannel(channel); } catch {}
        }
        channel = supabase.channel('m1_agents_presence_v1', {
          config: {
            presence: { key: id },
            broadcast: { ack: true }
          },
        });
        const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, backoffMs));
        attempt++;
      }
    }
  }

  await subscribeWithRetry();

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
    
    if (import.meta.env.DEV) {
      console.log('💓 Heartbeat: Refreshing presence', { 
        timestamp: payload.timestamp, 
        hasCoords: !!coords 
      });
    }
    
    channel.track(payload as any).catch(err => {
      console.warn('⚠️ Heartbeat track failed:', err);
    });
  }, 30000); // 30s heartbeat
  
  console.log('✅ Agents presence initialization complete (heartbeat: 30s)');
}

/**
 * Track position immediately (called externally when coords become available)
 * FAIL-SOFT: Never throws - queues if channel not ready
 * @param agentCode - Current user's agent code
 * @param coords - Coordinates to track
 */
export async function trackNow(agentCode: string, coords: { lat: number; lng: number }): Promise<void> {
  if (!channel) {
    if (import.meta.env.DEV) {
      console.log('[Presence] ⏸️ trackNow queued: channel not initialized');
    }
    return; // Fail-soft: don't throw
  }

  // If not subscribed yet, queue the payload
  if (channelState !== 'subscribed') {
    const { data: sessionData } = await supabase.auth.getSession();
    const id = sessionData.session?.user.id;
    if (!id) {
      if (import.meta.env.DEV) {
        console.log('[Presence] ⏸️ trackNow skipped: no user session');
      }
      return; // Fail-soft
    }

    pendingTrack = {
      id,
      agent_code: agentCode,
      lat: coords.lat,
      lng: coords.lng,
      timestamp: Date.now(),
    };

    if (import.meta.env.DEV) {
      console.log(`[Presence] 📥 trackNow queued (state: ${channelState}):`, pendingTrack);
    }

    (window as any).__M1_DEBUG = {
      ...(window as any).__M1_DEBUG,
      presence: {
        ...(window as any).__M1_DEBUG?.presence,
        queued: true
      }
    };
    return; // Queued, will send when subscribed
  }

  // Channel is subscribed - send immediately
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const id = sessionData.session?.user.id;
    if (!id) {
      if (import.meta.env.DEV) {
        console.log('[Presence] ⏸️ trackNow skipped: no user session');
      }
      return; // Fail-soft
    }

    const payload: AgentPresence = {
      id,
      agent_code: agentCode,
      lat: coords.lat,
      lng: coords.lng,
      timestamp: Date.now(),
    };

    await channel.track(payload as any);
    
    if (import.meta.env.DEV) {
      console.log('[Presence] ✅ trackNow: immediate track sent', { agent_code: agentCode, coords });
    }
    
    (window as any).__M1_DEBUG = {
      ...(window as any).__M1_DEBUG,
      presence: {
        ...(window as any).__M1_DEBUG?.presence,
        last: Date.now()
      }
    };
  } catch (err) {
    // Fail-soft: log but don't throw
    console.error('[Presence] ❌ trackNow failed:', err);
  }
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
    const allAgents: AgentPresence[] = [];
    const agentsWithCoords: AgentPresence[] = [];
    const now = Date.now();

    // Flatten presence state and filter out stale entries (>90s)
    Object.values(state).forEach((presences) => {
      presences.forEach((presence) => {
        if (now - presence.timestamp < 90000) {
          allAgents.push(presence);
          
          // Track agents WITH coordinates separately
          if (presence.lat !== undefined && presence.lng !== undefined) {
            agentsWithCoords.push(presence);
          } else if (import.meta.env.DEV) {
            console.log(`[Presence] no coords: ${presence.agent_code}`);
          }
        }
      });
    });

    // Expose debug info (always available) with full detail for audit
    (window as any).__M1_DEBUG = {
      ...(window as any).__M1_DEBUG,
      lastAgentsPresence: agentsWithCoords, // Only agents with coords for rendering
      agentsPresenceAll: allAgents, // All online agents for badge count
      agentsPresenceRaw: state,
    };

    if (import.meta.env.DEV) {
      console.log(`[Presence] SYNC → Rendered: ${agentsWithCoords.length} / Online: ${allAgents.length}`);
    }

    // Callback receives ONLY agents with coordinates (for rendering)
    callback(agentsWithCoords);
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
