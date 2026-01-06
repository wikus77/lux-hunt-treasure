/**
 * M1SSION™ Game Events - Public API
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export {
  emitGameEvent,
  getEventCopy,
  type GameEvent,
  type GameEventType,
  type EventPriority,
  type EventCopy,
} from './gameEvents';

export {
  enqueueEvent,
  dismissCurrentEvent,
  getCurrentEvent,
  getQueueLength,
  clearQueue,
  subscribeToQueue,
  startAutoDismiss,
  cancelAutoDismiss,
} from './gameEventQueue';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

