// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v7 - Shadow Behaviors Visual Layer
// Renderizza i behavior visivi di Shadow
// v7: Micro-CTA, enhanced whispers

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useShadowBehaviors } from '@/hooks/useShadowBehaviors';

// ============================================================================
// BEHAVIOR STATES
// ============================================================================

interface WhisperState {
  visible: boolean;
  text: string;
}

interface InterruptState {
  visible: boolean;
  text: string;
}

// 🆕 v7: Micro-CTA state
interface MicroCtaState {
  visible: boolean;
  route: string;
  label: string;
}

interface BehaviorStates {
  whisper: WhisperState;
  interrupt: InterruptState;
  crosshair: boolean;
  timelineSkip: boolean;
  breathPattern: boolean;
  breathIntensity: number;
  directiveInjection: boolean;
  directiveText: string;
  // 🆕 v7
  microCta: MicroCtaState;
}

const initialState: BehaviorStates = {
  whisper: { visible: false, text: '' },
  interrupt: { visible: false, text: '' },
  crosshair: false,
  timelineSkip: false,
  breathPattern: false,
  breathIntensity: 0.5,
  directiveInjection: false,
  directiveText: '',
  // 🆕 v7
  microCta: { visible: false, route: '', label: '' },
};

// ============================================================================
// EVENT LISTENER
// ============================================================================

/**
 * ShadowBehaviorsLayer - Componente visuale per tutti i behavior di Shadow
 * 
 * Ascolta eventi custom dal ShadowGlitchEngine e renderizza:
 * - Whisper Mode (micro-overlay bottom-left)
 * - Interrupt (overlay istantaneo)
 * - Crosshair
 * - Timeline Skip
 * - Breath Pattern
 * - Directive Injection
 */
export const ShadowBehaviorsLayer: React.FC = () => {
  const [states, setStates] = useState<BehaviorStates>(initialState);
  const timeoutsRef = useRef<Map<string, number>>(new Map());
  const [, navigate] = useLocation();
  
  // Initialize hook for tracking behaviors
  useShadowBehaviors();

  // 🆕 v7: Micro-CTA handler
  const handleMicroCta = useCallback((e: CustomEvent<{ route: string; label: string }>) => {
    setStates(prev => ({
      ...prev,
      microCta: { visible: true, route: e.detail.route, label: e.detail.label }
    }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({
        ...prev,
        microCta: { visible: false, route: '', label: '' }
      }));
    }, 5000); // 5 second display
    timeoutsRef.current.set('microCta', timeout);
  }, []);

  // 🆕 v7: Handle micro-CTA click
  const handleMicroCtaClick = useCallback(() => {
    const route = states.microCta.route;
    setStates(prev => ({
      ...prev,
      microCta: { visible: false, route: '', label: '' }
    }));
    if (route) {
      navigate(route);
    }
  }, [states.microCta.route, navigate]);

  // =========================================================================
  // Clear all timeouts on unmount
  // =========================================================================
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  // =========================================================================
  // Event Handlers
  // =========================================================================
  const handleWhisper = useCallback((e: CustomEvent<{ text: string }>) => {
    setStates(prev => ({
      ...prev,
      whisper: { visible: true, text: e.detail.text }
    }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({
        ...prev,
        whisper: { visible: false, text: '' }
      }));
    }, 3000);
    timeoutsRef.current.set('whisper', timeout);
  }, []);

  const handleInterrupt = useCallback((e: CustomEvent<{ text: string }>) => {
    setStates(prev => ({
      ...prev,
      interrupt: { visible: true, text: e.detail.text }
    }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({
        ...prev,
        interrupt: { visible: false, text: '' }
      }));
    }, 4000);
    timeoutsRef.current.set('interrupt', timeout);
  }, []);

  const handleCrosshair = useCallback(() => {
    setStates(prev => ({ ...prev, crosshair: true }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({ ...prev, crosshair: false }));
    }, 1500);
    timeoutsRef.current.set('crosshair', timeout);
  }, []);

  const handleTimelineSkip = useCallback(() => {
    setStates(prev => ({ ...prev, timelineSkip: true }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({ ...prev, timelineSkip: false }));
    }, 120);
    timeoutsRef.current.set('timelineSkip', timeout);
  }, []);

  const handleBreathPattern = useCallback((e: CustomEvent<{ intensity: number }>) => {
    setStates(prev => ({
      ...prev,
      breathPattern: true,
      breathIntensity: e.detail.intensity
    }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({ ...prev, breathPattern: false }));
    }, 5000);
    timeoutsRef.current.set('breathPattern', timeout);
  }, []);

  const handleDirectiveInjection = useCallback((e: CustomEvent<{ text: string }>) => {
    setStates(prev => ({
      ...prev,
      directiveInjection: true,
      directiveText: e.detail.text
    }));

    const timeout = window.setTimeout(() => {
      setStates(prev => ({
        ...prev,
        directiveInjection: false,
        directiveText: ''
      }));
    }, 300);
    timeoutsRef.current.set('directiveInjection', timeout);
  }, []);

  // =========================================================================
  // Register event listeners
  // =========================================================================
  useEffect(() => {
    window.addEventListener('shadow:whisper', handleWhisper as EventListener);
    window.addEventListener('shadow:interrupt', handleInterrupt as EventListener);
    window.addEventListener('shadow:crosshair', handleCrosshair);
    window.addEventListener('shadow:timelineSkip', handleTimelineSkip);
    window.addEventListener('shadow:breathPattern', handleBreathPattern as EventListener);
    window.addEventListener('shadow:directiveInjection', handleDirectiveInjection as EventListener);
    // 🆕 v7
    window.addEventListener('shadow:microCta', handleMicroCta as EventListener);

    return () => {
      window.removeEventListener('shadow:whisper', handleWhisper as EventListener);
      window.removeEventListener('shadow:interrupt', handleInterrupt as EventListener);
      window.removeEventListener('shadow:crosshair', handleCrosshair);
      window.removeEventListener('shadow:timelineSkip', handleTimelineSkip);
      window.removeEventListener('shadow:breathPattern', handleBreathPattern as EventListener);
      window.removeEventListener('shadow:directiveInjection', handleDirectiveInjection as EventListener);
      // 🆕 v7
      window.removeEventListener('shadow:microCta', handleMicroCta as EventListener);
    };
  }, [handleWhisper, handleInterrupt, handleCrosshair, handleTimelineSkip, handleBreathPattern, handleDirectiveInjection, handleMicroCta]);

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <>
      {/* WHISPER MODE - Micro overlay bottom left */}
      {states.whisper.visible && (
        <div className="shadow-whisper">
          <span className="shadow-whisper-text">{states.whisper.text}</span>
        </div>
      )}

      {/* INTERRUPT - Full overlay instant */}
      {states.interrupt.visible && (
        <div className="shadow-interrupt" onClick={() => setStates(prev => ({ ...prev, interrupt: { visible: false, text: '' } }))}>
          <div className="shadow-interrupt-content">
            <span className="shadow-interrupt-text">{states.interrupt.text}</span>
            <span className="shadow-interrupt-dismiss">TAP TO DISMISS</span>
          </div>
        </div>
      )}

      {/* CROSSHAIR */}
      {states.crosshair && (
        <div className="shadow-crosshair">
          <div className="shadow-crosshair-v" />
          <div className="shadow-crosshair-h" />
          <div className="shadow-crosshair-center" />
        </div>
      )}

      {/* TIMELINE SKIP - Black flash */}
      {states.timelineSkip && (
        <div className="shadow-timeline-skip" />
      )}

      {/* BREATH PATTERN - Pulsing vignette */}
      {states.breathPattern && (
        <div 
          className="shadow-breath-pattern"
          style={{
            '--breath-intensity': states.breathIntensity
          } as React.CSSProperties}
        />
      )}

      {/* DIRECTIVE INJECTION - Floating text */}
      {states.directiveInjection && (
        <div className="shadow-directive-injection">
          <span className="shadow-directive-text">{states.directiveText}</span>
        </div>
      )}

      {/* 🆕 v7: MICRO CTA - Non-blocking action button */}
      {states.microCta.visible && (
        <div className="shadow-micro-cta" onClick={handleMicroCtaClick}>
          <span className="shadow-micro-cta-label">{states.microCta.label}</span>
          <span className="shadow-micro-cta-arrow">→</span>
        </div>
      )}
    </>
  );
};

export default ShadowBehaviorsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

