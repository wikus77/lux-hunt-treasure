// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Audio Controller - Manages audio playback between components

type AudioEventType = 'pause-page-audio' | 'resume-page-audio';

const listeners: Map<AudioEventType, Set<() => void>> = new Map();

/**
 * Subscribe to an audio event
 */
export const subscribeAudioEvent = (event: AudioEventType, callback: () => void): (() => void) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    listeners.get(event)?.delete(callback);
  };
};

/**
 * Emit an audio event
 */
export const emitAudioEvent = (event: AudioEventType): void => {
  listeners.get(event)?.forEach(callback => callback());
};

/**
 * Pause all page audio (call this from buttons that need to play their own sound)
 */
export const pausePageAudio = (): void => {
  emitAudioEvent('pause-page-audio');
};

/**
 * Resume page audio (call this after button sound finishes)
 */
export const resumePageAudio = (): void => {
  emitAudioEvent('resume-page-audio');
};

