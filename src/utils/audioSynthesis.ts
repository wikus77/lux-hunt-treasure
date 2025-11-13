// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Web Audio API Synthesis Utilities
 * Generates procedural sound effects without requiring external audio files
 */

/**
 * Creates a continuous vortex/spinning sound effect
 * Returns an AudioContext and the source nodes for control
 */
export function createVortexSound(): {
  audioContext: AudioContext;
  start: () => void;
  stop: () => void;
  setVolume: (vol: number) => void;
} {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create oscillators for layered sound
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const osc3 = audioContext.createOscillator();
  
  // Create gain nodes for volume control
  const gainNode1 = audioContext.createGain();
  const gainNode2 = audioContext.createGain();
  const gainNode3 = audioContext.createGain();
  const masterGain = audioContext.createGain();
  
  // Create filter for shaping the sound
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  
  // Configure oscillators for spinning/vortex effect
  osc1.type = 'sine';
  osc1.frequency.value = 220; // Base frequency
  
  osc2.type = 'sine';
  osc2.frequency.value = 330; // Harmonic
  
  osc3.type = 'triangle';
  osc3.frequency.value = 110; // Sub-bass for depth
  
  // Set initial gains (balanced mix)
  gainNode1.gain.value = 0.15;
  gainNode2.gain.value = 0.1;
  gainNode3.gain.value = 0.08;
  masterGain.gain.value = 0.3; // Overall volume
  
  // Connect the audio graph
  osc1.connect(gainNode1);
  osc2.connect(gainNode2);
  osc3.connect(gainNode3);
  
  gainNode1.connect(filter);
  gainNode2.connect(filter);
  gainNode3.connect(filter);
  
  filter.connect(masterGain);
  masterGain.connect(audioContext.destination);
  
  // Create LFO (Low Frequency Oscillator) for modulation
  const lfo1 = audioContext.createOscillator();
  const lfo2 = audioContext.createOscillator();
  const lfoGain1 = audioContext.createGain();
  const lfoGain2 = audioContext.createGain();
  
  lfo1.frequency.value = 0.7; // Slow wobble
  lfo2.frequency.value = 1.3; // Faster shimmer
  lfoGain1.gain.value = 15; // Modulation depth
  lfoGain2.gain.value = 200; // Filter modulation
  
  lfo1.connect(lfoGain1);
  lfoGain1.connect(osc1.frequency); // Modulate main oscillator pitch
  
  lfo2.connect(lfoGain2);
  lfoGain2.connect(filter.frequency); // Modulate filter for movement
  
  let isPlaying = false;
  
  return {
    audioContext,
    start: () => {
      if (!isPlaying) {
        osc1.start();
        osc2.start();
        osc3.start();
        lfo1.start();
        lfo2.start();
        isPlaying = true;
      }
    },
    stop: () => {
      if (isPlaying) {
        // Fade out
        masterGain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.3
        );
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc3.stop();
            lfo1.stop();
            lfo2.stop();
          } catch (e) {
            // Already stopped
          }
        }, 350);
        isPlaying = false;
      }
    },
    setVolume: (vol: number) => {
      masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
