// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * M1SSION ENTRY MODAL - Cinematic Entry Experience
 * 
 * Hollywood-style modal that appears when user clicks "Entra in M1SSION".
 * Features:
 * - Dark cinematic backdrop with glass + vignette + grain
 * - Elegant entry animation (fade + scale + glow pulse)
 * - "Ritual" scanning sequence (skippable)
 * - Audio trigger on "ENTRA ORA" (iOS compatible)
 * - Feature flag for easy disable
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import './m1ssion-entry.css';

// Feature flag - set to false to disable the modal
export const ENABLE_CINEMATIC_ENTRY = true;

interface M1ssionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: () => void;
}

type ModalPhase = 'intro' | 'syncing' | 'unlocked' | 'ready' | 'exiting';

const PHASE_TIMING = {
  intro: 800,       // Initial intro animation
  syncing: 8000,    // Scanning/syncing sequence (can be skipped)
  unlocked: 2000,   // Cinematic reveal (increased for drama)
  exiting: 1200,    // Fade out transition before navigation
};

const M1ssionEntryModal: React.FC<M1ssionEntryModalProps> = ({ 
  isOpen, 
  onClose, 
  onEnter 
}) => {
  const [phase, setPhase] = useState<ModalPhase>('intro');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset phase when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setProgress(0);
    }
  }, [isOpen]);

  // Phase transitions
  useEffect(() => {
    if (!isOpen) return;

    if (phase === 'intro') {
      const timer = setTimeout(() => {
        setPhase('syncing');
      }, PHASE_TIMING.intro);
      return () => clearTimeout(timer);
    }

    if (phase === 'syncing') {
      // Start progress bar
      const startTime = Date.now();
      const duration = PHASE_TIMING.syncing;
      
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setPhase('unlocked');
        }
      }, 50);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }

    if (phase === 'unlocked') {
      const timer = setTimeout(() => {
        setPhase('ready');
      }, PHASE_TIMING.unlocked);
      return () => clearTimeout(timer);
    }
  }, [phase, isOpen]);

  // Skip to ready phase
  const handleSkip = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(100);
    setPhase('ready');
  }, []);

  // Handle "ENTRA ORA" click - starts cinematic exit transition
  const handleEnterClick = useCallback(() => {
    // Trigger haptic feedback
    try {
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 80]);
      }
    } catch (e) {
      // Silent fail
    }

    // Play epic audio (iOS compatible - triggered by user gesture)
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log('[M1ssionEntryModal] Audio blocked, continuing without sound');
          });
        }
      }
    } catch (e) {
      // Silent fail
    }

    // Start exiting phase with cinematic fade
    setPhase('exiting');
  }, []);

  // Handle exiting phase - navigate after fade completes
  useEffect(() => {
    if (phase === 'exiting') {
      const timer = setTimeout(() => {
        onEnter();
      }, PHASE_TIMING.exiting);
      return () => clearTimeout(timer);
    }
  }, [phase, onEnter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="m1-entry-overlay">
        {/* Audio element - loaded on demand, plays on user gesture */}
        <audio 
          ref={audioRef} 
          preload="auto"
          playsInline
        >
          <source src="/assets/audio/m1ssion-entry.mp3" type="audio/mpeg" />
          <source src="/assets/audio/m1ssion-entry.ogg" type="audio/ogg" />
        </audio>

        {/* Cinematic backdrop */}
        <motion.div 
          className="m1-entry-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Vignette effect */}
        <div className="m1-entry-vignette" />
        
        {/* Film grain overlay */}
        <div className="m1-entry-grain" />

        {/* Glow pulse background */}
        <motion.div 
          className="m1-entry-glow"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Main modal content */}
        <motion.div 
          className="m1-entry-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ 
            type: 'spring', 
            duration: 0.6,
            delay: 0.1
          }}
        >
          {/* Close button (X) - always visible */}
          <motion.button
            className="m1-entry-close"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* PHASE: INTRO / SYNCING */}
          {(phase === 'intro' || phase === 'syncing') && (
            <motion.div 
              className="m1-entry-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Status badge */}
              <div className="m1-entry-badge">
                <div className="m1-entry-badge-dot" />
                <span>ACCESSO CONFERMATO</span>
              </div>

              {/* Scanning ring */}
              <div className="m1-entry-scanner">
                <div className="m1-entry-scanner-ring" />
                <div className="m1-entry-scanner-ring delay-1" />
                <div className="m1-entry-scanner-ring delay-2" />
                <div className="m1-entry-scanner-core">
                  <ShieldCheck className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              {/* Status text */}
              <motion.p 
                className="m1-entry-status"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {progress < 30 && "SINCRONIZZAZIONE..."}
                {progress >= 30 && progress < 70 && "VERIFICA CREDENZIALI..."}
                {progress >= 70 && "INIZIALIZZAZIONE SISTEMA..."}
              </motion.p>

              {/* Progress bar */}
              <div className="m1-entry-progress">
                <motion.div 
                  className="m1-entry-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Skip button */}
              <motion.button
                className="m1-entry-skip"
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Salta →
              </motion.button>
            </motion.div>
          )}

          {/* PHASE: UNLOCKED - Cinematic Reveal */}
          {phase === 'unlocked' && (
            <motion.div 
              className="m1-entry-content m1-entry-unlocked-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Dramatic flash effect */}
              <motion.div 
                className="m1-entry-flash"
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* Floating particles burst */}
              <div className="m1-entry-particles-burst">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="m1-entry-particle-burst"
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{ 
                      x: Math.cos((i / 12) * Math.PI * 2) * 120,
                      y: Math.sin((i / 12) * Math.PI * 2) * 120,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ 
                      duration: 1.2, 
                      ease: "easeOut",
                      delay: 0.1 
                    }}
                  />
                ))}
              </div>

              {/* Central icon with glow */}
              <motion.div 
                className="m1-entry-unlock-icon-container"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300,
                  damping: 15,
                  delay: 0.2
                }}
              >
                <div className="m1-entry-unlock-glow" />
                <div className="m1-entry-unlock-ring" />
                <div className="m1-entry-unlock-ring delay" />
                <motion.div 
                  className="m1-entry-unlock-icon"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                </motion.div>
              </motion.div>

              {/* Theatrical title */}
              <motion.div 
                className="m1-entry-unlock-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.span 
                  className="m1-entry-unlock-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  VERIFICA COMPLETATA
                </motion.span>
                <motion.h2 
                  className="m1-entry-unlock-title"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  DIVENTA UN AGENTE
                </motion.h2>
                <motion.div 
                  className="m1-entry-unlock-sparkles"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>IL SISTEMA TI RICONOSCE</span>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* PHASE: READY */}
          {phase === 'ready' && (
            <motion.div 
              className="m1-entry-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header badge */}
              <div className="m1-entry-badge success">
                <div className="m1-entry-badge-dot success" />
                <span>SISTEMA PRONTO</span>
              </div>

              {/* Main title */}
              <motion.h1 
                className="m1-entry-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                BENVENUTO IN<br />
                <span className="m1-entry-title-brand">M1SSION™</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.div 
                className="m1-entry-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p>La tua identità è stata verificata.</p>
                <p className="m1-entry-highlight">I Premi Attivi sono reali. La caccia è iniziata.</p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="m1-entry-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* Primary CTA */}
                <button 
                  className="m1-entry-cta-primary"
                  onClick={handleEnterClick}
                >
                  <span>ENTRA ORA</span>
                  <ChevronRight className="w-5 h-5" />
                  <div className="m1-entry-cta-shine" />
                </button>

                {/* Secondary CTA */}
                <button 
                  className="m1-entry-cta-secondary"
                  onClick={onClose}
                >
                  Non ora
                </button>
              </motion.div>

              {/* Legal note */}
              <motion.p 
                className="m1-entry-legal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Non è un gioco d'azzardo. Accesso digitale gratuito.
              </motion.p>
            </motion.div>
          )}
        </motion.div>

        {/* PHASE: EXITING - Cinematic fullscreen fade to landing */}
        <AnimatePresence>
          {phase === 'exiting' && (
            <motion.div 
              className="m1-entry-exit-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {/* Radial glow expanding */}
              <motion.div 
                className="m1-entry-exit-glow"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Central content fading */}
              <motion.div 
                className="m1-entry-exit-content"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div 
                  className="m1-entry-exit-icon"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180 }}
                  transition={{ duration: 1 }}
                >
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <motion.p 
                  className="m1-entry-exit-text"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  INIZIALIZZAZIONE...
                </motion.p>
              </motion.div>

              {/* Final fade to black */}
              <motion.div 
                className="m1-entry-exit-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default M1ssionEntryModal;

