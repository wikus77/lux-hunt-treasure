/**
 * M1SSION™ — UI button click feedback (pilot: cashback, streak, shop pills)
 * Plays a short click sound + light haptic. Fire-and-forget; never blocks UI.
 * © 2026 Joseph MULÉ – NIYVORA KFT
 */

import { hapticLight } from '@/utils/haptics';

const UI_CLICK_SOUND = '/assets/audio/m1ssion-click.mp3';
const VOLUME = 0.35;

let _audioPool: HTMLAudioElement | null = null;

function getPooledAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (_audioPool) {
    _audioPool.currentTime = 0;
    return _audioPool;
  }
  try {
    const a = new Audio(UI_CLICK_SOUND);
    a.volume = VOLUME;
    a.preload = 'auto';
    _audioPool = a;
    return a;
  } catch {
    return null;
  }
}

/**
 * Trigger click sound + light haptic. Non-blocking; safe to call on every pill/button press.
 * If sound or haptic fails, the UI action continues unchanged.
 */
export function buttonClickFeedback(): void {
  hapticLight();
  const audio = getPooledAudio();
  if (audio) {
    audio.play().catch(() => {});
  }
}
