// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v8 - Entity Overlay Component
// Fullscreen overlay per eventi MCP / SHADOW / ECHO
// Include frammenti di volto glitchato per SHADOW entity
// v3: Force repaint per iOS Safari
// v5: Interactive CTA buttons + Global glitch effects
// v8: Cinematic entity visuals with per-entity animations

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { useEntityOverlayStore, SHADOW_DEBUG, type EntityEvolutionLevel } from '@/stores/entityOverlayStore';
import { EntityMessage } from './EntityMessage';
import { SHADOW_PROTOCOL_TIMING, type ShadowEntity, getEvolutionModifiedText } from '@/config/shadowProtocolConfig';
import { useGlobalGlitchEffect } from '@/hooks/useGlobalGlitchEffect';
import { ShadowGlitchEngine } from '@/engine/shadowGlitchEngine';
import '@/styles/effects/shadow-protocol.css';

/**
 * EntityOverlay - Overlay fullscreen per Shadow Protocol v8
 * 
 * Comportamento:
 * - Se !isVisible || !currentEvent → null
 * - Fullscreen con glitch effects
 * - Stile diverso per MCP / SHADOW / ECHO
 * - SHADOW include frammenti di volto glitchato
 * - Tap o ACKNOWLEDGE chiude (se non blocking o dopo MIN_DISPLAY_MS)
 * - Rispetta prefers-reduced-motion
 * - v3: Force repaint per iOS Safari
 * - v8: Cinematic entity visuals with evolution-based modifiers
 */
export const EntityOverlay: React.FC = () => {
  const { 
    currentEvent, 
    isVisible, 
    hideOverlay, 
    canNavigateCta, 
    recordCtaNavigation,
    entityEvolution,
    recordFastDismiss,
  } = useEntityOverlayStore();
  const [, navigate] = useLocation();
  const [canDismiss, setCanDismiss] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayShownAtRef = useRef<number>(0); // 🆕 v8: Track when overlay was shown
  
  // 🔧 v9: Portal container for guaranteed fullscreen (escapes transform stacking contexts)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // 🔧 v9: Initialize portal container on mount (SSR safe)
  useEffect(() => {
    if (typeof window !== 'undefined' && document?.body) {
      setPortalContainer(document.body);
    }
  }, []);

  // 🆕 v5: Global glitch effect hook
  useGlobalGlitchEffect();

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 🆕 v3: Force repaint per iOS Safari (evita glitch di rendering)
  useEffect(() => {
    if (currentEvent && overlayRef.current) {
      // Forza reflow/repaint
      setTimeout(() => {
        if (overlayRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          overlayRef.current.offsetHeight;
        }
      }, 50);
      
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v3] 🌑 Force repaint triggered for event:', currentEvent.id);
      }
    }
  }, [currentEvent]);

  // 🆕 v6: Pre-glitch effects before SHADOW messages
  useEffect(() => {
    if (!currentEvent) return;
    if (prefersReducedMotion) return;
    
    // Trigger pre-glitch for SHADOW intensity >= 2
    if (currentEvent.entity === 'SHADOW' && currentEvent.intensity >= 2) {
      if (currentEvent.intensity === 3) {
        // Full takeover sequence for intensity 3
        ShadowGlitchEngine.triggerShadowTakeover();
      } else {
        // Random page glitch for intensity 2
        ShadowGlitchEngine.triggerRandomPageGlitch(0.7);
      }
    }
  }, [currentEvent, prefersReducedMotion]);

  // Timer per abilitare dismiss dopo MIN_DISPLAY_MS
  useEffect(() => {
    if (!isVisible || !currentEvent) {
      setCanDismiss(false);
      setTypingComplete(false);
      return;
    }

    setCanDismiss(false);
    setTypingComplete(false);
    overlayShownAtRef.current = Date.now(); // 🆕 v8: Record when shown

    const timer = setTimeout(() => {
      setCanDismiss(true);
    }, SHADOW_PROTOCOL_TIMING.MIN_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isVisible, currentEvent]);

  // Handler per dismiss
  // 🆕 v8: Track fast dismissals for branching behavior
  const handleDismiss = useCallback(() => {
    if (!canDismiss) return;
    
    // Check if this was a fast dismiss (< 3 seconds after becoming dismissible)
    const timeSinceShown = Date.now() - overlayShownAtRef.current;
    const FAST_DISMISS_THRESHOLD = 3000; // 3 seconds
    
    if (timeSinceShown < FAST_DISMISS_THRESHOLD + SHADOW_PROTOCOL_TIMING.MIN_DISPLAY_MS) {
      recordFastDismiss();
      if (SHADOW_DEBUG) {
        console.log('[SHADOW v8] ⏩ Fast dismiss detected');
      }
    }
    
    hideOverlay();
  }, [canDismiss, hideOverlay, recordFastDismiss]);

  // Handler per typing completato
  const handleTypingEnd = useCallback(() => {
    setTypingComplete(true);
  }, []);

  // Handler per click su overlay (solo se non blocking o canDismiss)
  const handleOverlayClick = useCallback(() => {
    if (currentEvent?.blocking && !canDismiss) return;
    if (canDismiss) {
      handleDismiss();
    }
  }, [currentEvent?.blocking, canDismiss, handleDismiss]);

  // 🆕 v5: Handler per CTA navigation (v6: with glitch effect)
  const handleCtaClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent overlay click
    if (!currentEvent?.ctaRoute) return;
    if (!canDismiss) return;
    
    // Check cooldown
    if (!canNavigateCta()) {
      if (SHADOW_DEBUG) {
        console.log('[SHADOW PROTOCOL v5] 🔗 CTA navigation on cooldown');
      }
      // Still close overlay, just don't navigate
      hideOverlay();
      return;
    }

    if (SHADOW_DEBUG) {
      console.log('[SHADOW PROTOCOL v6] 🔗 CTA navigation with glitch to:', currentEvent.ctaRoute);
    }

    // Record navigation and close overlay
    recordCtaNavigation();
    hideOverlay();
    
    // 🆕 v6: Navigate with glitch effect
    ShadowGlitchEngine.triggerRedirectCTA(currentEvent.ctaRoute!, navigate);
  }, [currentEvent?.ctaRoute, canDismiss, canNavigateCta, recordCtaNavigation, hideOverlay, navigate]);

  // Non renderizzare se non visibile o nessun evento
  // 🔧 v9: Also check portal container is ready (SSR safe)
  if (!isVisible || !currentEvent || !portalContainer) return null;

  const { entity, text, blocking, intensity } = currentEvent;
  
  // 🆕 v8: Get entity evolution level and modify text
  const evolutionLevel = entityEvolution[entity] as EntityEvolutionLevel;
  const modifiedText = getEvolutionModifiedText(text, entity, evolutionLevel);

  // Classe per entità
  const entityClass =
    entity === 'MCP'
      ? 'shadow-entity-mcp'
      : entity === 'SHADOW'
      ? 'shadow-entity-shadow'
      : 'shadow-entity-echo';

  // Classe per intensità
  const intensityClass = `shadow-intensity-${intensity}`;

  // Classe per reduced motion
  const motionClass = prefersReducedMotion ? 'reduced-motion' : '';

  // 🔧 v9: Overlay content to render via portal
  const overlayContent = (
    <div
      ref={overlayRef}
      className={`shadow-protocol-overlay ${entityClass} ${intensityClass} ${motionClass}`}
      onClick={handleOverlayClick}
      role="alertdialog"
      aria-modal="true"
      aria-label={`${entity} Protocol Message`}
    >
      {/* CRT Effects Layer */}
      <div className="shadow-protocol-crt">
        <div className="shadow-protocol-scanlines" />
        <div className="shadow-protocol-vignette" />
      </div>

      {/* SHADOW Face Fragment Layer (solo per entity SHADOW e se no reduced motion) */}
      {entity === 'SHADOW' && !prefersReducedMotion && (
        <ShadowFaceFragment intensity={intensity} />
      )}

      {/* 🆕 v8: Cinematic Entity Visual */}
      <EntityVisual 
        entity={entity} 
        intensity={intensity}
        evolutionLevel={evolutionLevel}
        reducedMotion={prefersReducedMotion}
      />

      {/* Content */}
      <div className="shadow-protocol-content">
        {/* Entity Badge */}
        <div className={`shadow-protocol-badge ${entityClass}`}>
          {entity}
        </div>

        {/* Message with typing effect - v8: uses evolution-modified text */}
        <EntityMessage
          text={modifiedText}
          typingSpeed={30}
          onTypingEnd={handleTypingEnd}
          className={entityClass}
        />

        {/* 🆕 v5: Buttons Container */}
        <div className="shadow-protocol-buttons">
          {/* CTA Button (if available) */}
          {currentEvent.ctaLabel && currentEvent.ctaRoute && (
            <button
              type="button"
              className={`shadow-protocol-button shadow-protocol-cta ${currentEvent.ctaType || 'primary'} ${canDismiss && typingComplete ? 'visible' : 'hidden'}`}
              onClick={handleCtaClick}
              disabled={!canDismiss}
              aria-disabled={!canDismiss}
            >
              {currentEvent.ctaLabel}
            </button>
          )}

          {/* Acknowledge Button */}
          <button
            type="button"
            className={`shadow-protocol-button ${canDismiss && typingComplete ? 'visible' : 'hidden'}`}
            onClick={handleDismiss}
            disabled={!canDismiss}
            aria-disabled={!canDismiss}
          >
            ACKNOWLEDGE
          </button>
        </div>

        {/* Loading indicator while typing */}
        {!typingComplete && (
          <div className="shadow-protocol-loading">
            <span className="shadow-protocol-dot" />
            <span className="shadow-protocol-dot" />
            <span className="shadow-protocol-dot" />
          </div>
        )}
      </div>
    </div>
  );

  // 🔧 v9: Render via portal to document.body
  // This ensures the overlay escapes any parent stacking contexts created by
  // transform, filter, will-change, etc. on ancestor elements
  return createPortal(overlayContent, portalContainer);
};

// ============================================================================
// 🆕 v8: ENTITY VISUAL COMPONENTS - Cinematic animations per entity
// ============================================================================

interface EntityVisualProps {
  entity: ShadowEntity;
  intensity: number;
  evolutionLevel: EntityEvolutionLevel;
  reducedMotion: boolean;
}

/**
 * EntityVisual - Dispatcher component that renders entity-specific visual
 */
const EntityVisual: React.FC<EntityVisualProps> = ({ entity, intensity, evolutionLevel, reducedMotion }) => {
  switch (entity) {
    case 'SHADOW':
      return <ShadowEntityVisual intensity={intensity} evolutionLevel={evolutionLevel} reducedMotion={reducedMotion} />;
    case 'MCP':
      return <McpEntityVisual intensity={intensity} evolutionLevel={evolutionLevel} reducedMotion={reducedMotion} />;
    case 'ECHO':
      return <EchoEntityVisual intensity={intensity} evolutionLevel={evolutionLevel} reducedMotion={reducedMotion} />;
    default:
      return null;
  }
};

/**
 * ShadowEntityVisual - Inverted red triangle with eye
 * The eye "watches" the user. Glitches intensify with evolution.
 */
const ShadowEntityVisual: React.FC<Omit<EntityVisualProps, 'entity'>> = ({ intensity, evolutionLevel, reducedMotion }) => {
  const glitchIntensity = reducedMotion ? 0 : Math.min(1, (intensity + evolutionLevel) / 5);
  
  return (
    <div 
      className={`entity-visual shadow-visual ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{ '--evolution-level': evolutionLevel, '--glitch-intensity': glitchIntensity } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Inverted Triangle */}
      <div className="shadow-visual-triangle">
        {/* The Eye */}
        <div className="shadow-visual-eye">
          <div className="shadow-visual-pupil" />
        </div>
        {/* Glitch lines */}
        {!reducedMotion && evolutionLevel >= 1 && (
          <>
            <div className="shadow-visual-glitch-line line-1" />
            <div className="shadow-visual-glitch-line line-2" />
          </>
        )}
        {!reducedMotion && evolutionLevel >= 2 && (
          <div className="shadow-visual-glitch-line line-3" />
        )}
      </div>
      {/* Glow ring - intensifies with evolution */}
      <div className="shadow-visual-glow" />
    </div>
  );
};

/**
 * McpEntityVisual - Cyan HUD / Shield interface
 * Rotating rings, scan-lines, protective feel
 */
const McpEntityVisual: React.FC<Omit<EntityVisualProps, 'entity'>> = ({ intensity, evolutionLevel, reducedMotion }) => {
  return (
    <div 
      className={`entity-visual mcp-visual ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{ '--evolution-level': evolutionLevel } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <div className="mcp-visual-ring ring-outer">
        {/* Tick marks */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="mcp-visual-tick" style={{ transform: `rotate(${i * 30}deg)` }} />
        ))}
      </div>
      {/* Inner ring */}
      <div className="mcp-visual-ring ring-inner" />
      {/* Center hexagon */}
      <div className="mcp-visual-hex">
        <div className="mcp-visual-hex-inner" />
      </div>
      {/* Scan line */}
      {!reducedMotion && (
        <div className="mcp-visual-scan" />
      )}
      {/* Shield pulse - activates at higher evolution */}
      {evolutionLevel >= 2 && !reducedMotion && (
        <div className="mcp-visual-shield-pulse" />
      )}
    </div>
  );
};

/**
 * EchoEntityVisual - Ghosted waveform / broken circle
 * Flickers, fades, signal loss effect
 */
const EchoEntityVisual: React.FC<Omit<EntityVisualProps, 'entity'>> = ({ intensity, evolutionLevel, reducedMotion }) => {
  // Generate wave segments
  const segments = useMemo(() => {
    const count = 8 + evolutionLevel * 2;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * 360,
      opacity: 0.3 + Math.random() * 0.5,
      scale: 0.8 + Math.random() * 0.4,
      delay: Math.random() * 2,
    }));
  }, [evolutionLevel]);

  return (
    <div 
      className={`entity-visual echo-visual ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{ '--evolution-level': evolutionLevel } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Broken circle segments */}
      <div className="echo-visual-ring">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="echo-visual-segment"
            style={{
              transform: `rotate(${seg.angle}deg)`,
              opacity: reducedMotion ? 0.5 : seg.opacity,
              animationDelay: reducedMotion ? '0s' : `${seg.delay}s`,
            }}
          />
        ))}
      </div>
      {/* Waveform center */}
      <div className="echo-visual-wave">
        <div className="echo-visual-wave-line line-1" />
        <div className="echo-visual-wave-line line-2" />
        <div className="echo-visual-wave-line line-3" />
      </div>
      {/* Ghost copies at higher evolution */}
      {evolutionLevel >= 2 && !reducedMotion && (
        <>
          <div className="echo-visual-ghost ghost-1" />
          <div className="echo-visual-ghost ghost-2" />
        </>
      )}
      {/* Static noise at level 3 */}
      {evolutionLevel >= 3 && !reducedMotion && (
        <div className="echo-visual-static" />
      )}
    </div>
  );
};

/**
 * ShadowFaceFragment - Componente per frammenti di volto glitchato
 * Solo CSS, niente immagini reali - pattern astratto che simula silhouette
 */
const ShadowFaceFragment: React.FC<{ intensity: number }> = ({ intensity }) => {
  // Genera posizioni casuali per i frammenti
  const fragments = useMemo(() => {
    const count = intensity >= 3 ? 4 : intensity >= 2 ? 3 : 2;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 40 + 5, // 5% - 45%
      right: Math.random() * 30 + 5, // 5% - 35%
      delay: Math.random() * 0.5,
      duration: 0.08 + Math.random() * 0.07, // 80-150ms
    }));
  }, [intensity]);

  return (
    <div className="shadow-face-container" aria-hidden="true">
      {fragments.map((f) => (
        <div
          key={f.id}
          className={`shadow-face-fragment intensity-${intensity}`}
          style={{
            top: `${f.top}%`,
            right: `${f.right}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        >
          {/* Eye-like shapes */}
          <div className="shadow-face-eye left" />
          <div className="shadow-face-eye right" />
          {/* Mouth-like shape */}
          <div className="shadow-face-mouth" />
          {/* Scanlines over face */}
          <div className="shadow-face-scanlines" />
        </div>
      ))}
    </div>
  );
};

export default EntityOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
