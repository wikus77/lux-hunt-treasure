/**
 * M1SSION™ Audio Feedback System
 * WebAudio-based sound effects for game events
 * iOS Safari compatible (requires user gesture to unlock)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO CONTEXT (Singleton)
// ═══════════════════════════════════════════════════════════════════════════

let audioContext: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Get or create the AudioContext
 * MUST be called after a user gesture on iOS
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.warn('[AudioFeedback] AudioContext not available:', e);
      return null;
    }
  }
  
  return audioContext;
}

/**
 * Unlock audio on iOS (call this on first user gesture)
 */
export async function unlockAudio(): Promise<boolean> {
  if (isAudioUnlocked) return true;
  
  const ctx = getAudioContext();
  if (!ctx) return false;
  
  try {
    // iOS requires resume after user gesture
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Play silent buffer to unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    
    isAudioUnlocked = true;
    console.log('[AudioFeedback] 🔊 Audio unlocked');
    return true;
  } catch (e) {
    console.warn('[AudioFeedback] Failed to unlock audio:', e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUND GENERATORS (Pure synthesized sounds, no external files)
// ═══════════════════════════════════════════════════════════════════════════

export type SoundType = 'confirm' | 'reward' | 'levelUp' | 'error' | 'pulse';

/**
 * Play a synthesized sound effect
 * Falls back gracefully if audio unavailable
 */
export function playSound(type: SoundType): void {
  if (!isAudioUnlocked) {
    console.log('[AudioFeedback] Audio not unlocked, skipping sound');
    return;
  }
  
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;
  
  try {
    switch (type) {
      case 'confirm':
        playConfirmSound(ctx);
        break;
      case 'reward':
        playRewardSound(ctx);
        break;
      case 'levelUp':
        playLevelUpSound(ctx);
        break;
      case 'error':
        playErrorSound(ctx);
        break;
      case 'pulse':
        playPulseSound(ctx);
        break;
    }
  } catch (e) {
    console.warn('[AudioFeedback] Error playing sound:', e);
  }
}

// Soft confirm "ding" (short, pleasant) - Volume +15%
function playConfirmSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);       // A5
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05); // E6
  
  gain.gain.setValueAtTime(0.18, now);  // +15% (was 0.15)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.15);
}

// Reward chime (ascending notes) - Volume +15%
function playRewardSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.14, now + i * 0.08 + 0.02);  // +15% (was 0.12)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
    
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.25);
  });
}

// Level up fanfare (major chord arpeggio) - Volume +15%
function playLevelUpSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  
  // Major chord arpeggio + octave
  const notes = [
    { freq: 261.63, time: 0 },      // C4
    { freq: 329.63, time: 0.06 },   // E4
    { freq: 392.00, time: 0.12 },   // G4
    { freq: 523.25, time: 0.18 },   // C5
    { freq: 659.25, time: 0.24 },   // E5
    { freq: 783.99, time: 0.30 },   // G5
    { freq: 1046.50, time: 0.36 },  // C6
  ];
  
  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);
    
    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.12, now + time + 0.02);  // +15% (was 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.4);
    
    osc.start(now + time);
    osc.stop(now + time + 0.45);
  });
}

// Error buzz (low, short) - Volume +15%
function playErrorSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
  
  gain.gain.setValueAtTime(0.10, now);  // +15% (was 0.08)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  
  osc.start(now);
  osc.stop(now + 0.12);
}

// Pulse/scan sound (futuristic sweep) - Volume +15%
function playPulseSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
  
  gain.gain.setValueAtTime(0.12, now);  // +15% (was 0.1)
  gain.gain.linearRampToValueAtTime(0.06, now + 0.1);  // +15% (was 0.05)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  
  osc.start(now);
  osc.stop(now + 0.25);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Get sound type for event
// ═══════════════════════════════════════════════════════════════════════════

export function getSoundForEvent(eventType: string): SoundType {
  switch (eventType) {
    // Reward sounds
    case 'MILESTONE_REACHED':
    case 'LEVEL_UP':
    case 'RANK_UP':
      return 'levelUp';
    
    case 'M1U_CREDITED':
    case 'CASHBACK_ACCRUED':
    case 'MARKER_REWARD_CLAIMED':
    case 'BATTLE_WIN':
    case 'PULSE_BREAKER_CASHOUT':
      return 'reward';
    
    // Error sounds
    case 'BUZZ_FAIL':
    case 'BUZZ_INSUFFICIENT_M1U':
    case 'BATTLE_LOSE':
    case 'PULSE_BREAKER_CRASH':
      return 'error';
    
    // Pulse/scan sounds
    case 'BUZZ_MAP_AREA_CREATED':
    case 'BUZZ_MAP_CLUE_FOUND':
    case 'AION_ANALYSIS_COMPLETE':
      return 'pulse';
    
    // Default confirm
    default:
      return 'confirm';
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

