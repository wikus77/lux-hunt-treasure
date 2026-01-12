// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * useSound - Audio hook with iOS Safari fallback
 * 
 * Handles Web Audio API with proper iOS unlock mechanism.
 * Falls back to procedural audio if no files available.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'm1ssion_sound';
const DEFAULT_VOLUME = 0.65;

type SoundType = 'scan' | 'victory' | 'shimmer' | 'entry';

interface UseSoundReturn {
  soundEnabled: boolean;
  enableSound: () => Promise<void>;
  playSound: (type: SoundType) => void;
  isAudioUnlocked: boolean;
}

// Detect iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export function useSound(): UseSoundReturn {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '1') {
      setSoundEnabled(true);
    }
  }, []);

  // Initialize AudioContext
  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create master gain node
      const gainNode = ctx.createGain();
      gainNode.gain.value = DEFAULT_VOLUME;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // iOS needs resume after user gesture
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      setIsAudioUnlocked(true);
      return ctx;
    } catch (e) {
      console.warn('[useSound] Audio init failed:', e);
      return null;
    }
  }, []);

  // Enable sound (user gesture required)
  const enableSound = useCallback(async () => {
    try {
      const ctx = await initAudioContext();
      if (ctx) {
        // Play silent buffer to fully unlock on iOS
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        setSoundEnabled(true);
        localStorage.setItem(STORAGE_KEY, '1');
        setIsAudioUnlocked(true);

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([20, 30, 20]);
        }
      }
    } catch (e) {
      console.warn('[useSound] Enable failed:', e);
    }
  }, [initAudioContext]);

  // Procedural sound generators
  const createScanSound = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const now = ctx.currentTime;
    const duration = 0.3;

    // Digital click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    clickOsc.connect(clickGain);
    clickGain.connect(destination);
    clickOsc.start(now);
    clickOsc.stop(now + duration);

    // Short sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(800, now + 0.05);
    sweepOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
    sweepGain.gain.setValueAtTime(0.15, now + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(destination);
    sweepOsc.start(now + 0.05);
    sweepOsc.stop(now + duration);
  }, []);

  const createVictorySound = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const now = ctx.currentTime;
    const duration = 1.0;
    const iosMultiplier = isIOS() ? 0.7 : 1; // Reduce bass on iOS

    // Deep bass hit
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(80 * iosMultiplier, now);
    bassOsc.frequency.exponentialRampToValueAtTime(40 * iosMultiplier, now + 0.3);
    bassGain.gain.setValueAtTime(0.5 * iosMultiplier, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    bassOsc.connect(bassGain);
    bassGain.connect(destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.5);

    // Shimmer (multiple detuned oscillators)
    const shimmerFreqs = [800, 1200, 1600, 2000];
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.1);
      osc.frequency.setValueAtTime(freq * 1.5, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + 0.1 + i * 0.03);
      osc.stop(now + duration);
    });

    // Noise burst
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 3000;
    noiseGain.gain.setValueAtTime(0.15, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);
    noiseSource.start(now + 0.05);
  }, []);

  const createShimmerSound = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const now = ctx.currentTime;
    const duration = 0.8;

    // High sparkle trail
    const freqs = [2000, 2400, 3000, 3600, 4200];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + duration);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + i * 0.1);
      osc.stop(now + duration);
    });
  }, []);

  // Epic entry sound - cinematic whoosh + impact + shimmer (2.5s duration)
  const createEntrySound = useCallback((ctx: AudioContext, destination: AudioNode) => {
    const now = ctx.currentTime;
    const iosMultiplier = isIOS() ? 0.7 : 1;

    // 1. Initial sub-bass rumble (cinematic foundation)
    const subBass = ctx.createOscillator();
    const subGain = ctx.createGain();
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(40 * iosMultiplier, now);
    subBass.frequency.exponentialRampToValueAtTime(25 * iosMultiplier, now + 0.8);
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.4 * iosMultiplier, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    subBass.connect(subGain);
    subGain.connect(destination);
    subBass.start(now);
    subBass.stop(now + 1.2);

    // 2. Rising swoosh (filtered noise)
    const swooshBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const swooshData = swooshBuffer.getChannelData(0);
    for (let i = 0; i < swooshData.length; i++) {
      swooshData[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const swooshSource = ctx.createBufferSource();
    const swooshFilter = ctx.createBiquadFilter();
    const swooshGain = ctx.createGain();
    swooshSource.buffer = swooshBuffer;
    swooshFilter.type = 'bandpass';
    swooshFilter.Q.value = 2;
    swooshFilter.frequency.setValueAtTime(200, now);
    swooshFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.8);
    swooshFilter.frequency.exponentialRampToValueAtTime(800, now + 1.2);
    swooshGain.gain.setValueAtTime(0, now);
    swooshGain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    swooshSource.connect(swooshFilter);
    swooshFilter.connect(swooshGain);
    swooshGain.connect(destination);
    swooshSource.start(now);

    // 3. Impact hit at peak (0.8s)
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'sine';
    impactOsc.frequency.setValueAtTime(120 * iosMultiplier, now + 0.8);
    impactOsc.frequency.exponentialRampToValueAtTime(50 * iosMultiplier, now + 1.1);
    impactGain.gain.setValueAtTime(0.6 * iosMultiplier, now + 0.8);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    impactOsc.connect(impactGain);
    impactGain.connect(destination);
    impactOsc.start(now + 0.8);
    impactOsc.stop(now + 1.3);

    // 4. Ethereal shimmer tail (multiple detuned oscillators)
    const shimmerFreqs = [800, 1000, 1200, 1500, 2000, 2400];
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.85);
      osc.frequency.setValueAtTime(freq * 1.2, now + 1.5);
      gain.gain.setValueAtTime(0, now + 0.85);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.95 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now + 0.85 + i * 0.02);
      osc.stop(now + 2.5);
    });

    // 5. High sparkle accent
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(3000, now + 0.9);
    sparkleOsc.frequency.exponentialRampToValueAtTime(4500, now + 1.2);
    sparkleOsc.frequency.exponentialRampToValueAtTime(2000, now + 2);
    sparkleGain.gain.setValueAtTime(0, now + 0.9);
    sparkleGain.gain.linearRampToValueAtTime(0.1, now + 1);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(destination);
    sparkleOsc.start(now + 0.9);
    sparkleOsc.stop(now + 2.2);
  }, []);

  // Play sound
  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled || !audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const destination = gainNodeRef.current;

    // Resume context if suspended (iOS)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (type) {
      case 'scan':
        createScanSound(ctx, destination);
        break;
      case 'victory':
        createVictorySound(ctx, destination);
        break;
      case 'shimmer':
        createShimmerSound(ctx, destination);
        break;
      case 'entry':
        createEntrySound(ctx, destination);
        break;
    }
  }, [soundEnabled, createScanSound, createVictorySound, createShimmerSound, createEntrySound]);

  return {
    soundEnabled,
    enableSound,
    playSound,
    isAudioUnlocked,
  };
}

export default useSound;

