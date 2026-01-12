// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * VictorySequence - AAA Victory Animation
 * 
 * 3-Act cinematic sequence:
 * - ACT A (0-1.2s): Lock-On - reticle, sonar rings, "ACCESS VERIFIED"
 * - ACT B (1.2-3.2s): Burst + Reveal - gold burst, "SEI DENTRO", prize card
 * - ACT C (3.2-5.8s): Stabilize + CTA - calm down, enter the hunt
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './useSound';
import {
  CURRENT_MISSION_PRIZES,
  getRandomPrizes,
  type PrizeVisual,
} from '@/config/prizeIntroConfig';
import './victory.css';

type Act = 'A' | 'B' | 'C' | 'done';

interface VictorySequenceProps {
  onComplete: () => void;
}

// Short briefing copy
const BRIEFING = {
  title: '[MCP//BRIEFING: ACCESS GRANTED]',
  lines: [
    'A real-world prize is active.',
    'Only one target is linked to this Mission.',
    'Move fast. No second chances.',
  ],
};

const VictorySequence: React.FC<VictorySequenceProps> = ({ onComplete }) => {
  const [act, setAct] = useState<Act>('A');
  const [showAccessVerified, setShowAccessVerified] = useState(false);
  const [showSeiDentro, setShowSeiDentro] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [briefingLine, setBriefingLine] = useState(0);
  
  const { playSound } = useSound();
  
  // Get hero prize
  const heroPrize = useMemo(() => getRandomPrizes(1)[0], []);

  // ============================================================================
  // ACT TIMELINE
  // ============================================================================

  useEffect(() => {
    // ACT A: Lock-On (0 - 1.2s)
    // 0ms - start
    // 300ms - show ACCESS VERIFIED flash
    // 500ms - hide ACCESS VERIFIED
    // 1200ms - transition to ACT B
    
    const timers: NodeJS.Timeout[] = [];

    // Play scan sound at start
    playSound('scan');

    // Show ACCESS VERIFIED flash
    timers.push(setTimeout(() => {
      setShowAccessVerified(true);
      // Haptic
      if ('vibrate' in navigator) navigator.vibrate(15);
    }, 300));

    // Hide ACCESS VERIFIED
    timers.push(setTimeout(() => {
      setShowAccessVerified(false);
    }, 600));

    // Transition to ACT B
    timers.push(setTimeout(() => {
      setAct('B');
      playSound('victory');
      // Haptic
      if ('vibrate' in navigator) navigator.vibrate([20, 30, 40]);
    }, 1200));

    // ACT B: Burst + Reveal (1.2s - 3.2s)
    // 1200ms - burst starts, show SEI DENTRO
    // 1500ms - show briefing
    // 2200ms - show card
    // 3200ms - transition to ACT C

    timers.push(setTimeout(() => {
      setShowSeiDentro(true);
    }, 1200));

    timers.push(setTimeout(() => {
      setShowBriefing(true);
      // Start typewriter for briefing lines
      setBriefingLine(0);
    }, 1500));

    // Briefing lines typewriter
    timers.push(setTimeout(() => setBriefingLine(1), 1700));
    timers.push(setTimeout(() => setBriefingLine(2), 1900));
    timers.push(setTimeout(() => setBriefingLine(3), 2100));

    timers.push(setTimeout(() => {
      setShowCard(true);
      playSound('shimmer');
    }, 2400));

    // ACT C: Stabilize + CTA (3.2s - 5.8s)
    timers.push(setTimeout(() => {
      setAct('C');
    }, 3400));

    timers.push(setTimeout(() => {
      setShowCTA(true);
    }, 4000));

    return () => timers.forEach(clearTimeout);
  }, [playSound]);

  // Handle CTA click
  const handleEnterHunt = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate([20, 30, 20]);
    onComplete();
  }, [onComplete]);

  return (
    <div className="victory-container">
      {/* Background particles */}
      <div className="victory-particles">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="victory-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="victory-vignette" />

      {/* Scanlines */}
      <div className="victory-scanlines" />

      {/* ================================================================
          ACT A: LOCK-ON
          ================================================================ */}
      <AnimatePresence>
        {act === 'A' && (
          <motion.div
            className="victory-act-a"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Reticle / Lock-on target */}
            <div className="victory-reticle">
              <div className="victory-reticle-ring ring-1" />
              <div className="victory-reticle-ring ring-2" />
              <div className="victory-reticle-ring ring-3" />
              <div className="victory-reticle-crosshair">
                <span className="h-line" />
                <span className="v-line" />
              </div>
              <div className="victory-reticle-corners">
                <span className="corner tl" />
                <span className="corner tr" />
                <span className="corner bl" />
                <span className="corner br" />
              </div>
            </div>

            {/* Sonar rings */}
            <div className="victory-sonar">
              <div className="victory-sonar-ring" style={{ animationDelay: '0s' }} />
              <div className="victory-sonar-ring" style={{ animationDelay: '0.3s' }} />
              <div className="victory-sonar-ring" style={{ animationDelay: '0.6s' }} />
            </div>

            {/* ACCESS VERIFIED flash */}
            <AnimatePresence>
              {showAccessVerified && (
                <motion.div
                  className="victory-access-verified"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  ACCESS VERIFIED
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          ACT B & C: BURST + REVEAL + STABILIZE
          ================================================================ */}
      {(act === 'B' || act === 'C') && (
        <div className="victory-act-bc">
          {/* Gold burst (only in B) */}
          {act === 'B' && (
            <div className="victory-burst">
              <div className="victory-burst-core" />
              <div className="victory-burst-ring" />
              {/* Gold chips */}
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="victory-chip"
                  style={{
                    '--angle': `${i * 15}deg`,
                    '--delay': `${i * 0.02}s`,
                    '--distance': `${100 + Math.random() * 60}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          {/* SEI DENTRO text */}
          <AnimatePresence>
            {showSeiDentro && (
              <motion.h1
                className="victory-title"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [0, -2, 2, 0], // micro shake
                }}
                transition={{ 
                  duration: 0.4,
                  x: { duration: 0.1, delay: 0.2 }
                }}
              >
                SEI DENTRO
              </motion.h1>
            )}
          </AnimatePresence>

          {/* Briefing */}
          <AnimatePresence>
            {showBriefing && (
              <motion.div
                className="victory-briefing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="victory-briefing-title">{BRIEFING.title}</div>
                <div className="victory-briefing-lines">
                  {BRIEFING.lines.map((line, i) => (
                    <motion.div
                      key={i}
                      className={`victory-briefing-line ${briefingLine > i ? 'visible' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: briefingLine > i ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prize Card */}
          <AnimatePresence>
            {showCard && (
              <motion.div
                className="victory-card"
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="victory-card-shine" />
                <div className="victory-card-image">
                  <img 
                    src={heroPrize.imageUrl} 
                    alt={heroPrize.label}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="victory-card-category">{heroPrize.category}</div>
                </div>
                <div className="victory-card-info">
                  <h3>{heroPrize.label}</h3>
                  <p>{heroPrize.tagline}</p>
                  {heroPrize.estimatedValue && (
                    <span className="victory-card-value">{heroPrize.estimatedValue}</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The hunt can begin */}
          <AnimatePresence>
            {showCTA && (
              <motion.div
                className="victory-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="victory-tagline">The hunt can begin.</p>
                <motion.button
                  className="victory-cta"
                  onClick={handleEnterHunt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="victory-cta-text">ENTER THE HUNT</span>
                  <span className="victory-cta-glow" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VictorySequence;

