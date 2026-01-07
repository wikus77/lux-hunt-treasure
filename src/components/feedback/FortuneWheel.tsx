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

  // 🎰 PHOTOREALISTIC 3D WHEEL COLORS - Casino/AAA Style
  const WHEEL_3D_COLORS = [
    { bg: 'linear-gradient(180deg, #1a3a4a 0%, #0d2530 50%, #051520 100%)', text: '#00D1FF' },  // Dark Teal
    { bg: 'linear-gradient(180deg, #2d1f3d 0%, #1a1228 50%, #0f0a18 100%)', text: '#BF00FF' },  // Dark Purple
    { bg: 'linear-gradient(180deg, #3d2a1a 0%, #2a1d12 50%, #1a100a 100%)', text: '#FFB347' },  // Dark Bronze
    { bg: 'linear-gradient(180deg, #1a2d3d 0%, #12202a 50%, #0a1520 100%)', text: '#4DA8FF' },  // Dark Blue
    { bg: 'linear-gradient(180deg, #2d3d1a 0%, #1e2a12 50%, #121a0a 100%)', text: '#8AE65C' },  // Dark Olive
    { bg: 'linear-gradient(180deg, #3d1a2d 0%, #2a121e 50%, #1a0a12 100%)', text: '#FF6B9D' },  // Dark Rose
    { bg: 'linear-gradient(180deg, #1a3d3d 0%, #122a2a 50%, #0a1a1a 100%)', text: '#5CE6E6' },  // Dark Cyan
    { bg: 'linear-gradient(180deg, #3d3d1a 0%, #2a2a12 50%, #1a1a0a 100%)', text: '#FFE066' },  // Dark Gold
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10003] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 🌃 CINEMATIC NIGHT BACKGROUND */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 50% 120%, rgba(0, 50, 80, 0.4) 0%, transparent 60%),
                radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 100, 150, 0.15) 0%, transparent 50%),
                linear-gradient(180deg, #030810 0%, #0a1525 30%, #051018 70%, #020508 100%)
              `,
            }}
          />
          
          {/* 🌨️ Particle snow effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: 'rgba(150, 200, 255, 0.6)',
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 50 - 25],
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* 🏙️ Cityscape silhouette hint */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,20,40,0.9) 0%, transparent 100%)',
              maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            }}
          />

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center z-30"
              style={{ 
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(100, 180, 255, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            {/* Content */}
            <div className="relative flex flex-col items-center">
              
              {/* ═══════════════════════════════════════════
                  🎰 PHOTOREALISTIC 3D WHEEL
                  ═══════════════════════════════════════════ */}
              <div className="relative w-[340px] h-[340px]">
                
                {/* 💫 Outer glow - cold blue neon */}
                <div 
                  className="absolute inset-[-20px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 180, 255, 0.15) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                />

                {/* 🔵 LED Ring - outer decorative lights */}
                <div className="absolute inset-[-8px]">
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 15) * (Math.PI / 180);
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          background: i % 2 === 0 ? '#00D1FF' : '#4DA8FF',
                          boxShadow: `0 0 8px ${i % 2 === 0 ? '#00D1FF' : '#4DA8FF'}, 0 0 16px ${i % 2 === 0 ? 'rgba(0, 209, 255, 0.6)' : 'rgba(77, 168, 255, 0.6)'}`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [0.8, 1.1, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.08,
                        }}
                      />
                    );
                  })}
                </div>

                {/* 🔘 Chrome outer ring */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(60, 80, 100, 0.9) 0%,
                        rgba(30, 45, 60, 0.95) 25%,
                        rgba(20, 35, 50, 1) 50%,
                        rgba(40, 60, 80, 0.95) 75%,
                        rgba(50, 70, 90, 0.9) 100%
                      )
                    `,
                    boxShadow: `
                      0 0 40px rgba(0, 150, 255, 0.3),
                      inset 0 2px 4px rgba(255,255,255,0.1),
                      inset 0 -2px 4px rgba(0,0,0,0.4)
                    `,
                    border: '4px solid rgba(100, 150, 200, 0.4)',
                  }}
                />

                {/* ⬆️ TOP POINTER - Glowing cyan triangle */}
                <div 
                  className="absolute top-[-12px] left-1/2 -translate-x-1/2 z-30"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '16px solid transparent',
                    borderRight: '16px solid transparent',
                    borderTop: '28px solid #00D1FF',
                    filter: 'drop-shadow(0 0 12px rgba(0, 209, 255, 0.9)) drop-shadow(0 4px 8px rgba(0, 209, 255, 0.6))',
                  }}
                />
                {/* Pointer glow dot */}
                <motion.div 
                  className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-30"
                  style={{
                    background: '#00FFFF',
                    boxShadow: '0 0 15px #00FFFF, 0 0 30px rgba(0, 255, 255, 0.5)',
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />

                {/* 🎡 THE WHEEL - Rotating part */}
                <motion.div
                  className="absolute inset-[8px] rounded-full overflow-hidden"
                  style={{
                    boxShadow: `
                      inset 0 0 60px rgba(0, 0, 0, 0.8),
                      inset 0 0 20px rgba(0, 100, 150, 0.2)
                    `,
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 5.5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {/* SVG Wheel with 3D-style segments */}
                  <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}>
                    <defs>
                      {/* Metallic gradients for each segment */}
                      {WHEEL_SEGMENTS.map((seg, i) => {
                        const colorSet = WHEEL_3D_COLORS[i % WHEEL_3D_COLORS.length];
                        return (
                          <linearGradient key={`grad-${i}`} id={`segment-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={seg.type === 'nothing' || seg.type === 'retry' ? '#151520' : `${colorSet.text}22`} />
                            <stop offset="50%" stopColor={seg.type === 'nothing' || seg.type === 'retry' ? '#0a0a12' : '#0a1520'} />
                            <stop offset="100%" stopColor={seg.type === 'nothing' || seg.type === 'retry' ? '#050508' : '#051015'} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    
                    {WHEEL_SEGMENTS.map((seg, i) => {
                      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
                      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
                      const x1 = 100 + 98 * Math.cos(startAngle);
                      const y1 = 100 + 98 * Math.sin(startAngle);
                      const x2 = 100 + 98 * Math.cos(endAngle);
                      const y2 = 100 + 98 * Math.sin(endAngle);
                      
                      // Text position - closer to edge for readability
                      const midAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);
                      const textX = 100 + 68 * Math.cos(midAngle);
                      const textY = 100 + 68 * Math.sin(midAngle);
                      const textRotation = (i + 0.5) * segmentAngle;
                      const colorSet = WHEEL_3D_COLORS[i % WHEEL_3D_COLORS.length];

                      return (
                        <g key={seg.id}>
                          {/* Segment with gradient */}
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 98 98 0 0 1 ${x2} ${y2} Z`}
                            fill={`url(#segment-grad-${i})`}
                            stroke="rgba(100, 150, 200, 0.3)"
                            strokeWidth="0.8"
                          />
                          
                          {/* Segment inner highlight */}
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 98 98 0 0 1 ${x2} ${y2} Z`}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.3"
                          />
                          
                          {/* Text label */}
                          <g transform={`rotate(${textRotation}, ${textX}, ${textY})`}>
                            <text
                              x={textX}
                              y={textY + 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={seg.type === 'nothing' || seg.type === 'retry' ? '#4a5568' : colorSet.text}
                              fontWeight="700"
                              fontFamily="system-ui, -apple-system, sans-serif"
                              style={{ 
                                fontSize: '9px',
                                letterSpacing: '0.5px',
                                textShadow: seg.type !== 'nothing' && seg.type !== 'retry' 
                                  ? `0 0 8px ${colorSet.text}, 0 0 16px ${colorSet.text}50` 
                                  : 'none',
                              }}
                            >
                              {seg.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Radial divider lines */}
                    {WHEEL_SEGMENTS.map((_, i) => {
                      const angle = (i * segmentAngle - 90) * (Math.PI / 180);
                      const x = 100 + 98 * Math.cos(angle);
                      const y = 100 + 98 * Math.sin(angle);
                      return (
                        <line 
                          key={`line-${i}`}
                          x1="100" y1="100" x2={x} y2={y}
                          stroke="rgba(100, 150, 200, 0.25)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* 🔘 CHROME CENTER HUB */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(ellipse 80% 50% at 30% 30%, rgba(200, 220, 240, 0.4) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 70% 70%, rgba(50, 80, 120, 0.3) 0%, transparent 50%),
                        linear-gradient(145deg, 
                          #5a7a9a 0%, 
                          #3a5570 20%,
                          #2a4055 40%,
                          #1a3045 60%,
                          #2a4560 80%,
                          #4a6580 100%
                        )
                      `,
                      boxShadow: `
                        0 0 30px rgba(0, 150, 255, 0.3),
                        inset 0 2px 6px rgba(255,255,255,0.3),
                        inset 0 -3px 8px rgba(0,0,0,0.5),
                        0 4px 12px rgba(0,0,0,0.5)
                      `,
                      border: '3px solid rgba(150, 180, 210, 0.4)',
                    }}
                  >
                    {/* M1 Logo */}
                    <motion.img
                      src="/icons/icon-m1-192x192.png"
                      alt="M1SSION"
                      className="w-12 h-12 rounded-lg"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                      }}
                      animate={isSpinning ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* 🏆 WINNER text glow under wheel */}
              <motion.div 
                className="mt-4 text-center"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span 
                  className="text-3xl font-black tracking-[0.3em]"
                  style={{
                    color: '#00D1FF',
                    textShadow: '0 0 20px rgba(0, 209, 255, 0.8), 0 0 40px rgba(0, 209, 255, 0.4), 0 2px 4px rgba(0,0,0,0.5)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  M1SSION
                </span>
              </motion.div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mt-4 mb-2"
                  >
                    <p 
                      className="text-2xl font-bold"
                      style={{
                        color: result.type === 'nothing' || result.type === 'retry' ? '#FF6B6B' : '#00FFCC',
                        textShadow: `0 0 20px ${result.type === 'nothing' || result.type === 'retry' ? 'rgba(255, 107, 107, 0.6)' : 'rgba(0, 255, 204, 0.8)'}`,
                      }}
                    >
                      {getResultMessage()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spin Button - Premium Style */}
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || !canSpin}
                whileHover={canSpin && !isSpinning ? { scale: 1.02, boxShadow: '0 0 40px rgba(0, 209, 255, 0.6)' } : {}}
                whileTap={canSpin && !isSpinning ? { scale: 0.98 } : {}}
                className="w-full max-w-xs py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mt-4"
                style={{
                  background: canSpin && !isSpinning 
                    ? 'linear-gradient(135deg, #00B4D8 0%, #0077B6 50%, #023E8A 100%)' 
                    : 'rgba(30,40,50,0.8)',
                  color: canSpin && !isSpinning ? '#fff' : 'rgba(255,255,255,0.3)',
                  boxShadow: canSpin && !isSpinning 
                    ? '0 0 30px rgba(0, 180, 216, 0.4), inset 0 1px 2px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)' 
                    : 'none',
                  cursor: canSpin && !isSpinning ? 'pointer' : 'not-allowed',
                  border: canSpin && !isSpinning ? '1px solid rgba(0, 209, 255, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                  textShadow: canSpin && !isSpinning ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {isSpinning ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                    GIRANDO...
                  </>
                ) : canSpin ? (
                  <>
                    <Gift className="w-5 h-5" />
                    GIRA LA RUOTA
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    TORNA DOMANI
                  </>
                )}
              </motion.button>

              {!canSpin && !isSpinning && (
                <p className="text-center text-white/40 text-xs mt-2">
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
