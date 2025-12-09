// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v5 - Entity Overlay Component
// Fullscreen overlay per eventi MCP / SHADOW / ECHO
// Include frammenti di volto glitchato per SHADOW entity
// v3: Force repaint per iOS Safari
// v5: Interactive CTA buttons + Global glitch effects

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { useEntityOverlayStore, SHADOW_DEBUG } from '@/stores/entityOverlayStore';
import { EntityMessage } from './EntityMessage';
import { SHADOW_PROTOCOL_TIMING } from '@/config/shadowProtocolConfig';
import { useGlobalGlitchEffect } from '@/hooks/useGlobalGlitchEffect';
import { ShadowGlitchEngine } from '@/engine/shadowGlitchEngine';
import '@/styles/effects/shadow-protocol.css';

/**
 * EntityOverlay - Overlay fullscreen per Shadow Protocol v3
 * 
 * Comportamento:
 * - Se !isVisible || !currentEvent → null
 * - Fullscreen con glitch effects
 * - Stile diverso per MCP / SHADOW / ECHO
 * - SHADOW include frammenti di volto glitchato
 * - Tap o ACKNOWLEDGE chiude (se non blocking o dopo MIN_DISPLAY_MS)
 * - Rispetta prefers-reduced-motion
 * - v3: Force repaint per iOS Safari
 */
export const EntityOverlay: React.FC = () => {
  const { currentEvent, isVisible, hideOverlay, canNavigateCta, recordCtaNavigation } = useEntityOverlayStore();
  const [, navigate] = useLocation();
  const [canDismiss, setCanDismiss] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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

    const timer = setTimeout(() => {
      setCanDismiss(true);
    }, SHADOW_PROTOCOL_TIMING.MIN_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isVisible, currentEvent]);

  // Handler per dismiss
  const handleDismiss = useCallback(() => {
    if (!canDismiss) return;
    hideOverlay();
  }, [canDismiss, hideOverlay]);

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
  if (!isVisible || !currentEvent) return null;

  const { entity, text, blocking, intensity } = currentEvent;

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

  return (
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

      {/* Content */}
      <div className="shadow-protocol-content">
        {/* Entity Badge */}
        <div className={`shadow-protocol-badge ${entityClass}`}>
          {entity}
        </div>

        {/* Message with typing effect */}
        <EntityMessage
          text={text}
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
