// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * CinematicVictory - Oscar-level Victory Animation
 * FIXED: Layout, errors, responsive
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomPrizes } from '@/config/prizeIntroConfig';
import '@/styles/qrwin-cinematic.css';

interface CinematicVictoryProps {
  onComplete: () => void;
}

type Phase = 'scan' | 'portal' | 'reveal' | 'card' | 'cta';

const CinematicVictory: React.FC<CinematicVictoryProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('scan');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  const heroPrize = useMemo(() => getRandomPrizes(1)[0], []);

  // Audio unlock on first interaction (NO BUTTON)
  useEffect(() => {
    const enableAudio = () => {
      if (audioEnabled) return;
      
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          // Play silent buffer to unlock
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
          setAudioContext(ctx);
          setAudioEnabled(true);
        }
      } catch (e) {
        // Silent fail
      }
      
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('click', enableAudio);
    };

    window.addEventListener('touchstart', enableAudio, { passive: true });
    window.addEventListener('click', enableAudio, { passive: true });

    return () => {
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('click', enableAudio);
    };
  }, [audioEnabled]);

  // Play sound
  const playSound = useCallback((type: 'scan' | 'impact' | 'reveal' | 'click') => {
    if (!audioContext || audioContext.state === 'suspended') return;

    const now = audioContext.currentTime;
    
    if (type === 'scan') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'impact') {
      // Deep bass hit
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(60, now);
      bass.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      bass.connect(bassGain);
      bassGain.connect(audioContext.destination);
      bass.start(now);
      bass.stop(now + 0.4);
      
      // Shimmer
      [1000, 1500, 2000].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + 0.6);
      });
    } else if (type === 'reveal') {
      [1200, 1800, 2400].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } else if (type === 'click') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }, [audioContext]);

  // Sequence timing
  useEffect(() => {
    playSound('scan');
    
    const t1 = setTimeout(() => {
      setPhase('portal');
    }, 800);

    const t2 = setTimeout(() => {
      setPhase('reveal');
      playSound('impact');
    }, 2200);

    const t3 = setTimeout(() => {
      setPhase('card');
      playSound('reveal');
    }, 3400);

    const t4 = setTimeout(() => {
      setPhase('cta');
    }, 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [playSound]);

  const handleCTA = () => {
    playSound('click');
    setTimeout(() => {
      onComplete();
    }, 100);
  };

  return (
    <div className="cv-container">
      {/* Background */}
      <div className="cv-bg">
        <div className="cv-stars" />
        <div className="cv-vignette" />
      </div>

      {/* SCAN PHASE */}
      <AnimatePresence>
        {phase === 'scan' && (
          <motion.div
            className="cv-phase cv-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="cv-scan-ring">
              <div className="cv-scan-dot" />
            </div>
            <p className="cv-scan-text">VERIFICA ACCESSO...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PORTAL PHASE */}
      <AnimatePresence>
        {phase === 'portal' && (
          <motion.div
            className="cv-phase cv-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
          >
            <div className="cv-portal-rings">
              <div className="cv-ring r1" />
              <div className="cv-ring r2" />
              <div className="cv-ring r3" />
            </div>
            <div className="cv-portal-glow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVEAL PHASE */}
      <AnimatePresence>
        {(phase === 'reveal' || phase === 'card' || phase === 'cta') && (
          <motion.div
            className="cv-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Title */}
            <motion.h1
              className="cv-title"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              ACCESS GRANTED
            </motion.h1>

            {/* Briefing - MAX 2 LINES */}
            <motion.div
              className="cv-briefing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="cv-briefing-1">[MCP // BRIEFING] A real-world prize is active.</p>
              <p className="cv-briefing-2">One target is linked to this Mission. Move fast.</p>
            </motion.div>

            {/* Gold Particles */}
            {phase === 'reveal' && (
              <div className="cv-particles">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="cv-particle"
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{ 
                      x: Math.cos((i * 15) * Math.PI / 180) * (100 + Math.random() * 50),
                      y: Math.sin((i * 15) * Math.PI / 180) * (100 + Math.random() * 50),
                      opacity: 0,
                      scale: 0.2
                    }}
                    transition={{ 
                      duration: 1,
                      ease: 'easeOut'
                    }}
                    style={{
                      background: i % 2 === 0 ? '#FFD700' : '#00E5FF',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD PHASE */}
      <AnimatePresence>
        {(phase === 'card' || phase === 'cta') && (
          <motion.div
            className="cv-card-wrap"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cv-card">
              <div className="cv-card-shine" />
              <div className="cv-card-img">
                {heroPrize.imageUrl && (
                  <img 
                    src={heroPrize.imageUrl} 
                    alt={heroPrize.label}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                )}
                <span className="cv-card-tag">{heroPrize.category}</span>
              </div>
              <div className="cv-card-body">
                <h3 className="cv-card-title">{heroPrize.label}</h3>
                <p className="cv-card-sub">{heroPrize.tagline}</p>
                {heroPrize.estimatedValue && (
                  <span className="cv-card-value">{heroPrize.estimatedValue}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {phase === 'cta' && (
          <motion.div
            className="cv-cta-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              className="cv-cta"
              onClick={handleCTA}
              whileTap={{ scale: 0.97 }}
            >
              ENTER THE HUNT
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CinematicVictory;
