/**
 * M1SSION™ Game Event Queue
 * Manages event queue to prevent overlay stacking
 * RULE: Only 1 overlay visible at a time, queue the rest
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { GameEvent, GameEventType } from './gameEvents';

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface QueueState {
  queue: GameEvent[];
  currentEvent: GameEvent | null;
  isProcessing: boolean;
  listeners: Set<(event: GameEvent | null) => void>;
}

const state: QueueState = {
  queue: [],
  currentEvent: null,
  isProcessing: false,
  listeners: new Set(),
};

// ═══════════════════════════════════════════════════════════════════════════
// DEDUP / MERGE LOGIC
// ═══════════════════════════════════════════════════════════════════════════

const MERGE_WINDOW_MS = 1000; // 1 second window for merging similar events

const MERGEABLE_EVENTS: GameEventType[] = [
  'PE_GAINED',
  'M1U_CREDITED',
  'CASHBACK_ACCRUED',
];

function shouldMerge(existing: GameEvent, incoming: GameEvent): boolean {
  if (existing.type !== incoming.type) return false;
  if (!MERGEABLE_EVENTS.includes(existing.type)) return false;
  if (incoming.timestamp - existing.timestamp > MERGE_WINDOW_MS) return false;
  return true;
}

function mergeEvents(existing: GameEvent, incoming: GameEvent): GameEvent {
  return {
    ...existing,
    payload: {
      ...existing.payload,
      amount: (existing.payload.amount || 0) + (incoming.payload.amount || 0),
    },
    timestamp: incoming.timestamp, // Use latest timestamp
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add event to queue, respecting merge rules
 */
export function enqueueEvent(event: GameEvent): void {
  // Check if we should merge with last event in queue
  if (state.queue.length > 0) {
    const lastEvent = state.queue[state.queue.length - 1];
    if (shouldMerge(lastEvent, event)) {
      state.queue[state.queue.length - 1] = mergeEvents(lastEvent, event);
      console.log(`[EventQueue] 🔗 Merged ${event.type} with previous (total: ${state.queue[state.queue.length - 1].payload.amount})`);
      return;
    }
  }
  
  // Check if current event should be merged
  if (state.currentEvent && shouldMerge(state.currentEvent, event)) {
    state.currentEvent = mergeEvents(state.currentEvent, event);
    notifyListeners();
    console.log(`[EventQueue] 🔗 Merged ${event.type} with current (total: ${state.currentEvent.payload.amount})`);
    return;
  }
  
  // Add to queue
  state.queue.push(event);
  console.log(`[EventQueue] ➕ Enqueued ${event.type} (queue size: ${state.queue.length})`);
  
  // Start processing if not already
  if (!state.isProcessing) {
    processNextEvent();
  }
}

/**
 * Process next event in queue
 */
function processNextEvent(): void {
  // If already showing an event, wait
  if (state.currentEvent !== null) {
    console.log(`[EventQueue] ⏸️ Waiting for current event to complete`);
    return;
  }
  
  // Get next event (prioritize major events)
  const majorIndex = state.queue.findIndex(e => e.priority === 'major');
  const nextIndex = majorIndex !== -1 ? majorIndex : 0;
  
  if (state.queue.length === 0) {
    state.isProcessing = false;
    console.log(`[EventQueue] ✅ Queue empty, processing complete`);
    return;
  }
  
  state.isProcessing = true;
  state.currentEvent = state.queue.splice(nextIndex, 1)[0];
  
  console.log(`[EventQueue] 🎬 Showing ${state.currentEvent.type} (${state.currentEvent.priority})`);
  notifyListeners();
}

/**
 * Dismiss current event and show next
 */
export function dismissCurrentEvent(): void {
  if (!state.currentEvent) return;
  
  console.log(`[EventQueue] ✖️ Dismissed ${state.currentEvent.type}`);
  state.currentEvent = null;
  notifyListeners();
  
  // Process next after short delay (prevents jarring transitions)
  setTimeout(() => {
    processNextEvent();
  }, 300);
}

/**
 * Get current event being displayed
 */
export function getCurrentEvent(): GameEvent | null {
  return state.currentEvent;
}

/**
 * Get queue length (for debugging)
 */
export function getQueueLength(): number {
  return state.queue.length;
}

/**
 * Clear all events (for reset/cleanup)
 */
export function clearQueue(): void {
  state.queue = [];
  state.currentEvent = null;
  state.isProcessing = false;
  notifyListeners();
  console.log(`[EventQueue] 🗑️ Queue cleared`);
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTENERS (for React integration)
// ═══════════════════════════════════════════════════════════════════════════

export function subscribeToQueue(callback: (event: GameEvent | null) => void): () => void {
  state.listeners.add(callback);
  // Immediately notify with current state
  callback(state.currentEvent);
  
  return () => {
    state.listeners.delete(callback);
  };
}

function notifyListeners(): void {
  state.listeners.forEach(listener => {
    try {
      listener(state.currentEvent);
    } catch (err) {
      console.error('[EventQueue] Listener error:', err);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-DISMISS TIMERS
// ═══════════════════════════════════════════════════════════════════════════

const AUTO_DISMISS_MS: Record<string, number> = {
  minor: 3000, // 3 seconds for toasts
  major: 0,    // Manual dismiss for modals (0 = no auto-dismiss)
};

let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Start auto-dismiss timer for current event
 */
export function startAutoDismiss(): void {
  if (!state.currentEvent) return;
  
  const duration = AUTO_DISMISS_MS[state.currentEvent.priority];
  if (duration === 0) return; // No auto-dismiss for this priority
  
  // Clear existing timer
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
  }
  
  autoDismissTimer = setTimeout(() => {
    dismissCurrentEvent();
  }, duration);
  
  console.log(`[EventQueue] ⏱️ Auto-dismiss in ${duration}ms`);
}

/**
 * Cancel auto-dismiss timer (e.g., on hover)
 */
export function cancelAutoDismiss(): void {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

