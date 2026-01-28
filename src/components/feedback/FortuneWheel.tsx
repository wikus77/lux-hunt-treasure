/**
 * M1SSION™ Progress Wheel - Daily Progress Reveal
 * 16 segments with deterministic progression (STORE COMPLIANT)
 * NEON STYLE - AAA Game Feel
 * 
 * 🏪 STORE COMPLIANCE FIX (28/01/2026):
 * - NO random() for outcome decisions
 * - Deterministic progress-based system
 * - No win/lose language - only progress advancement
 * - Compliant with Apple App Store & Google Play guidelines
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { AudioManager } from '@/lib/audio/AudioManager';
import Analytics from '@/lib/analytics';

// 🎯 WHEEL SEGMENTS - 16 segments for progress visualization (STORE COMPLIANT)
// All segments represent progress outcomes - NO win/lose
const WHEEL_SEGMENTS = [
  { id: 1, label: '+50 M1U', icon: '👑', value: 50, type: 'm1u', color: '#1a2d4a' },   // Dark Navy
  { id: 2, label: '+5 M1U', icon: '💰', value: 5, type: 'm1u', color: '#1a1a2e' },     // Dark
  { id: 3, label: '+5 PT', icon: '📈', value: 5, type: 'progress', color: '#3a3a5a' }, // Progress Step
  { id: 4, label: '+50 PE', icon: '⚡', value: 50, type: 'pe', color: '#1a4a4a' },     // Teal
  { id: 5, label: '+50 M1U', icon: '💎', value: 50, type: 'm1u', color: '#1a3d5a' },   // Navy Blue
  { id: 6, label: '+200 PE', icon: '🔥', value: 200, type: 'pe', color: '#5a3a1a' },   // Bronze/Orange
  { id: 7, label: '+100 PE', icon: '⚡', value: 100, type: 'pe', color: '#4a1a5a' },   // Purple
  { id: 8, label: '+50 M1U', icon: '💰', value: 50, type: 'm1u', color: '#1a5a3a' },   // Green
  { id: 9, label: '+10 PT', icon: '📊', value: 10, type: 'progress', color: '#3a4a5a' }, // Progress Step
  { id: 10, label: 'DOMANI', icon: '🔄', value: 0, type: 'retry', color: '#5a5a1a' },  // Continue Tomorrow
  { id: 11, label: 'INDIZIO', icon: '🔍', value: 1, type: 'clue', color: '#1a5a2a' },  // Clue
  { id: 12, label: '+5 M1U', icon: '💰', value: 5, type: 'm1u', color: '#1a4060' },    // Blue
  { id: 13, label: 'DOMANI', icon: '🔄', value: 0, type: 'retry', color: '#5a1a5a' },  // Continue Tomorrow
  { id: 14, label: '+15 PT', icon: '📈', value: 15, type: 'progress', color: '#4a5a3a' }, // Progress Step
  { id: 15, label: '+3 M1U', icon: '💵', value: 3, type: 'm1u', color: '#3a5a1a' },    // Olive
  { id: 16, label: '+2 M1U', icon: '💵', value: 2, type: 'm1u', color: '#1a3050' },    // Steel Blue
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

// 🔧 FIX: Usa AudioManager singleton invece di AudioContext locale
// Questo previene crash su iOS Safari e memory leak

// Play tick sound during spin
const playTickSound = () => {
  try {
    // Usa AudioManager per generare tick con tono randomico
    AudioManager.playTone(800 + Math.random() * 400, 0.05, { type: 'sine', volume: 0.15 });
  } catch (e) {
    // Silent fail
  }
};

// 🎵 AAA QUALITY PROGRESS FANFARE - Milestone Achievement Style (uses AudioManager)
const playWinSound = () => {
  try {
    const ctx = AudioManager.getAudioContext();
    if (!ctx) return;
    
    // Rich chord progression: C major → E major → G major → C octave (victory!)
    const chords = [
      { notes: [261.63, 329.63, 392.00], time: 0 },
      { notes: [329.63, 415.30, 493.88], time: 0.15 },
      { notes: [392.00, 493.88, 587.33], time: 0.30 },
      { notes: [523.25, 659.25, 783.99, 1046.50], time: 0.45 },
    ];
    
    chords.forEach(chord => {
      chord.notes.forEach((freq, noteIndex) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.detune.value = (noteIndex - 1) * 3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + chord.time + 0.02);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + chord.time + 0.15);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + chord.time + 0.5);
        osc.start(ctx.currentTime + chord.time);
        osc.stop(ctx.currentTime + chord.time + 0.6);
      });
    });
    
    // Shimmering high notes
    [1318.51, 1567.98, 2093.00].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5 + i * 0.08);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7 + i * 0.08);
      osc.start(ctx.currentTime + 0.5 + i * 0.08);
      osc.stop(ctx.currentTime + 0.9 + i * 0.08);
    });
  } catch (e) {
    // Silent fail
  }
};

// 🔇 AAA QUALITY COMPLETION SOUND - Neutral tone for daily completion (uses AudioManager)
// NOTE: Kept for backward compatibility but not used in store-compliant version
const playCompletionSound = () => {
  try {
    const ctx = AudioManager.getAudioContext();
    if (!ctx) return;
    
    const notes = [
      { freq: 350, time: 0 },
      { freq: 300, time: 0.2 },
      { freq: 200, time: 0.4 },
    ];
    
    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + time + 0.15);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time + 0.25);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.3);
    });
    
    // Bass thud
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.frequency.value = 80;
    bass.type = 'sine';
    bassGain.gain.value = 0;
    bassGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.65);
    bassGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
    bass.start(ctx.currentTime + 0.6);
    bass.stop(ctx.currentTime + 1);
  } catch (e) {
    // Silent fail
  }
};

// Play spinning whoosh (uses AudioManager)
const playSpinStartSound = () => {
  try {
    const ctx = AudioManager.getAudioContext();
    if (!ctx) return;
    
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

// 🏪 Server-side progress result interface (STORE COMPLIANT)
interface ProgressResult {
  status: 'success' | 'already_completed_today' | 'error';
  interaction_id?: string;
  segment_id?: number;
  progress_gain?: number;
  total_progress?: number;
  milestone_reached?: boolean;
  milestone_level?: number;
  reward_type?: string;
  reward_value?: number;
  message?: string;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClueModal, setShowClueModal] = useState(false);
  const [revealedClue, setRevealedClue] = useState('');
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🏪 Store progress result for tracking (STORE COMPLIANT)
  const progressResultRef = useRef<ProgressResult | null>(null);

  // 🏪 STORE COMPLIANT: Check via server-side RPC (deterministic progress)
  useEffect(() => {
    const checkCanInteract = async () => {
      if (!isOpen) {
        setIsLoading(false);
        return;
      }

      // Track progress wheel viewed
      Analytics.track('progress_wheel_viewed', { user_logged_in: !!user });

      // 🏪 SERVER-SIDE CHECK via RPC (deterministic progress system)
      if (user) {
        try {
          const { data, error } = await supabase.rpc('check_wheel_progress_today');
          
          if (error) {
            console.error('[ProgressWheel] RPC check failed:', error);
            // Fallback to localStorage for UX
            const today = new Date().toDateString();
            const localLastInteraction = localStorage.getItem(STORAGE_KEY);
            if (localLastInteraction) {
              const localLastDate = new Date(localLastInteraction).toDateString();
              setCanSpin(localLastDate !== today);
            } else {
              setCanSpin(true);
            }
          } else {
            setCanSpin(data?.can_interact === true);
            
            // Sync localStorage with server state
            if (!data?.can_interact) {
              localStorage.setItem(STORAGE_KEY, new Date().toISOString());
            }
          }
        } catch (err) {
          console.error('[ProgressWheel] Check failed:', err);
          setCanSpin(false);
        }
      } else {
        // Non-authenticated: use localStorage only
        const today = new Date().toDateString();
        const localLastInteraction = localStorage.getItem(STORAGE_KEY);
        if (localLastInteraction) {
          const localLastDate = new Date(localLastInteraction).toDateString();
          setCanSpin(localLastDate !== today);
        } else {
          setCanSpin(true);
        }
      }
      
      setIsLoading(false);
    };

    if (isOpen) {
      setIsLoading(true);
      checkCanInteract();
    }
  }, [isOpen, user]);

  // Cleanup tick interval
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  // 🔒 REMOVED: getWeightedResult (now server-side only)
  // 🔒 REMOVED: awardPrize (now server-side only via RPC)

  // Handle CLUE reward display (server determined this was a clue win)
  const showClueReward = useCallback(() => {
    const randomClue = INSTANT_CLUES[Math.floor(Math.random() * INSTANT_CLUES.length)];
    setRevealedClue(randomClue);
    setTimeout(() => setShowClueModal(true), 500);
  }, []);

  // 🔒 AAA+ SECURE: Spin the wheel via server-side RPC
  const handleSpin = useCallback(async () => {
    if (isSpinning || !canSpin || !user) return;

    // Track spin started
    const spinId = `spin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    Analytics.track('wheel_spin_started', { 
      spin_id: spinId 
    }, { dedupe_key: `wheel:spin:${spinId}` });

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

    // 🏪 CALL SERVER-SIDE RPC - Deterministic progress (STORE COMPLIANT)
    let serverResult: ProgressResult | null = null;
    try {
      const { data, error } = await supabase.rpc('execute_wheel_progress');
      
      if (error) {
        console.error('[ProgressWheel] RPC execute_wheel_progress failed:', error);
        toast.error('Errore durante lo spin. Riprova.');
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        clearInterval(slowDownInterval);
        return;
      }
      
      serverResult = data as SpinResult;
      spinResultRef.current = serverResult;
      
      // Handle already completed today (race condition protection)
      if (serverResult.status === 'already_completed_today') {
        toast.info('Progressione giornaliera completata. Torna domani!');
        setCanSpin(false);
        setIsSpinning(false);
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        clearInterval(slowDownInterval);
        return;
      }
      
      if (serverResult.status !== 'success' || !serverResult.segment_id) {
        console.error('[FortuneWheel] Unexpected server response:', serverResult);
        toast.error('Errore imprevisto. Riprova.');
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        clearInterval(slowDownInterval);
        return;
      }
      
    } catch (err) {
      console.error('[FortuneWheel] RPC call failed:', err);
      toast.error('Errore di connessione. Riprova.');
      setIsSpinning(false);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      clearInterval(slowDownInterval);
      return;
    }

    // 🎡 Animate wheel to server-determined segment
    const segmentIndex = serverResult.segment_id - 1; // segment_id is 1-based
    const winningSegment = WHEEL_SEGMENTS[segmentIndex] || WHEEL_SEGMENTS[0];
    
    // Calculate rotation
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const segmentCenterAngle = (segmentIndex + 0.5) * segmentAngle;
    const rotationToWin = 360 - segmentCenterAngle;
    const totalRotation = rotation + (360 * 6) + rotationToWin;
    
    setRotation(totalRotation);

    // Wait for animation to complete
    setTimeout(async () => {
      // Clear tick sounds
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      clearInterval(slowDownInterval);
      
      setIsSpinning(false);
      setResult(winningSegment);
      
      // Sync localStorage
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setCanSpin(false);

      // Track spin completed with server result
      Analytics.track('wheel_spin_completed', {
        spin_id: serverResult!.spin_id,
        segment_id: serverResult!.segment_id,
        reward_type: serverResult!.reward_type,
        reward_value: serverResult!.reward_value,
        reward_label: serverResult!.reward_label,
      }, { dedupe_key: `wheel:complete:${serverResult!.spin_id}` });

      // Play result sound based on server-determined outcome
      if (serverResult!.reward_type !== 'nothing' && serverResult!.reward_type !== 'retry') {
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

        // 🔒 Reward already assigned server-side - just notify UI
        if (serverResult!.reward_type === 'm1u' && serverResult!.reward_value) {
          window.dispatchEvent(new CustomEvent('m1u-credited', {
            detail: { amount: serverResult!.reward_value }
          }));
        }
        
        // Track reward assigned (server-side confirmed)
        if (serverResult!.reward_value && serverResult!.reward_value > 0) {
          Analytics.track('wheel_reward_assigned', {
            spin_id: serverResult!.spin_id,
            reward_type: serverResult!.reward_type,
            reward_value: serverResult!.reward_value,
          }, { dedupe_key: `wheel:reward:${serverResult!.spin_id}` });
        }
      } else {
        // Play completion sound (no lose state in progress system)
        playWinSound(); // All progress is positive
      }

      // Handle CLUE display (server already recorded the progress)
      if (serverResult!.reward_type === 'clue') {
        showClueReward();
      }

    }, 5500);
  }, [isSpinning, canSpin, rotation, user, showClueReward]);

  // 🏪 STORE COMPLIANT: Progress-based messaging (no win/lose)
  const getResultMessage = () => {
    if (!result) return '';
    switch (result.type) {
      case 'm1u': return `🎉 +${result.value} M1U sbloccati!`;
      case 'pe': return `⚡ +${result.value} PE sbloccati!`;
      case 'clue': return '🔍 Indizio rivelato!';
      case 'marker': return '📍 Marker sbloccato!';
      case 'progress': return `📈 +${result.value} punti progressione!`;
      case 'retry': return '🔄 Continua domani!';
      default: return '✨ Progressione completata!';
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  // 🎯 SEGMENT COLORS - VIVID AAA QUALITY (progress visualization)
  const SEGMENT_COLORS = [
    '#1a3554', // 1. +50 M1U - Deep Navy Blue
    '#151825', // 2. +5 M1U - Charcoal Dark
    '#3a4858', // 3. +5 PT - Progress Blue
    '#187070', // 4. +50 PE - Vivid Teal
    '#1a3858', // 5. +50 M1U - Ocean Blue
    '#8a5520', // 6. +200 PE - Burnt Orange/Gold
    '#5a2875', // 7. +100 PE - Royal Purple
    '#1a5848', // 8. +50 M1U - Forest Green
    '#3a5868', // 9. +10 PT - Progress Teal
    '#a08828', // 10. DOMANI - Mustard Yellow
    '#1a6848', // 11. INDIZIO - Emerald Green
    '#1a4878', // 12. +5 M1U - Cobalt Blue
    '#682868', // 13. DOMANI - Magenta Purple
    '#4a6838', // 14. +15 PT - Progress Green
    '#4a6828', // 15. +3 M1U - Lime Olive
    '#1a3858', // 16. 2 M1U - Steel Blue
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
          {/* 🌃 M1SSION APP GRADIENT BACKGROUND - EXACT same as main app */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 1200px 800px at 85% -10%, rgba(0, 229, 255, 0.35), transparent 50%),
                radial-gradient(ellipse 1000px 700px at -15% 25%, rgba(123, 46, 255, 0.30), transparent 50%),
                radial-gradient(ellipse 800px 500px at 50% 90%, rgba(252, 30, 255, 0.15), transparent 45%),
                linear-gradient(180deg, #0a0b0f 0%, #0c0e14 25%, #0e1118 50%, #0a0c10 75%, #080a0d 100%)
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

                {/* 🔵 LED Ring - 3D DEPTH outer decorative lights */}
                <div className="absolute inset-[-10px]">
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 15) * (Math.PI / 180);
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);
                    const isEven = i % 2 === 0;
                    return (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '14px',
                          height: '14px',
                        }}
                      >
                        {/* LED 3D Base/Socket */}
                        <div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(145deg, #4a5a6a 0%, #2a3a4a 50%, #1a2a3a 100%)',
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
                          }}
                        />
                        {/* LED 3D Bulb */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            top: '2px',
                            left: '2px',
                            right: '2px',
                            bottom: '2px',
                            background: `radial-gradient(ellipse 80% 60% at 30% 30%, ${isEven ? '#80FFFF' : '#A0D0FF'} 0%, ${isEven ? '#00D1FF' : '#4DA8FF'} 50%, ${isEven ? '#0090B0' : '#3080C0'} 100%)`,
                            boxShadow: `
                              0 0 10px ${isEven ? '#00D1FF' : '#4DA8FF'},
                              0 0 20px ${isEven ? 'rgba(0, 209, 255, 0.6)' : 'rgba(77, 168, 255, 0.6)'},
                              inset 0 2px 3px rgba(255,255,255,0.6),
                              inset 0 -1px 3px rgba(0,0,0,0.3)
                            `,
                          }}
                          animate={{
                            opacity: [0.7, 1, 0.7],
                            boxShadow: [
                              `0 0 8px ${isEven ? '#00D1FF' : '#4DA8FF'}, 0 0 16px ${isEven ? 'rgba(0, 209, 255, 0.4)' : 'rgba(77, 168, 255, 0.4)'}, inset 0 2px 3px rgba(255,255,255,0.6)`,
                              `0 0 15px ${isEven ? '#00D1FF' : '#4DA8FF'}, 0 0 30px ${isEven ? 'rgba(0, 209, 255, 0.8)' : 'rgba(77, 168, 255, 0.8)'}, inset 0 2px 3px rgba(255,255,255,0.8)`,
                              `0 0 8px ${isEven ? '#00D1FF' : '#4DA8FF'}, 0 0 16px ${isEven ? 'rgba(0, 209, 255, 0.4)' : 'rgba(77, 168, 255, 0.4)'}, inset 0 2px 3px rgba(255,255,255,0.6)`,
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.08,
                          }}
                        />
                      </motion.div>
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

                {/* ⬆️ TOP POINTER - 3D Glowing cyan triangle - PERFECTLY CENTERED */}
                <div 
                  className="absolute z-30"
                  style={{
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '36px',
                    height: '36px',
                  }}
                >
                  {/* 3D Triangle shadow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '18px solid transparent',
                      borderRight: '18px solid transparent',
                      borderTop: '32px solid rgba(0, 50, 80, 0.7)',
                      filter: 'blur(3px)',
                    }}
                  />
                  {/* 3D Triangle body - base layer */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '18px solid transparent',
                      borderRight: '18px solid transparent',
                      borderTop: '32px solid #005070',
                    }}
                  />
                  {/* 3D Triangle body - main cyan */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '16px solid transparent',
                      borderRight: '16px solid transparent',
                      borderTop: '29px solid #00B8E0',
                      filter: 'drop-shadow(0 0 15px rgba(0, 209, 255, 0.9))',
                    }}
                  />
                  {/* 3D Triangle highlight */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderTop: '20px solid #60E8FF',
                    }}
                  />
                  {/* Top gem/light - centered */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse 60% 40% at 30% 30%, #FFFFFF 0%, #80FFFF 40%, #00D1FF 100%)',
                      boxShadow: '0 0 10px #00FFFF, 0 0 20px rgba(0, 255, 255, 0.7), inset 0 1px 2px rgba(255,255,255,0.8)',
                    }}
                    animate={{ 
                      boxShadow: [
                        '0 0 10px #00FFFF, 0 0 20px rgba(0, 255, 255, 0.5)',
                        '0 0 20px #00FFFF, 0 0 40px rgba(0, 255, 255, 0.8)',
                        '0 0 10px #00FFFF, 0 0 20px rgba(0, 255, 255, 0.5)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* 🎡 THE WHEEL - AAA Quality Rotating Wheel */}
                <motion.div
                  className="absolute inset-[6px] rounded-full overflow-hidden"
                  style={{
                    boxShadow: `
                      inset 0 0 50px rgba(0, 0, 0, 0.9),
                      inset 0 0 20px rgba(0, 50, 100, 0.3),
                      0 0 30px rgba(0, 100, 200, 0.2)
                    `,
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ duration: 5.5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {/* SVG Wheel - AAA QUALITY with text PARALLEL to dividers */}
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      {/* 3D Depth gradients for each segment - radial from center */}
                      {WHEEL_SEGMENTS.map((seg, i) => {
                        const baseColor = SEGMENT_COLORS[i];
                        return (
                          <radialGradient key={`grad-${i}`} id={`seg-grad-${i}`} cx="50%" cy="50%" r="70%" fx="30%" fy="30%">
                            <stop offset="0%" stopColor={baseColor} stopOpacity="0.95" />
                            <stop offset="40%" stopColor={baseColor} stopOpacity="1" />
                            <stop offset="85%" stopColor={baseColor} stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#050510" stopOpacity="0.9" />
                          </radialGradient>
                        );
                      })}
                      
                      {/* Glossy highlight overlay */}
                      <radialGradient id="wheelGloss" cx="30%" cy="30%" r="60%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </radialGradient>
                      
                      {/* Inner shadow */}
                      <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
                        <stop offset="70%" stopColor="transparent" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                      </radialGradient>
                    </defs>
                    
                    {WHEEL_SEGMENTS.map((seg, i) => {
                      const startAngleDeg = i * segmentAngle - 90;
                      const endAngleDeg = (i + 1) * segmentAngle - 90;
                      const startAngle = startAngleDeg * (Math.PI / 180);
                      const endAngle = endAngleDeg * (Math.PI / 180);
                      
                      // Outer radius
                      const outerR = 195;
                      const innerR = 60;
                      
                      const x1 = 200 + outerR * Math.cos(startAngle);
                      const y1 = 200 + outerR * Math.sin(startAngle);
                      const x2 = 200 + outerR * Math.cos(endAngle);
                      const y2 = 200 + outerR * Math.sin(endAngle);
                      
                      // TEXT PARALLEL TO DIVIDER LINE (along the radius)
                      // Position text along a line from center outward
                      const midAngleDeg = startAngleDeg + segmentAngle * 0.5;
                      const textAngleRad = midAngleDeg * (Math.PI / 180);
                      
                      // Text positioned at ~70% from center to edge for visibility
                      const textRadius = 145;
                      const textX = 200 + textRadius * Math.cos(textAngleRad);
                      const textY = 200 + textRadius * Math.sin(textAngleRad);
                      
                      // Rotate text to be readable - always pointing outward from center
                      // For segments on right side (angle 0-180): text reads from center out
                      // For segments on left side (angle 180-360): flip 180° so text reads from center out
                      let textRotation = midAngleDeg;
                      // Normalize angle to 0-360
                      const normalizedAngle = ((midAngleDeg % 360) + 360) % 360;
                      // If text would be upside down (pointing down-left), flip it
                      if (normalizedAngle > 90 && normalizedAngle < 270) {
                        textRotation += 180;
                      }

                      // Text colors - matching Image B
                      const getTextColor = () => {
                        if (seg.type === 'nothing') return '#FF5555';
                        if (seg.type === 'retry') return '#FFDD44';
                        if (seg.type === 'pe') return '#FF9944';
                        if (seg.type === 'clue') return '#44FFAA';
                        return '#FFFFFF';
                      };
                      const textColor = getTextColor();

                      return (
                        <g key={seg.id}>
                          {/* Segment with 3D gradient */}
                          <path
                            d={`M 200 200 L ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} Z`}
                            fill={`url(#seg-grad-${i})`}
                          />
                          
                          {/* Segment edge highlight (3D effect) */}
                          <path
                            d={`M 200 200 L ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} Z`}
                            fill="none"
                            stroke="rgba(150, 180, 220, 0.4)"
                            strokeWidth="1.5"
                          />
                          
                          {/* TEXT - LARGE, BOLD, READABLE FROM CENTER OUTWARD */}
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                            fill={textColor}
                            fontWeight="900"
                            fontFamily="'SF Pro Display', 'Inter', -apple-system, sans-serif"
                            fontSize="20"
                            letterSpacing="0.5"
                            paintOrder="stroke"
                            stroke="rgba(0,0,0,0.9)"
                            strokeWidth="4"
                            strokeLinejoin="round"
                            style={{
                              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
                            }}
                          >
                            {seg.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Glossy overlay for 3D depth */}
                    <circle cx="200" cy="200" r="195" fill="url(#wheelGloss)" />
                    
                    {/* Inner shadow ring */}
                    <circle cx="200" cy="200" r="195" fill="url(#innerShadow)" />
                    
                    {/* Chrome ring around wheel */}
                    <circle 
                      cx="200" cy="200" r="196" 
                      fill="none" 
                      stroke="url(#wheelGloss)"
                      strokeWidth="4"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                    />
                  </svg>

                  {/* 🔘 CHROME CENTER HUB - Photorealistic Brushed Metal */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(ellipse 120% 80% at 25% 25%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
                        radial-gradient(ellipse 100% 60% at 75% 75%, rgba(30, 50, 80, 0.5) 0%, transparent 35%),
                        conic-gradient(from 0deg at 50% 50%, 
                          #8aa8c8 0deg, 
                          #5a7898 30deg,
                          #4a6888 60deg,
                          #3a5878 90deg,
                          #5a7898 120deg,
                          #7a98b8 150deg,
                          #9ab8d8 180deg,
                          #7a98b8 210deg,
                          #5a7898 240deg,
                          #3a5878 270deg,
                          #4a6888 300deg,
                          #6a88a8 330deg,
                          #8aa8c8 360deg
                        )
                      `,
                      boxShadow: `
                        0 0 40px rgba(0, 150, 255, 0.3),
                        0 0 80px rgba(0, 100, 200, 0.15),
                        inset 0 4px 12px rgba(255,255,255,0.5),
                        inset 0 -6px 16px rgba(0,0,0,0.6),
                        0 8px 30px rgba(0,0,0,0.5)
                      `,
                      border: '4px solid rgba(160, 190, 220, 0.6)',
                    }}
                  >
                    {/* Inner ring detail */}
                    <div 
                      className="absolute inset-[4px] rounded-full"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    />
                    {/* M1 Logo */}
                    <motion.img
                      src="/icons/icon-m1-192x192.png"
                      alt="M1SSION"
                      className="w-11 h-11 rounded-lg relative z-10"
                      style={{
                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))',
                      }}
                      animate={isSpinning ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* 🏆 M1SSION Logo under wheel - matching official branding */}
              <div className="mt-5 text-center">
                <span 
                  className="text-4xl font-black tracking-tight"
                  style={{
                    fontFamily: "'SF Pro Display', 'Inter', -apple-system, system-ui, sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  {/* M1 in Cyan */}
                  <span 
                    style={{
                      color: '#00D1FF',
                      textShadow: '0 0 20px rgba(0, 209, 255, 0.6), 0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    M1
                  </span>
                  {/* SSION in White */}
                  <span 
                    style={{
                      color: '#FFFFFF',
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    SSION
                  </span>
                </span>
              </div>

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
                    AVANZA
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
