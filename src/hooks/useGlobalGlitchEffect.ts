// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v5 - Global Glitch Effect Hook
// Gestisce effetti glitch globali sulla pagina quando appare un overlay SHADOW

import { useEffect, useRef } from 'react';
import { 
  SHADOW_VISUAL_GLITCH_ENABLED,
  SHADOW_GLITCH_TIMING,
} from '@/config/shadowProtocolConfig';
import { 
  useEntityOverlayStore, 
  SHADOW_DEBUG,
  selectCurrentEvent,
  selectIsGlobalGlitchActive,
  selectGlobalGlitchIntensity,
} from '@/stores/entityOverlayStore';

/**
 * useGlobalGlitchEffect - Hook per gestire glitch globali sulla pagina
 * 
 * Comportamento:
 * - Quando appare un overlay SHADOW intensity 2-3, applica glitch al root
 * - Durata breve (200-500ms)
 * - Non blocca input
 * - Rispetta prefers-reduced-motion
 */
export function useGlobalGlitchEffect() {
  const glitchTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  // Store state
  const currentEvent = useEntityOverlayStore(selectCurrentEvent);
  const isGlobalGlitchActive = useEntityOverlayStore(selectIsGlobalGlitchActive);
  const globalGlitchIntensity = useEntityOverlayStore(selectGlobalGlitchIntensity);
  const triggerGlobalGlitch = useEntityOverlayStore((s) => s.triggerGlobalGlitch);
  const endGlobalGlitch = useEntityOverlayStore((s) => s.endGlobalGlitch);

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

  // Apply/remove glitch class to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    if (isGlobalGlitchActive && !prefersReducedMotion.current) {
      root.classList.add('shadow-global-glitch-active');
      root.style.setProperty('--global-glitch-intensity', String(globalGlitchIntensity));
    } else {
      root.classList.remove('shadow-global-glitch-active');
      root.style.removeProperty('--global-glitch-intensity');
    }
  }, [isGlobalGlitchActive, globalGlitchIntensity]);

  // Trigger glitch when SHADOW event of intensity 2-3 appears
  useEffect(() => {
    if (!SHADOW_VISUAL_GLITCH_ENABLED) return;
    if (prefersReducedMotion.current) return;
    if (!currentEvent) return;
    
    // Only trigger for SHADOW entity with intensity >= 2
    if (currentEvent.entity !== 'SHADOW' || currentEvent.intensity < 2) return;

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v5] ⚡ SHADOW event detected, triggering global glitch');
    }

    // Calculate intensity based on event intensity
    const intensity = currentEvent.intensity === 3 ? 1.0 : 0.6;
    triggerGlobalGlitch(intensity);

    // Auto-end glitch after duration
    glitchTimeoutRef.current = window.setTimeout(() => {
      endGlobalGlitch();
    }, SHADOW_GLITCH_TIMING.GLOBAL_GLITCH_DURATION_MS);

    return () => {
      if (glitchTimeoutRef.current !== null) {
        window.clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
    };
  }, [currentEvent, triggerGlobalGlitch, endGlobalGlitch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (glitchTimeoutRef.current !== null) {
        window.clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
      // Ensure class is removed
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('shadow-global-glitch-active');
        document.documentElement.style.removeProperty('--global-glitch-intensity');
      }
    };
  }, []);

  return {
    isGlitching: isGlobalGlitchActive,
    intensity: globalGlitchIntensity,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


