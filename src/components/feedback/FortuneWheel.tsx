/**
 * M1SSION™ Fortune Wheel - Daily Spin for Rewards
 * 16 segments with casino-style probabilities
 * NEON STYLE - AAA Game Feel
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// 🎰 WHEEL SEGMENTS - 16 segments with NEON colors
const WHEEL_SEGMENTS = [
  { id: 1, label: '5 M1U', icon: '💰', value: 5, type: 'm1u', color: '#00FF88', neonGlow: 'rgba(0, 255, 136, 0.8)', probability: 15 },
  { id: 2, label: 'RIPROVA', icon: '🔄', value: 0, type: 'retry', color: '#1a1a2e', neonGlow: 'none', probability: 12 },
  { id: 3, label: '10 M1U', icon: '💎', value: 10, type: 'm1u', color: '#00D1FF', neonGlow: 'rgba(0, 209, 255, 0.8)', probability: 12 },
  { id: 4, label: 'NIENTE', icon: '❌', value: 0, type: 'nothing', color: '#0d0d1a', neonGlow: 'none', probability: 10 },
  { id: 5, label: 'INDIZIO', icon: '🔍', value: 1, type: 'clue', color: '#FFD700', neonGlow: 'rgba(255, 215, 0, 0.8)', probability: 8 },
  { id: 6, label: 'RIPROVA', icon: '🔄', value: 0, type: 'retry', color: '#1a1a2e', neonGlow: 'none', probability: 10 },
  { id: 7, label: '20 M1U', icon: '🤑', value: 20, type: 'm1u', color: '#39FF14', neonGlow: 'rgba(57, 255, 20, 0.8)', probability: 6 },
  { id: 8, label: 'NIENTE', icon: '❌', value: 0, type: 'nothing', color: '#0d0d1a', neonGlow: 'none', probability: 8 },
  { id: 9, label: '5 PE', icon: '⚡', value: 5, type: 'pe', color: '#BF00FF', neonGlow: 'rgba(191, 0, 255, 0.8)', probability: 10 },
  { id: 10, label: 'RIPROVA', icon: '🔄', value: 0, type: 'retry', color: '#1a1a2e', neonGlow: 'none', probability: 8 },
  { id: 11, label: 'MARKER', icon: '📍', value: 1, type: 'marker', color: '#FF6B00', neonGlow: 'rgba(255, 107, 0, 0.8)', probability: 3 },
  { id: 12, label: 'NIENTE', icon: '❌', value: 0, type: 'nothing', color: '#0d0d1a', neonGlow: 'none', probability: 8 },
  { id: 13, label: '50 M1U', icon: '👑', value: 50, type: 'm1u', color: '#FFD700', neonGlow: 'rgba(255, 215, 0, 1)', probability: 2 },
  { id: 14, label: 'INDIZIO', icon: '🔮', value: 1, type: 'clue', color: '#FF00FF', neonGlow: 'rgba(255, 0, 255, 0.8)', probability: 5 },
  { id: 15, label: '10 PE', icon: '🔥', value: 10, type: 'pe', color: '#8B5CF6', neonGlow: 'rgba(139, 92, 246, 0.8)', probability: 5 },
  { id: 16, label: 'NIENTE', icon: '❌', value: 0, type: 'nothing', color: '#0d0d1a', neonGlow: 'none', probability: 8 },
];

// CLUES for instant reveal
const INSTANT_CLUES = [
  "Il premio finale si trova in un luogo dove l'acqua incontra la terra.",
  "Cerca dove il sole tramonta sull'orizzonte europeo.",
  "La risposta è nascosta dove le montagne toccano il cielo.",
  "Un antico porto custodisce il segreto che cerchi.",
  "Segui la via delle stelle verso nord-ovest.",
  "Il tesoro riposa dove la storia incontra il presente.",
  "Cerca nell'ombra della torre più famosa.",
  "La chiave si trova dove i fiumi si incontrano.",
  "Un giardino nascosto contiene la verità.",
  "La risposta è scritta nelle pietre millenarie.",
];

interface FortuneWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'm1_fortune_wheel_last_spin';

// 🔊 AUDIO CONTEXT for immersive sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Play tick sound during spin
const playTickSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 800 + Math.random() * 400;
    osc.type = 'sine';
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Silent fail
  }
};

// Play win fanfare
const playWinSound = () => {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.4);
      
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  } catch (e) {
    // Silent fail
  }
};

// Play lose sound
const playLoseSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 200;
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.value = 0.15;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silent fail
  }
};

// Play spinning whoosh
const playSpinStartSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = 100;
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
    osc.type = 'sawtooth';
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silent fail
  }
};

export const FortuneWheel: React.FC<FortuneWheelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [showClueModal, setShowClueModal] = useState(false);
  const [revealedClue, setRevealedClue] = useState('');
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user can spin today
  useEffect(() => {
    if (isOpen) {
      const lastSpin = localStorage.getItem(STORAGE_KEY);
      if (lastSpin) {
        const lastSpinDate = new Date(lastSpin).toDateString();
        const today = new Date().toDateString();
        setCanSpin(lastSpinDate !== today);
      }
    }
  }, [isOpen]);

  // Cleanup tick interval
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  // Weighted random selection
  const getWeightedResult = useCallback(() => {
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.probability, 0);
    let random = Math.random() * totalWeight;
    
    for (const segment of WHEEL_SEGMENTS) {
      random -= segment.probability;
      if (random <= 0) return segment;
    }
    return WHEEL_SEGMENTS[0];
  }, []);

  // Award the prize
  const awardPrize = useCallback(async (segment: typeof WHEEL_SEGMENTS[0]) => {
    if (!user) return;

    try {
      switch (segment.type) {
        case 'm1u':
          const { data: profile } = await supabase
            .from('profiles')
            .select('m1_units')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            await supabase
              .from('profiles')
              .update({ m1_units: (profile.m1_units || 0) + segment.value })
              .eq('id', user.id);
            
            window.dispatchEvent(new CustomEvent('m1u-credited', {
              detail: { amount: segment.value }
            }));
          }
          break;

        case 'pe':
          const { data: peProfile } = await supabase
            .from('profiles')
            .select('pulse_energy')
            .eq('id', user.id)
            .single();
          
          if (peProfile) {
            await supabase
              .from('profiles')
              .update({ pulse_energy: (peProfile.pulse_energy || 0) + segment.value })
              .eq('id', user.id);
          }
          break;

        case 'clue':
          const randomClue = INSTANT_CLUES[Math.floor(Math.random() * INSTANT_CLUES.length)];
          setRevealedClue(randomClue);
          setTimeout(() => setShowClueModal(true), 500);
          break;

        case 'marker':
          toast.success('📍 Un marker speciale è stato aggiunto alla tua mappa!');
          break;
      }
    } catch (err) {
      console.error('[FortuneWheel] Error awarding prize:', err);
    }
  }, [user]);

  // Spin the wheel
  const handleSpin = useCallback(async () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    setResult(null);
    
    // Play start sound
    playSpinStartSound();

    // Start tick sounds with decreasing frequency
    let tickSpeed = 50;
    tickIntervalRef.current = setInterval(() => {
      playTickSound();
    }, tickSpeed);

    // Gradually slow down ticks
    const slowDownInterval = setInterval(() => {
      tickSpeed += 30;
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = setInterval(() => {
          playTickSound();
        }, tickSpeed);
      }
      if (tickSpeed > 400) {
        clearInterval(slowDownInterval);
      }
    }, 500);

    // Get result
    const winningSegment = getWeightedResult();
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === winningSegment.id);
    
    // Calculate rotation
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = segmentIndex * segmentAngle;
    const totalRotation = rotation + (360 * 6) + (360 - targetAngle) + (segmentAngle / 2);
    
    setRotation(totalRotation);

    // Wait for animation
    setTimeout(() => {
      // Clear tick sounds
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      clearInterval(slowDownInterval);
      
      setIsSpinning(false);
      setResult(winningSegment);
      
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setCanSpin(false);

      // Play result sound
      if (winningSegment.type !== 'nothing' && winningSegment.type !== 'retry') {
        playWinSound();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00FF88', '#00D1FF', '#FFD700', '#FF00FF', '#39FF14'],
        });
        
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
      } else {
        playLoseSound();
      }

      awardPrize(winningSegment);
    }, 5500);
  }, [isSpinning, canSpin, rotation, getWeightedResult, awardPrize]);

  const getResultMessage = () => {
    if (!result) return '';
    switch (result.type) {
      case 'm1u': return `🎉 HAI VINTO ${result.value} M1U!`;
      case 'pe': return `⚡ HAI VINTO ${result.value} PE!`;
      case 'clue': return '🔍 HAI VINTO UN INDIZIO!';
      case 'marker': return '📍 HAI VINTO UN MARKER!';
      case 'retry': return '🔄 RIPROVA DOMANI!';
      case 'nothing': return '❌ NIENTE QUESTA VOLTA...';
      default: return '';
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10003] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0, 20, 40, 0.98), rgba(0, 40, 60, 0.95))',
              border: '3px solid rgba(0, 255, 136, 0.6)',
              boxShadow: '0 0 100px rgba(0, 255, 136, 0.4), 0 0 200px rgba(0, 209, 255, 0.2), inset 0 0 60px rgba(0, 255, 136, 0.1)',
            }}
          >
            {/* Animated neon border */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                border: '2px solid transparent',
                background: 'linear-gradient(90deg, #00FF88, #00D1FF, #FF00FF, #FFD700, #00FF88) border-box',
                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-20"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <X className="w-6 h-6 text-white/80" />
            </button>

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="text-center mb-4">
                <motion.h2 
                  className="text-3xl font-bold mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #00FF88, #00D1FF, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(0, 255, 136, 0.5)',
                  }}
                  animate={{ textShadow: ['0 0 20px rgba(0, 255, 136, 0.5)', '0 0 40px rgba(0, 255, 136, 0.8)', '0 0 20px rgba(0, 255, 136, 0.5)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎡 RUOTA DELLA FORTUNA
                </motion.h2>
                <p className="text-white/60 text-sm">Gira una volta al giorno e vinci premi!</p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-80 h-80 mx-auto mb-6">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-[-10px] rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #00FF88, #00D1FF, #FF00FF, #FFD700, #39FF14, #00FF88)',
                    filter: 'blur(15px)',
                    opacity: 0.6,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Pointer */}
                <div 
                  className="absolute top-[-5px] left-1/2 -translate-x-1/2 z-20"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderTop: '45px solid #00FF88',
                    filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 1)) drop-shadow(0 0 40px rgba(0, 255, 136, 0.8))',
                  }}
                />

                {/* Wheel */}
                <motion.div
                  className="w-full h-full rounded-full relative overflow-hidden"
                  style={{
                    boxShadow: '0 0 50px rgba(0, 255, 136, 0.5), inset 0 0 30px rgba(0,0,0,0.8)',
                    border: '6px solid rgba(255, 255, 255, 0.3)',
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 5.5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {/* SVG Wheel with segments */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {WHEEL_SEGMENTS.map((seg, i) => {
                      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
                      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
                      const x1 = 100 + 100 * Math.cos(startAngle);
                      const y1 = 100 + 100 * Math.sin(startAngle);
                      const x2 = 100 + 100 * Math.cos(endAngle);
                      const y2 = 100 + 100 * Math.sin(endAngle);
                      
                      // Text position
                      const midAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);
                      const textX = 100 + 60 * Math.cos(midAngle);
                      const textY = 100 + 60 * Math.sin(midAngle);
                      const textRotation = (i + 0.5) * segmentAngle;

                      return (
                        <g key={seg.id}>
                          {/* Segment */}
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                            fill={seg.color}
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="0.5"
                            style={{
                              filter: seg.neonGlow !== 'none' ? `drop-shadow(0 0 5px ${seg.neonGlow})` : 'none',
                            }}
                          />
                          
                          {/* Icon & Text */}
                          <g transform={`rotate(${textRotation}, ${textX}, ${textY})`}>
                            <text
                              x={textX}
                              y={textY - 8}
                              textAnchor="middle"
                              className="text-lg"
                              style={{ fontSize: '16px' }}
                            >
                              {seg.icon}
                            </text>
                            <text
                              x={textX}
                              y={textY + 10}
                              textAnchor="middle"
                              fill={seg.type === 'nothing' || seg.type === 'retry' ? '#666' : '#fff'}
                              fontWeight="bold"
                              style={{ 
                                fontSize: '8px',
                                textShadow: seg.type !== 'nothing' && seg.type !== 'retry' ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                              }}
                            >
                              {seg.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Center circle with M1 Logo */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #00FF88, #00D1FF)',
                      boxShadow: '0 0 40px rgba(0, 255, 136, 0.8), inset 0 0 20px rgba(255,255,255,0.3)',
                      border: '4px solid rgba(255,255,255,0.6)',
                    }}
                  >
                    <motion.img
                      src="/icons/icon-m1-192x192.png"
                      alt="M1SSION"
                      className="w-14 h-14 rounded-lg"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                      }}
                      animate={isSpinning ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mb-5"
                  >
                    <p 
                      className="text-3xl font-bold"
                      style={{
                        color: result.type === 'nothing' || result.type === 'retry' ? '#FF6B6B' : '#00FF88',
                        textShadow: `0 0 30px ${result.type === 'nothing' || result.type === 'retry' ? 'rgba(255, 107, 107, 0.6)' : 'rgba(0, 255, 136, 0.8)'}`,
                      }}
                    >
                      {getResultMessage()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spin Button */}
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || !canSpin}
                whileHover={canSpin && !isSpinning ? { scale: 1.03, boxShadow: '0 0 50px rgba(0, 255, 136, 0.8)' } : {}}
                whileTap={canSpin && !isSpinning ? { scale: 0.97 } : {}}
                className="w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3"
                style={{
                  background: canSpin && !isSpinning 
                    ? 'linear-gradient(135deg, #00FF88 0%, #00D1FF 50%, #39FF14 100%)' 
                    : 'rgba(50,50,50,0.5)',
                  color: canSpin && !isSpinning ? '#000' : 'rgba(255,255,255,0.3)',
                  boxShadow: canSpin && !isSpinning ? '0 0 40px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(255,255,255,0.2)' : 'none',
                  cursor: canSpin && !isSpinning ? 'pointer' : 'not-allowed',
                  border: canSpin && !isSpinning ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(255,255,255,0.1)',
                }}
              >
                {isSpinning ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                      <RotateCcw className="w-6 h-6" />
                    </motion.div>
                    GIRANDO...
                  </>
                ) : canSpin ? (
                  <>
                    <Gift className="w-6 h-6" />
                    GIRA LA RUOTA!
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6" />
                    TORNA DOMANI
                  </>
                )}
              </motion.button>

              {!canSpin && !isSpinning && (
                <p className="text-center text-white/40 text-sm mt-3">
                  Puoi girare la ruota una volta al giorno
                </p>
              )}
            </div>
          </motion.div>

          {/* Clue Modal */}
          <AnimatePresence>
            {showClueModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10004] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.9)' }}
                onClick={() => setShowClueModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-md w-full p-8 rounded-3xl"
                  style={{
                    background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
                    border: '3px solid rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 30px rgba(255, 215, 0, 0.1)',
                  }}
                >
                  <div className="text-center">
                    <motion.div 
                      className="w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
                      }}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-5xl">🔮</span>
                    </motion.div>
                    <h3 
                      className="text-2xl font-bold mb-5"
                      style={{ 
                        color: '#FFD700',
                        textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                      }}
                    >
                      INDIZIO SVELATO!
                    </h3>
                    <p className="text-white/90 text-lg italic mb-8 leading-relaxed">"{revealedClue}"</p>
                    <motion.button
                      onClick={() => setShowClueModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl font-bold text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#000',
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
                      }}
                    >
                      CAPITO!
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FortuneWheel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
