// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT OVERLAY v8 - CON SONORO + ANTI-BLOCCO

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Target, Trophy, XCircle, Star } from 'lucide-react';
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

  // ========== HEARTBEAT SONORO ==========
  const progressRef = useRef(0);
  
  const playBeat = useCallback(() => {
    const p = progressRef.current;
    if (p >= 1) return;
    
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      
      osc.type = 'sine';
      const freq = 40 + p * 160;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ac.currentTime + 0.12);
      
      const vol = 0.2 + p * 0.5;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.2);
      
      setTimeout(() => ac.close(), 300);
      
      if ('vibrate' in navigator) navigator.vibrate(15 + Math.floor(p * 45));
    } catch {}
    
    const interval = Math.max(100, 550 - p * 450);
    if (p < 1) {
      beatTimerRef.current = window.setTimeout(playBeat, interval);
    }
  }, []);
  
  const startHeartbeat = useCallback(() => {
    progressRef.current = 0;
    playBeat();
  }, [playBeat]);

  // ========== WIN SOUND ==========
  const playWinSound = useCallback(() => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const play = (f: number, t: number, d: number, type: OscillatorType = 'square') => {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.25, ac.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + t + d);
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + d + 0.05);
      };
      // Epic fanfare
      play(523, 0, 0.3); play(659, 0, 0.3); play(784, 0, 0.3);
      play(784, 0.35, 0.3); play(988, 0.35, 0.3); play(1175, 0.35, 0.3);
      play(1047, 0.7, 0.5); play(1319, 0.7, 0.5); play(1568, 0.7, 0.5);
      play(2093, 0.7, 0.5, 'sawtooth');
      [2093, 2349, 2637, 3136, 3520, 4186].forEach((f, i) => play(f, 1.2 + i * 0.08, 0.15, 'sine'));
      setTimeout(() => ac.close(), 3000);
    } catch {}
  }, []);

  // ========== FAIL SOUND ==========
  const playFailSound = useCallback(() => {
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      const play = (f: number, t: number, d: number) => {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.35, ac.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + t + d);
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + d + 0.05);
      };
      // Dramatic descending "dun dun duuun"
      play(392, 0, 0.25); play(349, 0.3, 0.25); play(262, 0.6, 0.7);
      // Low rumble
      const bass = ac.createOscillator(); const bg = ac.createGain();
      bass.type = 'sine'; bass.frequency.value = 55;
      bg.gain.setValueAtTime(0.4, ac.currentTime + 0.6);
      bg.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 1.5);
      bass.connect(bg); bg.connect(ac.destination);
      bass.start(ac.currentTime + 0.6); bass.stop(ac.currentTime + 1.6);
      setTimeout(() => ac.close(), 2000);
    } catch {}
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
      if (typeof confetti === 'function') {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => confetti({ particleCount: 150, spread: 100 + i * 20, origin: { y: 0.5 }, colors: ['#FFD700', '#FF6B6B', '#00FFFF', '#FF00FF'] }), i * 250);
        }
      }
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
    } else {
      playFailSound();
      if ('vibrate' in navigator) navigator.vibrate([400, 100, 400]);
    }
    
    // Auto-reset
    setTimeout(() => {
      resetToIdle();
      if (isWinner || ctx.remainingAttempts <= 1) {
        ctx.deactivateFinalShoot();
      }
    }, isWinner ? 8000 : 4000);
  }, [cleanup, playWinSound, playFailSound, resetToIdle, ctx]);

  // ========== CONFIRM & EXECUTE ==========
  const confirmShoot = useCallback(() => {
    if (!targetCoords) {
      console.error('[FINAL-SHOOT] No coords!');
      return;
    }
    
    console.log('[FINAL-SHOOT] Starting shoot...');
    
    // SAVE COORDS IMMEDIATELY
    const lat = targetCoords.lat;
    const lng = targetCoords.lng;
    
    // Reset and start
    cleanup();
    setShowConfirm(false);
    setPhase('suspense');
    setProgress(0);
    
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    
    // Start heartbeat sound
    startHeartbeat();
    
    // Progress animation - 15 seconds
    const duration = 15000;
    const startTime = Date.now();
    let isRunning = true;
    
    const tick = () => {
      if (!isRunning) return;
      
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      progressRef.current = p; // Sync for heartbeat
      
      if (p < 1) {
        timerRef.current = window.setTimeout(tick, 50);
      } else {
        // 100% - EXECUTE SHOOT!
        isRunning = false;
        cleanup();
        console.log('[FINAL-SHOOT] 100% - executing...');
        
        // Execute shoot
        ctx.executeShoot(lat, lng)
          .then((isWinner) => {
            console.log('[FINAL-SHOOT] Result:', isWinner);
            const hint = isWinner ? '🎯 PERFETTO!' : (ctx.lastAttempt?.hint || 'Riprova!');
            showResult(isWinner, hint);
          })
          .catch((err) => {
            console.error('[FINAL-SHOOT] Error:', err);
            showResult(false, 'Errore - Riprova!');
          });
      }
    };
    
    // START IMMEDIATELY
    console.log('[FINAL-SHOOT] Timer starting NOW');
    timerRef.current = window.setTimeout(tick, 50);
  }, [targetCoords, startHeartbeat, cleanup, ctx, showResult]);

  // Cancel
  const cancelConfirm = useCallback(() => {
    setShowConfirm(false);
    setTargetCoords(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
          <motion.div className="absolute inset-0" animate={{ boxShadow: [`inset 0 0 ${borderSize * 1.5}px rgba(200, 0, 0, ${borderOpacity * 0.5})`, `inset 0 0 ${borderSize * 2}px rgba(200, 0, 0, ${borderOpacity * 0.7})`, `inset 0 0 ${borderSize * 1.5}px rgba(200, 0, 0, ${borderOpacity * 0.5})`] }} transition={{ duration: pulseSpeed * 0.8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute inset-0" animate={{ boxShadow: [`inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`, `inset 0 0 ${borderSize * 3}px rgba(150, 0, 0, ${borderOpacity * 0.5})`, `inset 0 0 ${borderSize * 2.5}px rgba(150, 0, 0, ${borderOpacity * 0.3})`] }} transition={{ duration: pulseSpeed * 0.6, repeat: Infinity, ease: "easeInOut" }} />
          {phase === 'suspense' && ['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((pos, i) => (
            <motion.div key={i} className={`absolute ${pos}`} animate={{ width: [80, 80 + progress * 80, 80], height: [80, 80 + progress * 80, 80], opacity: [0.5, 1, 0.5] }} transition={{ duration: pulseSpeed, repeat: Infinity, delay: i * 0.12 }} style={{ borderColor: `rgba(255, 50, 50, ${borderOpacity})` }} />
          ))}
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
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-red-500/50 shadow-2xl shadow-red-500/30 w-full max-w-xs sm:max-w-sm">
              <motion.div className="text-5xl sm:text-7xl font-orbitron font-black text-center mb-3 sm:mb-4" style={{ color: `rgb(255, ${Math.floor(255 - progress * 200)}, ${Math.floor(255 - progress * 200)})`, textShadow: `0 0 ${30 + progress * 50}px rgba(255, 0, 0, ${0.5 + progress * 0.5})` }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: pulseSpeed * 0.4, repeat: Infinity }}>
                {Math.floor(progress * 100)}%
              </motion.div>
              <div className="w-full h-3 sm:h-4 bg-white/10 rounded-full overflow-hidden mb-3 sm:mb-4 border border-white/20">
                <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, #00ffff 0%, #ff00ff 50%, #ff0000 100%)`, boxShadow: `0 0 30px rgba(255, 0, 0, ${progress})` }} />
              </div>
              <motion.div className="text-base sm:text-xl font-orbitron text-white text-center tracking-wider sm:tracking-widest" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 0.4, repeat: Infinity }}>
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

      {/* RESULT */}
      <AnimatePresence>
        {phase === 'result' && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
            {result.isWinner ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,100,0,0.4) 30%, rgba(0,0,0,0.95) 70%)' }} />
                {[...Array(16)].map((_, i) => (
                  <motion.div key={i} className="absolute w-2 bg-gradient-to-t from-transparent via-yellow-400/80 to-transparent" style={{ height: '200%', left: '50%', top: '-50%', transformOrigin: '50% 100%', transform: `rotate(${i * 22.5}deg)` }} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }} transition={{ duration: 2, delay: i * 0.06, repeat: Infinity }} />
                ))}
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }} className="relative z-10 mb-6">
                  <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Trophy className="w-40 h-40 sm:w-56 sm:h-56 text-yellow-400" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 80px rgba(255, 215, 0, 1)) drop-shadow(0 0 150px rgba(255, 165, 0, 0.9))' }} />
                  </motion.div>
                  {[...Array(12)].map((_, i) => (
                    <motion.div key={i} className="absolute top-1/2 left-1/2" animate={{ x: [0, Math.cos(i * 30 * Math.PI / 180) * 180], y: [0, Math.sin(i * 30 * Math.PI / 180) * 180], scale: [0, 2, 0], opacity: [1, 1, 0], rotate: [0, 360] }} transition={{ duration: 1.2, delay: 0.3 + i * 0.08, repeat: Infinity, repeatDelay: 0.8 }}>
                      <Star className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center z-10 px-4">
                  <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.4, repeat: Infinity }} className="text-5xl sm:text-7xl md:text-9xl font-orbitron font-black mb-4 sm:mb-6" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B, #FFD700)', backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 1.5s linear infinite' }}>
                    HAI VINTO!
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-2xl sm:text-4xl text-white">🎉 COMPLIMENTI AGENTE! 🎉</motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-xl sm:text-2xl text-cyan-400 mt-4">Hai trovato il premio!</motion.div>
                </motion.div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
                <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(100,0,0,0.4) 0%, rgba(0,0,0,0.95) 70%)' }} />
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="mb-6 sm:mb-8 z-10">
                  <motion.div animate={{ scale: [1, 0.95, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Target className="w-32 h-32 sm:w-44 sm:h-44 text-red-500/40" strokeWidth={1} />
                  </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center z-10">
                  <div className="text-4xl sm:text-6xl font-orbitron font-bold text-red-500 mb-4 sm:mb-6" style={{ textShadow: '0 0 40px rgba(255, 0, 0, 0.5)' }}>MANCATO!</div>
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
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-cyan-500/30 shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20 border border-red-400/30"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
                <div><h3 className="text-lg font-bold text-white font-orbitron">CONFERMA</h3><p className="text-sm text-white/60">Sei sicuro?</p></div>
              </div>
              <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-sm text-white/70">Coordinate:</div>
                <div className="text-white font-mono text-sm break-all">{targetCoords.lat.toFixed(6)}°N, {targetCoords.lng.toFixed(6)}°E</div>
              </div>
              <div className="flex gap-3">
                <button onClick={cancelConfirm} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 active:scale-95 transition-all">Annulla</button>
                <button onClick={confirmShoot} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 border border-red-400/50 text-white font-bold font-orbitron hover:from-red-500 hover:to-pink-500 active:scale-95 transition-all">🎯 SPARA!</button>
              </div>
              <div className="mt-4 text-center text-xs text-white/40">Tentativi: {ctx.remainingAttempts}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

if (typeof document !== 'undefined' && !document.querySelector('#final-shoot-v8')) {
  const s = document.createElement('style');
  s.id = 'final-shoot-v8';
  s.textContent = '@keyframes shimmer{0%{background-position:300% 0}100%{background-position:-300% 0}}';
  document.head.appendChild(s);
}

export default FinalShootOverlay;
