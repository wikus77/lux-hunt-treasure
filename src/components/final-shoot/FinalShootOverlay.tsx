// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT OVERLAY v9 - CINEMATIC VICTORY EDITION

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Target, Trophy, XCircle, Star, Crown, Sparkles } from 'lucide-react';
import { useFinalShootContext } from './FinalShootContext';
import maplibregl from 'maplibre-gl';
import confetti from 'canvas-confetti';

interface FinalShootOverlayProps {
  map: maplibregl.Map | null;
}

const FinalShootOverlay: React.FC<FinalShootOverlayProps> = ({ map }) => {
  const ctx = useFinalShootContext();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [phase, setPhase] = useState<'idle' | 'suspense' | 'result'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ isWinner: boolean; hint: string } | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const beatTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ========== CLEANUP ==========
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (beatTimerRef.current) { clearTimeout(beatTimerRef.current); beatTimerRef.current = null; }
    if (audioCtxRef.current) { 
      try { audioCtxRef.current.close(); } catch {} 
      audioCtxRef.current = null; 
    }
  }, []);

  // ========== HEARTBEAT SONORO (TENSIONE) ==========
  const progressRef = useRef(0);
  
  const playBeat = useCallback(() => {
    const p = progressRef.current;
    if (p >= 1) return;
    
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      
      // Deep cinematic heartbeat
      osc.type = 'sine';
      const freq = 35 + p * 80;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ac.currentTime + 0.15);
      
      const vol = 0.15 + p * 0.4;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.25);
      
      setTimeout(() => ac.close(), 400);
      
      if ('vibrate' in navigator) navigator.vibrate(20 + Math.floor(p * 50));
    } catch {}
    
    const interval = Math.max(80, 600 - p * 520);
    if (p < 1) {
      beatTimerRef.current = window.setTimeout(playBeat, interval);
    }
  }, []);
  
  const startHeartbeat = useCallback(() => {
    progressRef.current = 0;
    playBeat();
  }, [playBeat]);

  // ========== EPIC CINEMATIC WIN SOUND ==========
  const playWinSound = useCallback(() => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain
      const masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(0.5, ac.currentTime);
      masterGain.connect(ac.destination);
      
      // Reverb simulation
      const convolver = ac.createConvolver();
      const reverbLength = 2;
      const reverbBuffer = ac.createBuffer(2, ac.sampleRate * reverbLength, ac.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        }
      }
      convolver.buffer = reverbBuffer;
      
      const reverbGain = ac.createGain();
      reverbGain.gain.setValueAtTime(0.3, ac.currentTime);
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);

      // Helper to play orchestral notes
      const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', vol: number = 0.15) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime + startTime);
        
        // ADSR envelope
        gain.gain.setValueAtTime(0, ac.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startTime + 0.05);
        gain.gain.setValueAtTime(vol * 0.8, ac.currentTime + startTime + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(ac.currentTime + startTime);
        osc.stop(ac.currentTime + startTime + duration + 0.1);
      };

      // Helper for chord
      const playChord = (freqs: number[], startTime: number, duration: number, type: OscillatorType = 'sine', vol: number = 0.12) => {
        freqs.forEach((f, i) => playNote(f, startTime, duration, type, vol / (i === 0 ? 1 : 1.5)));
      };

      // ========== EPIC ORCHESTRAL FANFARE ==========
      
      // Opening brass-like hit (C major power)
      playChord([130.81, 261.63, 329.63, 392, 523.25], 0, 0.6, 'sawtooth', 0.15);
      
      // Sub bass impact
      playNote(65.41, 0, 1.2, 'sine', 0.25);
      
      // Rising strings (arpeggiated)
      [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => {
        playNote(f, 0.1 + i * 0.08, 0.8 - i * 0.1, 'triangle', 0.08);
      });
      
      // Timpani-like hits
      [0.5, 0.7].forEach(t => playNote(98, t, 0.3, 'sine', 0.2));
      
      // Main triumphant melody (G major → C major resolution)
      // First phrase
      playChord([392, 493.88, 587.33], 0.8, 0.4, 'sawtooth', 0.12); // G
      playChord([440, 554.37, 659.25], 1.2, 0.4, 'sawtooth', 0.12); // A
      playChord([493.88, 622.25, 739.99], 1.6, 0.5, 'sawtooth', 0.14); // B
      
      // Climax - C major with full orchestra
      playChord([523.25, 659.25, 783.99, 1046.5], 2.1, 1.5, 'sawtooth', 0.18);
      playChord([261.63, 329.63, 392], 2.1, 1.5, 'triangle', 0.1);
      playNote(130.81, 2.1, 1.5, 'sine', 0.2); // Bass
      
      // Shimmering high strings
      [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093].forEach((f, i) => {
        playNote(f, 2.3 + i * 0.12, 1.5, 'sine', 0.05);
      });
      
      // Final majestic chord (sustained)
      setTimeout(() => {
        playChord([261.63, 329.63, 392, 523.25, 659.25, 783.99], 0, 3, 'sine', 0.08);
        playChord([130.81, 196, 261.63], 0, 3, 'triangle', 0.06);
        playNote(65.41, 0, 3, 'sine', 0.15);
      }, 3000);
      
      // Ethereal choir-like pad
      const choir = [523.25, 659.25, 783.99, 1046.5];
      choir.forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ac.currentTime + 2.5);
        
        // Slow swell
        gain.gain.setValueAtTime(0, ac.currentTime + 2.5);
        gain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 3.5);
        gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 5);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 7);
        
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(ac.currentTime + 2.5);
        osc.stop(ac.currentTime + 7);
      });
      
      setTimeout(() => ac.close(), 8000);
    } catch (e) {
      console.warn('[FINAL-SHOOT] Win sound error:', e);
    }
  }, []);

  // ========== DRAMATIC FAIL SOUND ==========
  const playFailSound = useCallback(() => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = ac.createGain();
      masterGain.gain.setValueAtTime(0.4, ac.currentTime);
      masterGain.connect(ac.destination);

      // Descending brass
      [392, 349.23, 293.66, 261.63].forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ac.currentTime + i * 0.3);
        gain.gain.setValueAtTime(0.15, ac.currentTime + i * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + i * 0.3 + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ac.currentTime + i * 0.3);
        osc.stop(ac.currentTime + i * 0.3 + 0.5);
      });
      
      // Deep rumble
      const bass = ac.createOscillator();
      const bassGain = ac.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(45, ac.currentTime + 0.8);
      bassGain.gain.setValueAtTime(0.3, ac.currentTime + 0.8);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 2);
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.start(ac.currentTime + 0.8);
      bass.stop(ac.currentTime + 2.2);
      
      setTimeout(() => ac.close(), 2500);
    } catch {}
  }, []);

  // ========== GOLDEN CONFETTI EXPLOSION ==========
  const triggerGoldenCelebration = useCallback(() => {
    if (typeof confetti !== 'function') return;
    
    // Initial burst
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.5, x: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FFDF00', '#F0E68C', '#DAA520'],
      ticks: 300,
      gravity: 0.8,
      scalar: 1.2,
    });
    
    // Side cannons
    setTimeout(() => {
      confetti({ particleCount: 100, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFFFF'] });
      confetti({ particleCount: 100, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFFFF'] });
    }, 300);
    
    // Stars falling
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 120,
        origin: { y: 0, x: 0.5 },
        colors: ['#FFD700', '#FFFFFF'],
        shapes: ['star'],
        scalar: 2,
        gravity: 1.5,
      });
    }, 600);
    
    // Final golden shower
    [1000, 1500, 2000, 2500].forEach((delay, i) => {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100 + i * 20,
          origin: { y: 0.3, x: 0.3 + Math.random() * 0.4 },
          colors: ['#FFD700', '#FFA500', '#FFDF00', '#F5DEB3'],
          ticks: 200,
        });
      }, delay);
    });
  }, []);

  // ========== MAP CLICK ==========
  useEffect(() => {
    if (!map || !ctx.isActive || showConfirm || phase !== 'idle') return;
    
    const onClick = (e: maplibregl.MapMouseEvent) => {
      setTargetCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setShowConfirm(true);
    };
    
    map.on('click', onClick);
    map.getCanvas().style.cursor = 'crosshair';
    
    return () => {
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, ctx.isActive, showConfirm, phase]);

  // ========== RESET TO IDLE ==========
  const resetToIdle = useCallback(() => {
    cleanup();
    setPhase('idle');
    setProgress(0);
    setResult(null);
    setTargetCoords(null);
    setShowConfirm(false);
  }, [cleanup]);

  // ========== SHOW RESULT ==========
  const showResult = useCallback((isWinner: boolean, hint: string) => {
    cleanup();
    setResult({ isWinner, hint });
    setPhase('result');
    
    if (isWinner) {
      playWinSound();
      triggerGoldenCelebration();
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 600]);
    } else {
      playFailSound();
      if ('vibrate' in navigator) navigator.vibrate([500, 150, 500]);
    }
    
    setTimeout(() => {
      resetToIdle();
      if (isWinner || ctx.remainingAttempts <= 1) {
        ctx.deactivateFinalShoot();
      }
    }, isWinner ? 10000 : 5000);
  }, [cleanup, playWinSound, playFailSound, triggerGoldenCelebration, resetToIdle, ctx]);

  // ========== CONFIRM & EXECUTE ==========
  const confirmShoot = useCallback(() => {
    if (!targetCoords) return;
    
    const lat = targetCoords.lat;
    const lng = targetCoords.lng;
    
    cleanup();
    setShowConfirm(false);
    setPhase('suspense');
    setProgress(0);
    
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    startHeartbeat();
    
    const duration = 15000;
    const startTime = Date.now();
    let isRunning = true;
    
    const tick = () => {
      if (!isRunning) return;
      
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      progressRef.current = p;
      
      if (p < 1) {
        timerRef.current = window.setTimeout(tick, 50);
      } else {
        isRunning = false;
        cleanup();
        
        ctx.executeShoot(lat, lng)
          .then((isWinner) => {
            const hint = isWinner ? '🎯 PERFETTO!' : (ctx.lastAttempt?.hint || 'Riprova!');
            showResult(isWinner, hint);
          })
          .catch(() => showResult(false, 'Errore - Riprova!'));
      }
    };
    
    timerRef.current = window.setTimeout(tick, 50);
  }, [targetCoords, startHeartbeat, cleanup, ctx, showResult]);

  const cancelConfirm = useCallback(() => {
    setShowConfirm(false);
    setTargetCoords(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  if (!ctx.isActive && phase === 'idle') return null;

  const borderOpacity = phase === 'suspense' ? 0.3 + progress * 0.7 : 0.3;
  const borderSize = phase === 'suspense' ? 60 + progress * 240 : 60;
  const pulseSpeed = phase === 'suspense' ? Math.max(0.3, 2 - progress * 1.7) : 2;

  return (
    <>
      {/* RED BORDER */}
      {(ctx.isActive || phase === 'suspense') && phase !== 'result' && (
        <div className="fixed inset-0 z-[1500] pointer-events-none">
          <motion.div className="absolute inset-0" animate={{ boxShadow: [`inset 0 0 ${borderSize}px rgba(239, 68, 68, ${borderOpacity * 0.8})`, `inset 0 0 ${borderSize * 1.3}px rgba(239, 68, 68, ${borderOpacity})`, `inset 0 0 ${borderSize}px rgba(239, 68, 68, ${borderOpacity * 0.8})`] }} transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute inset-0" animate={{ boxShadow: [`inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`, `inset 0 0 ${borderSize * 3}px rgba(150, 0, 0, ${borderOpacity * 0.5})`, `inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`] }} transition={{ duration: pulseSpeed * 0.6, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      )}

      {/* INFO BAR */}
      <AnimatePresence>
        {ctx.isActive && phase === 'idle' && !showConfirm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed z-[1600] left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/90 border border-red-500/50 backdrop-blur-xl" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 100px)' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Target className="w-5 h-5 text-red-400" />
            </motion.div>
            <span className="text-red-200 font-orbitron font-bold text-sm">FINAL SHOOT</span>
            <span className="text-white/30">|</span>
            <span className="text-cyan-300 font-bold text-sm">{ctx.remainingAttempts} tentativi</span>
            <button onClick={ctx.deactivateFinalShoot} className="ml-2 p-1 rounded-full hover:bg-white/10">
              <XCircle className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROGRESS */}
      <AnimatePresence>
        {phase === 'suspense' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[1600] flex items-center justify-center pointer-events-none px-4">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-red-500/50 shadow-2xl shadow-red-500/30 w-full max-w-sm">
              <motion.div className="text-6xl sm:text-8xl font-orbitron font-black text-center mb-4" style={{ color: `rgb(255, ${Math.floor(255 - progress * 200)}, ${Math.floor(255 - progress * 200)})`, textShadow: `0 0 ${30 + progress * 50}px rgba(255, 0, 0, ${0.5 + progress * 0.5})` }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: pulseSpeed * 0.4, repeat: Infinity }}>
                {Math.floor(progress * 100)}%
              </motion.div>
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/20">
                <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, #00ffff 0%, #ff00ff 50%, #ff0000 100%)`, boxShadow: `0 0 30px rgba(255, 0, 0, ${progress})` }} />
              </div>
              <motion.div className="text-lg font-orbitron text-white text-center tracking-widest" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 0.4, repeat: Infinity }}>
                {progress < 0.25 && '◉ ANALISI...'}
                {progress >= 0.25 && progress < 0.5 && '◉◉ SCANSIONE...'}
                {progress >= 0.5 && progress < 0.75 && '◉◉◉ CALCOLO...'}
                {progress >= 0.75 && progress < 0.95 && '◉◉◉◉ QUASI...'}
                {progress >= 0.95 && '★★★ VERDETTO! ★★★'}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== CINEMATIC VICTORY RESULT ========== */}
      <AnimatePresence>
        {phase === 'result' && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
            {result.isWinner ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Cinematic golden gradient background */}
                <motion.div 
                  className="absolute inset-0" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  style={{ 
                    background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, rgba(218,165,32,0.3) 25%, rgba(139,69,19,0.2) 50%, rgba(0,0,0,0.95) 80%)',
                  }} 
                />
                
                {/* Ethereal light rays */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(24)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-300/40 to-transparent"
                      style={{ 
                        height: '250%', 
                        left: '50%', 
                        top: '-75%', 
                        transformOrigin: '50% 100%', 
                        transform: `rotate(${i * 15}deg)`,
                      }} 
                      initial={{ opacity: 0, scaleY: 0 }} 
                      animate={{ 
                        opacity: [0, 0.6, 0.3, 0.6, 0], 
                        scaleY: [0, 1.2, 1, 1.2, 0],
                      }} 
                      transition={{ 
                        duration: 4, 
                        delay: i * 0.05, 
                        repeat: Infinity,
                        ease: "easeInOut",
                      }} 
                    />
                  ))}
                </div>

                {/* Floating golden particles */}
                <div className="absolute inset-0">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `radial-gradient(circle, ${['#FFD700', '#FFA500', '#FFDF00', '#F5DEB3'][i % 4]} 0%, transparent 70%)`,
                        boxShadow: `0 0 ${10 + Math.random() * 10}px ${['#FFD700', '#FFA500'][i % 2]}`,
                      }}
                      animate={{
                        y: [0, -100 - Math.random() * 200],
                        x: [0, (Math.random() - 0.5) * 100],
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1.5, 1, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>

                {/* Crown + Trophy combo */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180, y: 100 }} 
                  animate={{ scale: 1, rotate: 0, y: 0 }} 
                  transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.2 }} 
                  className="relative z-10 mb-8"
                >
                  {/* Glow halo */}
                  <motion.div
                    className="absolute inset-0 -m-16 rounded-full"
                    animate={{ 
                      boxShadow: [
                        '0 0 80px 40px rgba(255, 215, 0, 0.3)',
                        '0 0 120px 60px rgba(255, 215, 0, 0.5)',
                        '0 0 80px 40px rgba(255, 215, 0, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Crown above */}
                  <motion.div
                    className="absolute -top-12 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-20 h-20 text-yellow-400" style={{ filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))' }} />
                  </motion.div>
                  
                  {/* Main Trophy */}
                  <motion.div 
                    animate={{ scale: [1, 1.08, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Trophy 
                      className="w-44 h-44 sm:w-56 sm:h-56 text-yellow-400" 
                      strokeWidth={1} 
                      style={{ 
                        filter: 'drop-shadow(0 0 60px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 100px rgba(255, 165, 0, 0.7))',
                      }} 
                    />
                  </motion.div>
                  
                  {/* Orbiting stars */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="absolute top-1/2 left-1/2"
                      animate={{ 
                        rotate: [i * 45, i * 45 + 360],
                      }}
                      transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "linear",
                      }}
                      style={{ transformOrigin: '0 0' }}
                    >
                      <motion.div
                        style={{ transform: 'translateX(120px) translateY(-50%)' }}
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-300" style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }} />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Text content */}
                <motion.div 
                  initial={{ opacity: 0, y: 60 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.6, duration: 0.8 }} 
                  className="text-center z-10 px-4"
                >
                  {/* Main title with shine effect */}
                  <motion.h1 
                    className="text-5xl sm:text-7xl md:text-8xl font-orbitron font-black mb-6 relative"
                    style={{ 
                      background: 'linear-gradient(90deg, #B8860B 0%, #FFD700 25%, #FFFFFF 50%, #FFD700 75%, #B8860B 100%)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 80px rgba(255, 215, 0, 0.5)',
                    }}
                    animate={{ 
                      backgroundPosition: ['200% 0', '-200% 0'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    HAI VINTO!
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 1.2 }}
                    className="space-y-4"
                  >
                    <p className="text-2xl sm:text-3xl text-white font-light">
                      🎖️ <span className="font-semibold">COMPLIMENTI AGENTE!</span> 🎖️
                    </p>
                    <motion.p 
                      className="text-xl sm:text-2xl font-orbitron"
                      style={{ 
                        background: 'linear-gradient(90deg, #00FFFF, #00FF88)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Hai trovato la posizione esatta del premio!
                    </motion.p>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              /* FAIL STATE - unchanged */
              <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
                <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(80,0,0,0.4) 0%, rgba(0,0,0,0.95) 70%)' }} />
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="mb-8 z-10">
                  <motion.div animate={{ scale: [1, 0.95, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Target className="w-36 h-36 sm:w-48 sm:h-48 text-red-500/40" strokeWidth={1} />
                  </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center z-10">
                  <div className="text-4xl sm:text-6xl font-orbitron font-bold text-red-500 mb-6" style={{ textShadow: '0 0 40px rgba(255, 0, 0, 0.5)' }}>MANCATO!</div>
                  <div className="text-xl sm:text-2xl text-white/80 mb-4">{result.hint}</div>
                  <div className="text-lg sm:text-xl text-cyan-400 font-bold">Tentativi rimasti: {ctx.remainingAttempts}</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {showConfirm && targetCoords && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={cancelConfirm}>
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-cyan-500/30 shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20 border border-red-400/30"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
                <div><h3 className="text-lg font-bold text-white font-orbitron">CONFERMA SPARO</h3><p className="text-sm text-white/60">Questa azione è irreversibile</p></div>
              </div>
              <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/70">Coordinate selezionate:</div>
                <div className="text-white font-mono text-sm">{targetCoords.lat.toFixed(6)}°N, {targetCoords.lng.toFixed(6)}°E</div>
              </div>
              <div className="flex gap-3">
                <button onClick={cancelConfirm} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 active:scale-95 transition-all">Annulla</button>
                <button onClick={confirmShoot} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 border border-red-400/50 text-white font-bold font-orbitron hover:from-red-500 hover:to-orange-500 active:scale-95 transition-all shadow-lg shadow-red-500/30">🎯 SPARA!</button>
              </div>
              <div className="mt-4 text-center text-xs text-white/40">Tentativi rimasti: {ctx.remainingAttempts}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FinalShootOverlay;
