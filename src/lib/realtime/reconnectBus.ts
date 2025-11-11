/**
 * M1SSION™ - Realtime Reconnect Event Bus
 * Lightweight event bus for broadcasting Supabase Realtime reconnection states
 * @performance Zero network overhead, DOM CustomEvent based
 */

/**
 * Reconnect event types
 */
export const RECONNECT_EVENTS = {
  RECONNECTING: 'realtime:reconnecting',
  SUBSCRIBED: 'realtime:subscribed',
  ERROR: 'realtime:error',
} as const;

export type ReconnectEventType = typeof RECONNECT_EVENTS[keyof typeof RECONNECT_EVENTS];

export interface ReconnectEventDetail {
  timestamp: number;
  channelName?: string;
  reason?: string;
}

/**
 * Emit a reconnecting state event
 * 
 * @param channelName - Optional channel identifier
 * @param reason - Optional reason for reconnection
 * 
 * @example
 * ```ts
 * emitReconnecting('battle:123', 'Network timeout');
 * ```
 */
export function emitReconnecting(channelName?: string, reason?: string): void {
  const event = new CustomEvent<ReconnectEventDetail>(RECONNECT_EVENTS.RECONNECTING, {
    detail: {
      timestamp: Date.now(),
      channelName,
      reason,
    },
  });
  window.dispatchEvent(event);
  console.log('🔄 [Realtime] Reconnecting...', { channelName, reason });
}

/**
 * Emit a subscribed state event
 * 
 * @param channelName - Optional channel identifier
 * 
 * @example
 * ```ts
 * emitSubscribed('battle:123');
 * ```
 */
export function emitSubscribed(channelName?: string): void {
  const event = new CustomEvent<ReconnectEventDetail>(RECONNECT_EVENTS.SUBSCRIBED, {
    detail: {
      timestamp: Date.now(),
      channelName,
    },
  });
  window.dispatchEvent(event);
  console.log('✅ [Realtime] Subscribed', { channelName });
}

/**
 * Emit an error state event
 * 
 * @param reason - Error reason
 * @param channelName - Optional channel identifier
 * 
 * @example
 * ```ts
 * emitError('Connection failed', 'battle:123');
 * ```
 */
export function emitError(reason: string, channelName?: string): void {
  const event = new CustomEvent<ReconnectEventDetail>(RECONNECT_EVENTS.ERROR, {
    detail: {
      timestamp: Date.now(),
      channelName,
      reason,
    },
  });
  window.dispatchEvent(event);
  
  // Silence non-critical broadcast channel errors (pulse_notifications uses broadcast, not postgres_changes)
  const isBroadcastChannel = channelName === 'pulse_notifications' || channelName?.includes('_notifications');
  if (!isBroadcastChannel || reason === 'TIMED_OUT') {
    // Only log non-broadcast errors or timeouts
    console.error('❌ [Realtime] Error', { channelName, reason });
  }
}

/**
 * Subscribe to reconnect events
 * 
 * @param eventType - Event type to listen to
 * @param handler - Event handler function
 * @returns Cleanup function to remove listener
 * 
 * @example
 * ```ts
 * const unsubscribe = onReconnectEvent(RECONNECT_EVENTS.RECONNECTING, (detail) => {
 *   console.log('Reconnecting:', detail);
 * });
 * // Later...
 * unsubscribe();
 * ```
 */
export function onReconnectEvent(
  eventType: ReconnectEventType,
  handler: (detail: ReconnectEventDetail) => void
): () => void {
  const listener = ((event: CustomEvent<ReconnectEventDetail>) => {
    handler(event.detail);
  }) as EventListener;

  window.addEventListener(eventType, listener);

  return () => {
    window.removeEventListener(eventType, listener);
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
