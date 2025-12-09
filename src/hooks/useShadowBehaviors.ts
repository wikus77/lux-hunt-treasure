// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Shadow Behaviors Hook
// Gestisce i behavior avanzati di Shadow basati su interazione e tempo
// v7: Enhanced ambient effects, threat-based modulation, unified context triggers

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ShadowGlitchEngine } from '@/engine/shadowGlitchEngine';
import { 
  useEntityOverlayStore, 
  SHADOW_DEBUG,
  selectShadowThreatLevel,
} from '@/stores/entityOverlayStore';
import { getThreatLevelCategory } from '@/config/shadowProtocolConfig';
import { useMapGlitchEffect } from './useMapGlitchEffect';

// ============================================================================
// BEHAVIOR TRACKING
// ============================================================================

interface BehaviorState {
  mapOpenCount: number;
  leaderboardOpenCount: number;
  buzzCount: number;
  lastMapOpen: number;
  lastLeaderboardOpen: number;
  lastBuzz: number;
  lastRandomBehavior: number;
}

const behaviorState: BehaviorState = {
  mapOpenCount: 0,
  leaderboardOpenCount: 0,
  buzzCount: 0,
  lastMapOpen: 0,
  lastLeaderboardOpen: 0,
  lastBuzz: 0,
  lastRandomBehavior: 0,
};

// ============================================================================
// SPAM DETECTION THRESHOLDS
// ============================================================================

const SPAM_THRESHOLDS = {
  MAP_SPAM_WINDOW_MS: 60_000,      // 1 minute
  MAP_SPAM_COUNT: 5,               // 5 opens in 1 minute = spam
  LEADERBOARD_SPAM_WINDOW_MS: 120_000, // 2 minutes
  LEADERBOARD_SPAM_COUNT: 8,       // 8 opens in 2 minutes = spam
  BUZZ_SPAM_WINDOW_MS: 60_000,     // 1 minute
  BUZZ_SPAM_COUNT: 6,              // 6 buzzes in 1 minute = spam
  RANDOM_BEHAVIOR_COOLDOWN_MS: 30_000, // 30 seconds between random behaviors
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useShadowBehaviors - Hook per gestire i behavior avanzati di Shadow
 * 
 * Comportamenti:
 * - Rileva spam behavior (map, leaderboard, buzz)
 * - Triggera interrupt per spam
 * - Triggera behavior random basati su heat level
 * - Gestisce whisper contestuali
 */
export function useShadowBehaviors() {
  const [location] = useLocation();
  const threatLevel = useEntityOverlayStore(selectShadowThreatLevel);
  const threatCategory = getThreatLevelCategory(threatLevel);
  
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // =========================================================================
  // Track page changes for spam detection
  // =========================================================================
  useEffect(() => {
    const now = Date.now();

    if (location === '/map-3d-tiler') {
      // Check for map spam
      if (now - behaviorState.lastMapOpen < SPAM_THRESHOLDS.MAP_SPAM_WINDOW_MS) {
        behaviorState.mapOpenCount++;
      } else {
        behaviorState.mapOpenCount = 1;
      }
      behaviorState.lastMapOpen = now;

      if (behaviorState.mapOpenCount >= SPAM_THRESHOLDS.MAP_SPAM_COUNT) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW BEHAVIORS] 🚨 Map spam detected!');
        }
        ShadowGlitchEngine.triggerInterrupt('Stop scanning. We already scanned you.');
        ShadowGlitchEngine.increaseHeat(20);
        behaviorState.mapOpenCount = 0;
      }
    }

    if (location === '/leaderboard') {
      // Check for leaderboard spam
      if (now - behaviorState.lastLeaderboardOpen < SPAM_THRESHOLDS.LEADERBOARD_SPAM_WINDOW_MS) {
        behaviorState.leaderboardOpenCount++;
      } else {
        behaviorState.leaderboardOpenCount = 1;
      }
      behaviorState.lastLeaderboardOpen = now;

      if (behaviorState.leaderboardOpenCount >= SPAM_THRESHOLDS.LEADERBOARD_SPAM_COUNT) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW BEHAVIORS] 🚨 Leaderboard spam detected!');
        }
        ShadowGlitchEngine.triggerInterrupt('Ambition makes you visible, Echo.');
        ShadowGlitchEngine.increaseHeat(15);
        behaviorState.leaderboardOpenCount = 0;
      }
    }
  }, [location]);

  // =========================================================================
  // Track BUZZ events for spam detection
  // =========================================================================
  useEffect(() => {
    const handleBuzzCompleted = () => {
      const now = Date.now();
      
      if (now - behaviorState.lastBuzz < SPAM_THRESHOLDS.BUZZ_SPAM_WINDOW_MS) {
        behaviorState.buzzCount++;
      } else {
        behaviorState.buzzCount = 1;
      }
      behaviorState.lastBuzz = now;

      if (behaviorState.buzzCount >= SPAM_THRESHOLDS.BUZZ_SPAM_COUNT) {
        if (SHADOW_DEBUG) {
          console.log('[SHADOW BEHAVIORS] 🚨 BUZZ spam detected!');
        }
        ShadowGlitchEngine.triggerInterrupt('So eager to expose yourself...');
        ShadowGlitchEngine.increaseHeat(25);
        behaviorState.buzzCount = 0;
      }
    };

    window.addEventListener('buzzCompleted', handleBuzzCompleted);
    return () => window.removeEventListener('buzzCompleted', handleBuzzCompleted);
  }, []);

  // =========================================================================
  // Random behavior triggers based on heat level
  // =========================================================================
  useEffect(() => {
    mountedRef.current = true;

    // Check every 15 seconds for random behavior opportunity
    intervalRef.current = window.setInterval(() => {
      if (!mountedRef.current) return;

      const now = Date.now();
      const heat = ShadowGlitchEngine.getHeatLevel();

      // Cooldown check
      if (now - behaviorState.lastRandomBehavior < SPAM_THRESHOLDS.RANDOM_BEHAVIOR_COOLDOWN_MS) {
        return;
      }

      // Probability based on heat
      const probability = heat / 200; // 50% max at heat 100
      if (Math.random() < probability) {
        ShadowGlitchEngine.triggerRandomBehavior();
        behaviorState.lastRandomBehavior = now;
      }
    }, 15_000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // 🆕 v7: Enhanced threat-based ambient effects
  // =========================================================================
  useEffect(() => {
    const ambientIntervalRef: { current: number | null } = { current: null };

    // Calculate interval based on threat (more frequent at high threat)
    const getAmbientInterval = () => {
      switch (threatCategory) {
        case 'HIGH': return 30_000;   // Every 30s
        case 'MEDIUM': return 60_000; // Every 60s
        case 'LOW': return 120_000;   // Every 2min
      }
    };

    // Calculate probability based on threat
    const getAmbientProbability = () => {
      switch (threatCategory) {
        case 'HIGH': return 0.5;   // 50% chance
        case 'MEDIUM': return 0.25; // 25% chance
        case 'LOW': return 0.1;    // 10% chance
      }
    };

    const interval = getAmbientInterval();
    const probability = getAmbientProbability();

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 🌫️ Ambient effects: interval=${interval}ms, probability=${probability}, threat=${threatCategory}`);
    }

    ambientIntervalRef.current = window.setInterval(() => {
      if (Math.random() >= probability) return;

      // Pick a random ambient effect based on threat
      const effects: (() => void)[] = [];

      // LOW: Only subtle whispers
      effects.push(() => {
        const whispers = ['...', 'watching...', 'echo...'];
        ShadowGlitchEngine.triggerWhisper(whispers[Math.floor(Math.random() * whispers.length)]);
      });

      // MEDIUM: Add breath pattern and crosshair
      if (threatCategory === 'MEDIUM' || threatCategory === 'HIGH') {
        effects.push(() => ShadowGlitchEngine.triggerBreathPattern(0.5));
        effects.push(() => ShadowGlitchEngine.triggerCrosshair());
      }

      // HIGH: Add timeline skip and page glitch
      if (threatCategory === 'HIGH') {
        effects.push(() => ShadowGlitchEngine.triggerBreathPattern(1));
        effects.push(() => ShadowGlitchEngine.triggerTimelineSkip());
        effects.push(() => ShadowGlitchEngine.triggerRandomPageGlitch(0.4));
      }

      // Pick random effect
      const effect = effects[Math.floor(Math.random() * effects.length)];
      effect();

    }, interval);

    return () => {
      if (ambientIntervalRef.current !== null) {
        window.clearInterval(ambientIntervalRef.current);
        ambientIntervalRef.current = null;
      }
    };
  }, [threatCategory]);

  // =========================================================================
  // 🆕 v7: Map Glitch Effect Integration
  // =========================================================================
  const { triggerMapGlitch, glitchCount } = useMapGlitchEffect();

  // =========================================================================
  // 🆕 v7: Context-aware behavior triggers
  // Unified reactions when contexts are notified
  // =========================================================================
  useEffect(() => {
    const handleContextTrigger = (e: CustomEvent<{ context: string }>) => {
      const context = e.detail?.context;
      
      if (SHADOW_DEBUG) {
        console.log(`[SHADOW v7] 🎯 Context trigger received: ${context}`);
      }

      // Add context-specific v6 behaviors on top of v4 narrative
      switch (context) {
        case 'buzz':
          // BUZZ: Quick crosshair + whisper at high threat
          if (threatCategory === 'HIGH') {
            setTimeout(() => ShadowGlitchEngine.triggerCrosshair(), 200);
          }
          break;
          
        case 'map':
          // Map: Trigger map jammer at medium+ threat
          if (threatCategory !== 'LOW') {
            setTimeout(() => ShadowGlitchEngine.triggerMapJammer(1), 300);
          }
          break;
          
        case 'reward':
          // Reward: Whisper at any threat, breath pattern at high
          setTimeout(() => {
            ShadowGlitchEngine.triggerWhisper('Noted.');
          }, 500);
          if (threatCategory === 'HIGH') {
            setTimeout(() => ShadowGlitchEngine.triggerBreathPattern(0.8), 1000);
          }
          break;
          
        case 'leaderboard':
          // Leaderboard: Crosshair + whisper at high threat
          if (threatCategory === 'HIGH') {
            setTimeout(() => ShadowGlitchEngine.triggerCrosshair(), 300);
            setTimeout(() => {
              ShadowGlitchEngine.triggerWhisper('Ambition is visible.');
            }, 800);
          }
          break;
      }
    };

    // Listen for context triggers from notifyShadowContext
    window.addEventListener('shadow:contextTrigger', handleContextTrigger as EventListener);
    
    return () => {
      window.removeEventListener('shadow:contextTrigger', handleContextTrigger as EventListener);
    };
  }, [threatCategory]);

  // =========================================================================
  // Exposed functions for manual triggering
  // =========================================================================
  const triggerWhisper = useCallback((message: string) => {
    ShadowGlitchEngine.triggerWhisper(message);
  }, []);

  const triggerCrosshair = useCallback(() => {
    ShadowGlitchEngine.triggerCrosshair();
  }, []);

  const triggerTimelineSkip = useCallback(() => {
    ShadowGlitchEngine.triggerTimelineSkip();
  }, []);

  return {
    triggerWhisper,
    triggerCrosshair,
    triggerTimelineSkip,
    triggerMapGlitch,
    glitchCount,
    getHeatLevel: ShadowGlitchEngine.getHeatLevel,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

