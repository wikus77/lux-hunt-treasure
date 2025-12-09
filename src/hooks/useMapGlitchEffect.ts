// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v6 - Map Glitch Effect Hook
// Gestisce effetti glitch periodici sulla mappa
// v6: Integrazione con ShadowGlitchEngine, più effetti, messaggi post-glitch

import { useEffect, useRef, useCallback } from 'react';
import { 
  SHADOW_MAP_GLITCH_ENABLED,
  SHADOW_GLITCH_TIMING,
  getThreatLevelCategory,
  SHADOW_MESSAGE_TEMPLATES,
} from '@/config/shadowProtocolConfig';
import { 
  useEntityOverlayStore, 
  SHADOW_DEBUG,
  selectShadowThreatLevel,
  selectIsMapGlitchActive,
} from '@/stores/entityOverlayStore';
import { ShadowGlitchEngine } from '@/engine/shadowGlitchEngine';

/**
 * useMapGlitchEffect - Hook per gestire glitch periodici sulla mappa
 * 
 * Comportamento:
 * - Attiva glitch random ogni X minuti (configurabile)
 * - Frequenza e intensità basate su threat level
 * - Rispetta prefers-reduced-motion
 * - Non blocca interazioni (zoom/pan/tasto BUZZ MAP)
 * 
 * @param containerRef - Ref al container della mappa per applicare classi CSS
 * @returns { isGlitching, triggerGlitch } - Stato e trigger manuale
 */
export function useMapGlitchEffect(containerRef: React.RefObject<HTMLElement>) {
  const timerRef = useRef<number | null>(null);
  const glitchTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const prefersReducedMotion = useRef(false);

  // Store state
  const threatLevel = useEntityOverlayStore(selectShadowThreatLevel);
  const isMapGlitchActive = useEntityOverlayStore(selectIsMapGlitchActive);
  const triggerMapGlitch = useEntityOverlayStore((s) => s.triggerMapGlitch);
  const endMapGlitch = useEntityOverlayStore((s) => s.endMapGlitch);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculate next glitch delay based on threat level
  const calculateNextDelay = useCallback(() => {
    const { MAP_GLITCH_MIN_INTERVAL_MS, MAP_GLITCH_MAX_INTERVAL_MS, THREAT_GLITCH_MULTIPLIER } = SHADOW_GLITCH_TIMING;
    const category = getThreatLevelCategory(threatLevel);
    const multiplier = THREAT_GLITCH_MULTIPLIER[category];
    
    const baseDelay = MAP_GLITCH_MIN_INTERVAL_MS + 
      Math.random() * (MAP_GLITCH_MAX_INTERVAL_MS - MAP_GLITCH_MIN_INTERVAL_MS);
    
    return Math.round(baseDelay * multiplier);
  }, [threatLevel]);

  // Execute glitch effect (v6: enhanced with ShadowGlitchEngine)
  const executeGlitch = useCallback(() => {
    if (!mountedRef.current) return;
    if (prefersReducedMotion.current) return;
    if (!SHADOW_MAP_GLITCH_ENABLED) return;

    // Get intensity based on threat level
    const category = getThreatLevelCategory(threatLevel);
    const intensity = SHADOW_GLITCH_TIMING.THREAT_GLITCH_INTENSITY[category];

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v6] 🗺️ Map glitch executing, intensity:', intensity, 'threat:', category);
    }

    // Apply glitch class to container
    if (containerRef.current) {
      containerRef.current.classList.add('shadow-map-glitch-active');
      containerRef.current.style.setProperty('--map-glitch-intensity', String(intensity));
    }

    // Trigger store state
    triggerMapGlitch();

    // 🆕 v6: Use ShadowGlitchEngine for enhanced effects
    if (intensity >= 0.6) {
      ShadowGlitchEngine.triggerMapDistortion('#ml-sandbox');
    }

    // 🆕 v6: Increase heat meter
    ShadowGlitchEngine.increaseHeat(5);

    // End glitch after duration
    glitchTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.remove('shadow-map-glitch-active');
        containerRef.current.style.removeProperty('--map-glitch-intensity');
      }
      endMapGlitch();

      // 🆕 v7: After high-intensity glitch, trigger contextual message via engine
      if (intensity >= 0.6 && Math.random() < 0.4) {
        // Use v4 template system for contextual message
        ShadowGlitchEngine.triggerPostGlitchMessage('map');
        
        // Also show whisper for immediate feedback
        if (intensity >= 0.8) {
          const whispers = [
            'Your map is not yours.',
            'We see what you see.',
            'The terrain shifts.',
            'Coordinates logged.',
          ];
          ShadowGlitchEngine.triggerWhisper(whispers[Math.floor(Math.random() * whispers.length)]);
        }
      }

      // 🆕 v7: Occasionally show micro-CTA to Intelligence
      if (intensity >= 0.5 && Math.random() < 0.15) {
        setTimeout(() => {
          ShadowGlitchEngine.triggerMicroCta('/intelligence', 'CHECK INTEL');
        }, 1500);
      }
    }, SHADOW_GLITCH_TIMING.MAP_GLITCH_DURATION_MS);
  }, [containerRef, threatLevel, triggerMapGlitch, endMapGlitch]);

  // Schedule next glitch
  const scheduleNextGlitch = useCallback(() => {
    if (!mountedRef.current) return;
    if (!SHADOW_MAP_GLITCH_ENABLED) return;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    const delay = calculateNextDelay();
    
    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] 🗺️ Next map glitch in', Math.round(delay / 1000), 'seconds');
    }

    timerRef.current = window.setTimeout(() => {
      executeGlitch();
      scheduleNextGlitch();
    }, delay);
  }, [calculateNextDelay, executeGlitch]);

  // Start glitch timer on mount
  useEffect(() => {
    mountedRef.current = true;

    if (!SHADOW_MAP_GLITCH_ENABLED) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v5] 🗺️ Map glitch disabled by config');
      }
      return;
    }

    // Start scheduling after initial delay
    const initialDelay = SHADOW_GLITCH_TIMING.MAP_GLITCH_MIN_INTERVAL_MS / 2;
    timerRef.current = window.setTimeout(() => {
      scheduleNextGlitch();
    }, initialDelay);

    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (glitchTimeoutRef.current !== null) {
        window.clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
    };
  }, [scheduleNextGlitch]);

  // Manual trigger function
  const triggerGlitch = useCallback(() => {
    if (prefersReducedMotion.current) return;
    executeGlitch();
  }, [executeGlitch]);

  return {
    isGlitching: isMapGlitchActive,
    triggerGlitch,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

