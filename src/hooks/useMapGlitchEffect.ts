// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Map Glitch Effect Hook
// Orchestrates map distortions + contextual SHADOW messages

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ShadowGlitchEngine } from '@/engine/shadowGlitchEngine';
import { 
  useEntityOverlayStore, 
  SHADOW_DEBUG,
  selectShadowThreatLevel,
} from '@/stores/entityOverlayStore';
import { 
  getThreatLevelCategory,
  SHADOW_GLITCH_TIMING,
} from '@/config/shadowProtocolConfig';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAP_GLITCH_GUARDRAILS = {
  MIN_INTERVAL_MS: 18_000,           // 🔧 v7.1: Reduced from 45s to 18s for PRODUCTION visibility
  MAX_INTERVAL_MS: 55_000,           // 🔧 v7.1: Reduced from 120s to 55s for PRODUCTION visibility
  MESSAGE_AFTER_GLITCH_CHANCE: 0.25, // 🔧 v7.2: Increased to 25% chance to show message after glitch
  MICRO_CTA_CHANCE: 0.15,            // 15% chance to show micro CTA (1 in ~7)
  GLITCH_DURING_BUZZ_COOLDOWN_MS: 5000, // No glitch for 5s after BUZZ action
  WELCOME_GLITCH_DELAY_MS: 6_000,    // 🆕 v7.1: Welcome glitch after 6s on map mount
  HEAVY_INTERFERENCE_CHANCE: 0.12,   // 🆕 v7.2: 12% chance for heavy blackout interference
  HEAVY_INTERFERENCE_COOLDOWN_MS: 90_000, // 🆕 v7.2: At least 90s between heavy interferences
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useMapGlitchEffect - Orchestrates map glitch effects with SHADOW messages
 * 
 * Features:
 * - Periodic map distortions based on threat level
 * - Post-glitch SHADOW message (20% chance)
 * - Micro CTA after some glitches (15% chance)
 * - Respects BUZZ action cooldowns
 * - Guardrails: max 1 glitch per 45-120s
 */
export function useMapGlitchEffect() {
  const [location] = useLocation();
  const threatLevel = useEntityOverlayStore(selectShadowThreatLevel);
  const isOverlayVisible = useEntityOverlayStore((s) => s.isVisible);
  
  const intervalRef = useRef<number | null>(null);
  const lastGlitchTimeRef = useRef<number>(0);
  const lastBuzzTimeRef = useRef<number>(0);
  const lastHeavyInterferenceRef = useRef<number>(0); // 🆕 v7.2: Track heavy interference
  const mountedRef = useRef(true);
  const glitchCountRef = useRef<number>(0);
  const welcomeGlitchFiredRef = useRef<boolean>(false); // 🆕 v7.1: Track welcome glitch

  // Only active on map page
  const isMapPage = location === '/map-3d-tiler';

  // Calculate interval based on threat level
  const getGlitchInterval = useCallback(() => {
    const threatCategory = getThreatLevelCategory(threatLevel);
    const { MIN_INTERVAL_MS, MAX_INTERVAL_MS } = MAP_GLITCH_GUARDRAILS;
    
    // Threat level modulates frequency
    const multiplier = SHADOW_GLITCH_TIMING.THREAT_GLITCH_MULTIPLIER[threatCategory];
    const baseInterval = (MIN_INTERVAL_MS + MAX_INTERVAL_MS) / 2;
    
    // Add randomness (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    return Math.round(baseInterval * multiplier * randomFactor);
  }, [threatLevel]);

  // Trigger map glitch sequence
  const triggerMapGlitchSequence = useCallback(async () => {
    if (!mountedRef.current) return;
    if (!isMapPage) return;
    if (isOverlayVisible) return; // Don't glitch during overlay
    
    const now = Date.now();
    
    // Check buzz cooldown
    if (now - lastBuzzTimeRef.current < MAP_GLITCH_GUARDRAILS.GLITCH_DURING_BUZZ_COOLDOWN_MS) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] 🗺️ Map glitch skipped: BUZZ cooldown active');
      }
      return;
    }
    
    // Check minimum interval
    if (now - lastGlitchTimeRef.current < MAP_GLITCH_GUARDRAILS.MIN_INTERVAL_MS) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] 🗺️ Map glitch skipped: too soon since last glitch');
      }
      return;
    }

    lastGlitchTimeRef.current = now;
    glitchCountRef.current++;

    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 🗺️ Map glitch sequence #${glitchCountRef.current} started`);
    }

    // 🆕 v7.2: Check if we should trigger heavy interference (dramatic blackout)
    const timeSinceHeavy = now - lastHeavyInterferenceRef.current;
    const canDoHeavy = timeSinceHeavy >= MAP_GLITCH_GUARDRAILS.HEAVY_INTERFERENCE_COOLDOWN_MS;
    const shouldDoHeavy = canDoHeavy && 
      Math.random() < MAP_GLITCH_GUARDRAILS.HEAVY_INTERFERENCE_CHANCE;
    
    if (shouldDoHeavy) {
      // Heavy interference: full blackout + auto SHADOW message
      lastHeavyInterferenceRef.current = now;
      
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7.2] 🌑 HEAVY MAP INTERFERENCE TRIGGERED');
      }
      
      ShadowGlitchEngine.triggerHeavyMapInterference(
        1500 + Math.random() * 1500, // 1.5-3s blackout
        true // auto message
      );
      return; // Skip normal glitch flow
    }

    // Normal glitch flow
    // Step 1: Trigger map distortion (200-600ms)
    ShadowGlitchEngine.triggerMapDistortion('#ml-sandbox');
    
    // Step 2: After glitch, maybe show SHADOW message
    const shouldShowMessage = Math.random() < MAP_GLITCH_GUARDRAILS.MESSAGE_AFTER_GLITCH_CHANCE;
    
    if (shouldShowMessage) {
      // Wait for glitch to complete, then request message
      setTimeout(() => {
        if (!mountedRef.current) return;
        
        if (SHADOW_DEBUG) {
          console.log('[SHADOW v7] 🗺️ Requesting post-glitch SHADOW message');
        }
        
        ShadowGlitchEngine.triggerPostGlitchMessage('map');
      }, 600); // After glitch animation
    }
    
    // Step 3: Maybe show micro CTA (only if no message, every ~7 glitches)
    const shouldShowMicroCta = !shouldShowMessage && 
      Math.random() < MAP_GLITCH_GUARDRAILS.MICRO_CTA_CHANCE;
    
    if (shouldShowMicroCta) {
      setTimeout(() => {
        if (!mountedRef.current) return;
        
        // Pick a relevant CTA
        const ctas = [
          { route: '/intelligence', label: 'CHECK INTEL' },
          { route: '/leaderboard', label: 'VIEW RANKS' },
        ];
        const cta = ctas[Math.floor(Math.random() * ctas.length)];
        
        if (SHADOW_DEBUG) {
          console.log(`[SHADOW v7] 🗺️ Showing micro CTA: ${cta.label}`);
        }
        
        ShadowGlitchEngine.triggerMicroCta(cta.route, cta.label);
      }, 800);
    }
  }, [isMapPage, isOverlayVisible]);

  // Listen for BUZZ events to set cooldown
  useEffect(() => {
    const handleBuzz = () => {
      lastBuzzTimeRef.current = Date.now();
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] 🗺️ BUZZ detected - glitch cooldown activated');
      }
    };

    window.addEventListener('buzzCompleted', handleBuzz);
    window.addEventListener('buzzAreaCreated', handleBuzz);
    
    return () => {
      window.removeEventListener('buzzCompleted', handleBuzz);
      window.removeEventListener('buzzAreaCreated', handleBuzz);
    };
  }, []);

  // Main effect: periodic map glitches
  useEffect(() => {
    mountedRef.current = true;

    if (!isMapPage) {
      // Clear interval when leaving map
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset welcome glitch flag when leaving map
      welcomeGlitchFiredRef.current = false;
      return;
    }

    // Check prefers-reduced-motion (respects SHADOW_IGNORE_REDUCED_MOTION in DEV)
    const shouldRespectReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !import.meta.env.DEV; // 🆕 v7.1: DEV bypass for testing
    
    if (shouldRespectReducedMotion) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v7] 🗺️ Map glitches disabled: reduced motion preference (PROD)');
      }
      return;
    }

    const interval = getGlitchInterval();
    
    if (SHADOW_DEBUG) {
      console.log(`[SHADOW v7] 🗺️ Map glitch scheduler started: interval=${Math.round(interval/1000)}s, threat=${threatLevel}`);
    }

    // 🆕 v7.1: WELCOME GLITCH - One-time glitch on first map mount
    if (!welcomeGlitchFiredRef.current) {
      const welcomeDelay = MAP_GLITCH_GUARDRAILS.WELCOME_GLITCH_DELAY_MS + Math.random() * 2000; // 6-8s
      
      if (SHADOW_DEBUG) {
        console.log(`[SHADOW v7] 🗺️ Welcome glitch scheduled in ${Math.round(welcomeDelay/1000)}s`);
      }
      
      const welcomeTimeout = window.setTimeout(() => {
        if (!mountedRef.current || !isMapPage) return;
        
        // Check BUZZ cooldown before welcome glitch
        const now = Date.now();
        if (now - lastBuzzTimeRef.current < MAP_GLITCH_GUARDRAILS.GLITCH_DURING_BUZZ_COOLDOWN_MS) {
          if (SHADOW_DEBUG) {
            console.log('[SHADOW v7] 🗺️ Welcome glitch skipped: BUZZ cooldown');
          }
          return;
        }
        
        welcomeGlitchFiredRef.current = true;
        lastGlitchTimeRef.current = now;
        
        if (SHADOW_DEBUG) {
          console.log('[SHADOW v7] 🗺️ Welcome glitch triggered!');
        }
        
        // Light map jammer + camera shake
        ShadowGlitchEngine.triggerMapJammer(2);
        setTimeout(() => {
          if (mountedRef.current) {
            ShadowGlitchEngine.triggerWhisper('Your position is logged.');
          }
        }, 800);
      }, welcomeDelay);
      
      // Cleanup welcome timeout
      return () => {
        window.clearTimeout(welcomeTimeout);
      };
    }

    // Schedule periodic glitches
    intervalRef.current = window.setInterval(() => {
      triggerMapGlitchSequence();
    }, interval);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMapPage, getGlitchInterval, triggerMapGlitchSequence, threatLevel]);

  // Return functions for manual triggering if needed
  return {
    triggerMapGlitch: triggerMapGlitchSequence,
    glitchCount: glitchCountRef.current,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
