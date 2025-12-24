// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PRIZE INTRO CINEMATIC SYSTEM - Overlay Component
// 
// Displays a cinematic introduction to the mission prizes
// Shows after onboarding, before gameplay begins

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { usePrizeIntroStore, PRIZE_INTRO_DEBUG } from '@/stores/prizeIntroStore';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';
import {
  CURRENT_MISSION_PRIZES,
  PRIZE_INTRO_MODE,
  PRIZE_INTRO_TIMING,
  SECONDARY_PRIZES_HINT,
  PRIZE_REVEAL_MESSAGE,
  CTA_BUTTON_TEXT,
  getPrimaryDialogue,
  getRandomPrizes,
  type PrizeVisual,
  type PrizeIntroDialogue,
} from '@/config/prizeIntroConfig';
import '@/styles/effects/shadow-protocol.css';

// ============================================================================
// CONSTANTS
// ============================================================================

// Show ALL prizes in the intro (10 prizes configured)
const MAX_PRIZES_TO_SHOW = 10;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * EntitySymbol - Animated visual for each entity (SHADOW/MCP/ECHO)
 */
const EntitySymbol: React.FC<{
  entity: 'SHADOW' | 'MCP' | 'ECHO';
  isActive: boolean;
  reducedMotion: boolean;
}> = ({ entity, isActive, reducedMotion }) => {
  switch (entity) {
    case 'SHADOW':
      return (
        <div className={`prize-intro-entity shadow-entity ${isActive ? 'active' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
          {/* Inverted Red Triangle with Eye */}
          <div className="prize-shadow-triangle">
            <div className="prize-shadow-eye">
              <div className="prize-shadow-pupil" />
            </div>
            {!reducedMotion && (
              <>
                <div className="prize-shadow-glitch-line line-1" />
                <div className="prize-shadow-glitch-line line-2" />
              </>
            )}
          </div>
          <div className="prize-shadow-glow" />
        </div>
      );

    case 'MCP':
      return (
        <div className={`prize-intro-entity mcp-entity ${isActive ? 'active' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
          {/* Cyan Hexagon / Shield Core */}
          <div className="prize-mcp-hex-outer">
            <div className="prize-mcp-hex-inner">
              <div className="prize-mcp-core" />
            </div>
            {!reducedMotion && (
              <div className="prize-mcp-scan" />
            )}
          </div>
          <div className="prize-mcp-ring" />
          {!reducedMotion && <div className="prize-mcp-pulse" />}
        </div>
      );

    case 'ECHO':
      return (
        <div className={`prize-intro-entity echo-entity ${isActive ? 'active' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
          {/* Soft Ring / Wave / Particle Halo */}
          <div className="prize-echo-ring">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="prize-echo-particle"
                style={{ 
                  transform: `rotate(${i * 45}deg)`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          <div className="prize-echo-wave wave-1" />
          <div className="prize-echo-wave wave-2" />
          <div className="prize-echo-wave wave-3" />
        </div>
      );
  }
};

/**
 * DialogueTyper - Typing effect for entity dialogue
 * ✅ FIX 23/12/2025 v2: Completamente riscritto per compatibilità con StrictMode
 */
const DialogueTyper: React.FC<{
  lines: string[];
  typingSpeed: number;
  onComplete: () => void;
  className?: string;
}> = ({ lines, typingSpeed, onComplete, className = '' }) => {
  const fullText = useMemo(() => lines.join('\n'), [lines]);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset quando fullText cambia
  useEffect(() => {
    setCharIndex(0);
    setIsComplete(false);
  }, [fullText]);

  // Timer per l'effetto typewriter
  useEffect(() => {
    if (isComplete || !fullText) return;

    console.log('[DialogueTyper] 🎬 Typing char', charIndex, '/', fullText.length);

    if (charIndex >= fullText.length) {
      setIsComplete(true);
      console.log('[DialogueTyper] ✅ Typing complete');
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCharIndex(prev => prev + 1);
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, fullText, typingSpeed, isComplete, onComplete]);

  const displayedText = fullText.slice(0, charIndex);

  return (
    <pre className={`prize-intro-dialogue ${className}`}>
      {displayedText}
      {!isComplete && <span className="prize-intro-cursor">▌</span>}
    </pre>
  );
};

/**
 * PrizeCard - Individual prize display card
 */
const PrizeCard: React.FC<{
  prize: PrizeVisual;
  isActive: boolean;
  index: number;
  reducedMotion: boolean;
}> = ({ prize, isActive, index, reducedMotion }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className={`prize-card ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isActive ? 1 : 0.3, 
        scale: isActive ? 1 : 0.85,
        y: isActive ? 0 : 20,
      }}
      transition={{ 
        duration: reducedMotion ? 0.1 : 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {/* Prize Image */}
      <div className="prize-card-image-container">
        {!imageLoaded && !imageError && (
          <div className="prize-card-skeleton">
            <div className="prize-card-skeleton-shimmer" />
          </div>
        )}
        {imageError ? (
          <div className="prize-card-placeholder">
            <span className="prize-card-placeholder-text">?</span>
          </div>
        ) : (
          <motion.img
            src={prize.imageUrl}
            alt={prize.label}
            className={`prize-card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {/* Neon border glow */}
        <div className="prize-card-glow" />
      </div>

      {/* Prize Info */}
      <div className="prize-card-info">
        <h3 className="prize-card-label">{prize.label}</h3>
        <p className="prize-card-tagline">{prize.tagline}</p>
        {prize.estimatedValue && (
          <span className="prize-card-value">{prize.estimatedValue}</span>
        )}
      </div>

      {/* Category badge */}
      <div className={`prize-card-category ${prize.category}`}>
        {prize.category.toUpperCase()}
      </div>
    </motion.div>
  );
};

/**
 * PrizeGallery - Container for prize cards (cinematic or carousel)
 */
const PrizeGallery: React.FC<{
  prizes: PrizeVisual[];
  currentIndex: number;
  mode: 'cinematic' | 'carousel';
  onIndexChange: (index: number) => void;
  reducedMotion: boolean;
}> = ({ prizes, currentIndex, mode, onIndexChange, reducedMotion }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe in carousel mode
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (mode !== 'carousel') return;
    
    if (direction === 'left' && currentIndex < prizes.length - 1) {
      onIndexChange(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [mode, currentIndex, prizes.length, onIndexChange]);

  return (
    <div className="prize-gallery" ref={containerRef}>
      <div className="prize-gallery-inner">
        {prizes.map((prize, index) => (
          <PrizeCard
            key={prize.id}
            prize={prize}
            isActive={index === currentIndex}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Carousel indicators */}
      {mode === 'carousel' && (
        <div className="prize-gallery-indicators">
          {prizes.map((_, index) => (
            <button
              key={index}
              className={`prize-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onIndexChange(index)}
              aria-label={`Go to prize ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Carousel arrows */}
      {mode === 'carousel' && (
        <>
          <button
            className="prize-nav-arrow prev"
            onClick={() => handleSwipe('right')}
            disabled={currentIndex === 0}
            aria-label="Previous prize"
          >
            ‹
          </button>
          <button
            className="prize-nav-arrow next"
            onClick={() => handleSwipe('left')}
            disabled={currentIndex === prizes.length - 1}
            aria-label="Next prize"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MissionPrizeIntroOverlay
 * 
 * Cinematic overlay that introduces the mission prizes.
 * Shows after onboarding/first login, before gameplay.
 */
export const MissionPrizeIntroOverlay: React.FC = () => {
  // Auth state
  const { isAuthenticated, user } = useUnifiedAuth();
  
  // Store state
  const hasSeenPrizeIntro = usePrizeIntroStore((s) => s.hasSeenPrizeIntro);
  const markPrizeIntroSeen = usePrizeIntroStore((s) => s.markPrizeIntroSeen);
  const isSequenceComplete = usePrizeIntroStore((s) => s.isSequenceComplete);
  const markSequenceComplete = usePrizeIntroStore((s) => s.markSequenceComplete);
  
  // Check if other overlays are active
  const isShadowOverlayVisible = useEntityOverlayStore((s) => s.isVisible);
  const isMissionIntroActive = useEntityOverlayStore((s) => s.showMissionIntro);
  const isIntroActive = useEntityOverlayStore((s) => s.isIntroActive);

  // Local state
  const [isVisible, setIsVisible] = useState(false);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [dialogueComplete, setDialogueComplete] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Get prizes and dialogue
  const prizesToShow = useMemo(() => {
    return getRandomPrizes(MAX_PRIZES_TO_SHOW);
  }, []);
  
  const dialogue = useMemo(() => getPrimaryDialogue(), []);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine if we should show the overlay
  useEffect(() => {
    // Don't show if not authenticated
    if (!isAuthenticated || !user) {
      setIsVisible(false);
      return;
    }

    // Don't show if already seen
    if (hasSeenPrizeIntro) {
      setIsVisible(false);
      return;
    }

    // Don't show if other overlays are active
    if (isShadowOverlayVisible || isMissionIntroActive || isIntroActive) {
      return;
    }

    // Show the overlay after a short delay
    const timer = setTimeout(() => {
      if (PRIZE_INTRO_DEBUG) {
        console.log('[PRIZE INTRO] 🎬 Showing prize intro overlay');
      }
      setIsVisible(true);
      
      // Dispatch start event
      window.dispatchEvent(new CustomEvent('shadow:prizeIntroStart'));
    }, PRIZE_INTRO_TIMING.INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, hasSeenPrizeIntro, isShadowOverlayVisible, isMissionIntroActive, isIntroActive]);

  // Cinematic mode: Auto-advance prizes
  useEffect(() => {
    if (!isVisible || PRIZE_INTRO_MODE !== 'cinematic' || !dialogueComplete) {
      return;
    }

    if (currentPrizeIndex >= prizesToShow.length) {
      // All prizes shown, show final message
      setShowFinalMessage(true);
      setTimeout(() => {
        setCanDismiss(true);
        markSequenceComplete();
      }, PRIZE_INTRO_TIMING.FINAL_DELAY_MS);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPrizeIndex((prev) => prev + 1);
    }, PRIZE_INTRO_TIMING.PRIZE_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isVisible, dialogueComplete, currentPrizeIndex, prizesToShow.length, markSequenceComplete]);

  // Carousel mode: Enable dismiss after minimum view time
  useEffect(() => {
    if (!isVisible || PRIZE_INTRO_MODE !== 'carousel') return;

    const timer = setTimeout(() => {
      setCanDismiss(true);
    }, PRIZE_INTRO_TIMING.MIN_VIEW_TIME_MS);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Handle dialogue complete
  const handleDialogueComplete = useCallback(() => {
    setDialogueComplete(true);
  }, []);

  // Handle CTA click
  const handleEnterHunt = useCallback(() => {
    if (!canDismiss && PRIZE_INTRO_MODE === 'cinematic') return;

    if (PRIZE_INTRO_DEBUG) {
      console.log('[PRIZE INTRO] 🎯 User clicked CTA - entering hunt');
    }

    markPrizeIntroSeen();
    setIsVisible(false);
  }, [canDismiss, markPrizeIntroSeen]);

  // Don't render if not visible
  if (!isVisible) return null;

  // 🔥 FIX: Use createPortal to render directly in body, bypassing CSS containment issues
  const overlayContent = (
    <AnimatePresence>
      <motion.div
        className="prize-intro-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
        role="dialog"
        aria-modal="true"
        aria-label="Mission Prize Introduction"
      >
        {/* Background effects */}
        <div className="prize-intro-bg">
          <div className="prize-intro-scanlines" />
          <div className="prize-intro-vignette" />
          <div className="prize-intro-grain" />
        </div>

        {/* Safe area container */}
        <div className="prize-intro-container">
          {/* Entity Symbol */}
          <div className="prize-intro-entity-container">
            <EntitySymbol
              entity={dialogue.entity}
              isActive={!dialogueComplete}
              reducedMotion={prefersReducedMotion}
            />
          </div>

          {/* Dialogue Section */}
          <div className="prize-intro-dialogue-container">
            <DialogueTyper
              lines={dialogue.lines}
              typingSpeed={PRIZE_INTRO_TIMING.TYPING_SPEED_MS}
              onComplete={handleDialogueComplete}
              className={`entity-${dialogue.entity.toLowerCase()}`}
            />
          </div>

          {/* Prize Gallery */}
          {dialogueComplete && (
            <motion.div
              className="prize-intro-gallery-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, delay: 0.3 }}
            >
              <PrizeGallery
                prizes={prizesToShow}
                currentIndex={Math.min(currentPrizeIndex, prizesToShow.length - 1)}
                mode={PRIZE_INTRO_MODE}
                onIndexChange={setCurrentPrizeIndex}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}

          {/* Final Reveal Message */}
          {showFinalMessage && (
            <motion.div
              className="prize-intro-reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
            >
              <p className="prize-intro-reveal-text">{PRIZE_REVEAL_MESSAGE}</p>
              <p className="prize-intro-secondary-hint">
                {SECONDARY_PRIZES_HINT.copy}
              </p>
            </motion.div>
          )}

          {/* CTA Button */}
          {(canDismiss || PRIZE_INTRO_MODE === 'carousel') && (
            <motion.div
              className="prize-intro-cta-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.4, delay: 0.2 }}
            >
              <button
                className={`prize-intro-cta ${canDismiss ? 'enabled' : 'disabled'}`}
                onClick={handleEnterHunt}
                disabled={!canDismiss && PRIZE_INTRO_MODE === 'cinematic'}
              >
                <span className="prize-intro-cta-text">{CTA_BUTTON_TEXT}</span>
                <span className="prize-intro-cta-glow" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // 🔥 FIX: Render via portal to bypass CSS containment issues with position:fixed
  return typeof document !== 'undefined' 
    ? createPortal(overlayContent, document.body) 
    : null;
};

export default MissionPrizeIntroOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

