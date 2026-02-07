// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// DISCO ROTAZIONE - Motion-based mini-game
// EPIC FIX v3: Calibrated physics (12-25s), real brake, no progress bar
// Progress shown on outer ring (white→blue→violet)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMotionSensor } from '@/hooks/useMotionSensor';
import { isCapacitorNative } from '@/utils/capacitor';
import { hapticSuccess, hapticError, hapticHeavy, hapticMedium, hapticLight } from '@/utils/haptics';
import '@/styles/disco-rotazione.css';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - CALIBRATED FOR 12-25 SECOND GAMEPLAY
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  // Target generation
  TARGET_MIN: 800,
  TARGET_MAX: 1300,
  REMEMBER_LAST_N: 5,
  
  // === MOTION INPUT ===
  OMEGA_DEADZONE: 20, // Ignore angular velocity below this (°/s)
  OMEGA_START_THRESHOLD: 30, // Must exceed this to start game (°/s)
  OMEGA_START_FRAMES: 8, // Frames above threshold to confirm start
  
  // === SMOOTHING ===
  SMOOTHING_ALPHA: 0.12, // Lower = smoother (0.1-0.2 range)
  
  // === GAIN (how fast counter advances) ===
  // Calibrated: ~50-80 omega input should advance ~30-50 units/sec at start
  // With target 1000, that's ~20-30 seconds to complete
  GAIN_BASE: 0.0006, // Base gain (VERY LOW for hard mode)
  GAIN_CURVE: 0.8, // < 1 = sublinear (fast motion doesn't explode)
  MAX_SPIN_VEL: 15, // Clamp max spin velocity per frame
  
  // === VIRTUAL MASS (makes it harder as you progress) ===
  MASS_AT_START: 1.0,
  MASS_AT_50_PERCENT: 1.5,
  MASS_AT_80_PERCENT: 2.5,
  MASS_AT_95_PERCENT: 4.0, // Very heavy near end
  
  // === INERTIA (how long it coasts after you stop) ===
  DECAY_BASE: 1.2, // Low = long coast (per second)
  DECAY_AT_80_PERCENT: 2.5,
  DECAY_AT_95_PERCENT: 4.0, // Faster stop near target
  
  // === BRAKE (tilt to slow down) ===
  TILT_DEADZONE: 8, // Ignore tilt below this (degrees)
  TILT_MAX: 40, // Full brake angle (degrees)
  BRAKE_CURVE: 2.0, // Quadratic = progressive
  BRAKE_STRENGTH: 50, // How strong max brake is (per second)
  
  // === CRITICAL ZONE ===
  CRITICAL_ZONE_THRESHOLD: 0.92,
  CRITICAL_INSTABILITY_AMP: 0.2,
  CRITICAL_INSTABILITY_CHANCE: 0.06,
  
  // === SUCCESS/FAIL ===
  SOFT_LOCK_TOLERANCE: 0.003, // 0.3% of target
  SOFT_LOCK_DURATION: 600, // ms to hold
  SOFT_LOCK_MAX_VEL: 0.2,
  OVERSHOOT_TOLERANCE: 1.002, // 0.2% overshoot = fail
  
  // === HAPTICS ===
  HAPTIC_MIN_INTERVAL: 80,
  HAPTIC_MAX_RATE: 12,
};

// Remember recent targets
const recentTargets: number[] = [];

const generateTarget = (): number => {
  let target: number;
  let attempts = 0;
  do {
    target = Math.floor(Math.random() * (CONFIG.TARGET_MAX - CONFIG.TARGET_MIN) + CONFIG.TARGET_MIN);
    attempts++;
  } while (recentTargets.includes(target) && attempts < 10);
  
  recentTargets.push(target);
  if (recentTargets.length > CONFIG.REMEMBER_LAST_N) recentTargets.shift();
  return target;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ═══════════════════════════════════════════════════════════════════════════
// GAME STATES
// ═══════════════════════════════════════════════════════════════════════════
type GameState = 'idle' | 'waiting_permission' | 'armed' | 'running' | 'critical' | 'success' | 'fail';

interface DiscoRotazioneProps {
  onClose?: () => void;
  onSuccess?: (score: number) => void;
  onFail?: (score: number) => void;
}

export const DiscoRotazione: React.FC<DiscoRotazioneProps> = ({
  onClose,
  onSuccess,
  onFail
}) => {
  const { 
    isSupported, 
    isPermissionGranted, 
    requestPermission, 
    angularVelocity, 
    motionData
  } = useMotionSensor();

  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [target, setTarget] = useState(() => generateTarget());
  const [currentValue, setCurrentValue] = useState(0);
  const [displayVelocity, setDisplayVelocity] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Physics refs
  const spinVelRef = useRef(0);
  const smoothedOmegaRef = useRef(0);
  const lastTimeRef = useRef(0);
  const startFramesRef = useRef(0);
  const softLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHapticRef = useRef(0);
  const hapticCountRef = useRef(0);
  const hapticSecondRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  
  // Visual rotation (separate from physics for smooth feel)
  const visualRotationRef = useRef(0);

  const progress = Math.min(1, currentValue / target);
  const isInCriticalZone = progress >= CONFIG.CRITICAL_ZONE_THRESHOLD;

  // ═════════════════════════════════════════════════════════════════════════
  // HAPTIC with rate limiting
  // ═════════════════════════════════════════════════════════════════════════
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    const now = Date.now();
    const sec = Math.floor(now / 1000);
    if (sec !== hapticSecondRef.current) {
      hapticSecondRef.current = sec;
      hapticCountRef.current = 0;
    }
    if (now - lastHapticRef.current < CONFIG.HAPTIC_MIN_INTERVAL) return;
    if (hapticCountRef.current >= CONFIG.HAPTIC_MAX_RATE) return;
    
    lastHapticRef.current = now;
    hapticCountRef.current++;
    
    if (isCapacitorNative()) {
      switch (intensity) {
        case 'heavy': hapticHeavy(); break;
        case 'medium': hapticMedium(); break;
        default: hapticLight(); break;
      }
    } else if (navigator.vibrate) {
      navigator.vibrate(intensity === 'heavy' ? 20 : intensity === 'medium' ? 10 : 5);
    }
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // ARMED STATE - Wait for real motion
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameState !== 'armed') {
      startFramesRef.current = 0;
      return;
    }

    const check = () => {
      smoothedOmegaRef.current = lerp(smoothedOmegaRef.current, angularVelocity, CONFIG.SMOOTHING_ALPHA);
      
      if (smoothedOmegaRef.current > CONFIG.OMEGA_START_THRESHOLD) {
        startFramesRef.current++;
        if (startFramesRef.current >= CONFIG.OMEGA_START_FRAMES) {
          console.log('[DiscoRotazione] Motion detected - START!');
          if (isCapacitorNative()) hapticHeavy();
          setGameState('running');
          return;
        }
      } else {
        startFramesRef.current = Math.max(0, startFramesRef.current - 2);
      }
      
      animFrameRef.current = requestAnimationFrame(check);
    };

    animFrameRef.current = requestAnimationFrame(check);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameState, angularVelocity]);

  // ═════════════════════════════════════════════════════════════════════════
  // PHYSICS LOOP
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameState !== 'running' && gameState !== 'critical') return;

    lastTimeRef.current = performance.now();

    const physics = () => {
      const now = performance.now();
      const dt = clamp((now - lastTimeRef.current) / 1000, 0.001, 0.1);
      lastTimeRef.current = now;

      // 1. SMOOTH INPUT
      smoothedOmegaRef.current = lerp(smoothedOmegaRef.current, angularVelocity, CONFIG.SMOOTHING_ALPHA);
      
      // 2. APPLY DEADZONE
      const omega = smoothedOmegaRef.current > CONFIG.OMEGA_DEADZONE 
        ? smoothedOmegaRef.current - CONFIG.OMEGA_DEADZONE 
        : 0;

      // 3. CALCULATE VIRTUAL MASS
      let mass: number;
      if (progress < 0.5) {
        mass = lerp(CONFIG.MASS_AT_START, CONFIG.MASS_AT_50_PERCENT, progress / 0.5);
      } else if (progress < 0.8) {
        mass = lerp(CONFIG.MASS_AT_50_PERCENT, CONFIG.MASS_AT_80_PERCENT, (progress - 0.5) / 0.3);
      } else if (progress < 0.95) {
        mass = lerp(CONFIG.MASS_AT_80_PERCENT, CONFIG.MASS_AT_95_PERCENT, (progress - 0.8) / 0.15);
      } else {
        mass = CONFIG.MASS_AT_95_PERCENT + (progress - 0.95) * 20;
      }

      // 4. CALCULATE GAIN (sublinear curve)
      let gain = CONFIG.GAIN_BASE / mass;
      
      // Apply sublinear curve: high omega doesn't explode
      const normalizedOmega = omega / 100; // ~100°/s = fast movement
      const scaledOmega = Math.pow(normalizedOmega, CONFIG.GAIN_CURVE) * 100;
      
      // Critical instability
      if (isInCriticalZone && Math.random() < CONFIG.CRITICAL_INSTABILITY_CHANCE) {
        gain *= (1 + (Math.random() - 0.5) * 2 * CONFIG.CRITICAL_INSTABILITY_AMP);
      }

      // 5. ADD TO SPIN VELOCITY
      const inputAccel = scaledOmega * gain * dt * 60;
      spinVelRef.current += inputAccel;
      spinVelRef.current = clamp(spinVelRef.current, 0, CONFIG.MAX_SPIN_VEL);

      // 6. APPLY DECAY (inertia)
      let decay: number;
      if (progress < 0.8) {
        decay = lerp(CONFIG.DECAY_BASE, CONFIG.DECAY_AT_80_PERCENT, progress / 0.8);
      } else if (progress < 0.95) {
        decay = lerp(CONFIG.DECAY_AT_80_PERCENT, CONFIG.DECAY_AT_95_PERCENT, (progress - 0.8) / 0.15);
      } else {
        decay = CONFIG.DECAY_AT_95_PERCENT + (progress - 0.95) * 10;
      }
      spinVelRef.current *= Math.exp(-decay * dt);

      // 7. APPLY TILT BRAKE
      const tiltAngle = Math.abs(motionData?.tilt?.beta ?? 0);
      const tiltAboveDeadzone = Math.max(0, tiltAngle - CONFIG.TILT_DEADZONE);
      const tiltNorm = clamp(tiltAboveDeadzone / (CONFIG.TILT_MAX - CONFIG.TILT_DEADZONE), 0, 1);
      const brakeForce = Math.pow(tiltNorm, CONFIG.BRAKE_CURVE) * CONFIG.BRAKE_STRENGTH;
      
      if (spinVelRef.current > 0 && brakeForce > 0) {
        spinVelRef.current = Math.max(0, spinVelRef.current - brakeForce * dt);
      }

      // 8. UPDATE POSITION
      const newValue = currentValue + spinVelRef.current;

      // 9. CHECK OVERSHOOT
      if (newValue > target * CONFIG.OVERSHOOT_TOLERANCE) {
        setGameState('fail');
        setCurrentValue(newValue);
        if (isCapacitorNative()) {
          hapticHeavy();
          setTimeout(() => hapticMedium(), 80);
          setTimeout(() => hapticLight(), 140);
        }
        if (onFail) onFail(Math.round(newValue));
        return;
      }

      // 10. CHECK SOFT-LOCK
      const distToTarget = Math.abs(newValue - target) / target;
      const isStill = spinVelRef.current < CONFIG.SOFT_LOCK_MAX_VEL;
      
      if (distToTarget < CONFIG.SOFT_LOCK_TOLERANCE && isStill) {
        if (!softLockTimerRef.current) {
          softLockTimerRef.current = setTimeout(() => {
            setGameState('success');
            setCurrentValue(target);
            if (isCapacitorNative()) {
              hapticSuccess();
              setTimeout(() => hapticMedium(), 120);
            }
            if (onSuccess) onSuccess(target);
          }, CONFIG.SOFT_LOCK_DURATION);
        }
      } else if (softLockTimerRef.current) {
        clearTimeout(softLockTimerRef.current);
        softLockTimerRef.current = null;
      }

      // 11. UPDATE STATE
      setCurrentValue(Math.max(0, newValue));
      setDisplayVelocity(spinVelRef.current);
      
      // Visual rotation with damping for weight feel
      visualRotationRef.current += spinVelRef.current * 4;
      setRotationAngle(visualRotationRef.current);

      // Update to critical state
      if (isInCriticalZone && gameState !== 'critical') {
        setGameState('critical');
        if (isCapacitorNative()) hapticMedium();
      }

      // 12. HAPTIC (proportional)
      if (spinVelRef.current > 0.3) {
        const intensity: 'light' | 'medium' | 'heavy' = 
          spinVelRef.current > 5 ? 'heavy' : spinVelRef.current > 2 ? 'medium' : 'light';
        triggerHaptic(intensity);
      }

      animFrameRef.current = requestAnimationFrame(physics);
    };

    animFrameRef.current = requestAnimationFrame(physics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (softLockTimerRef.current) clearTimeout(softLockTimerRef.current);
    };
  }, [gameState, angularVelocity, motionData, currentValue, target, progress, isInCriticalZone, triggerHaptic, onSuccess, onFail]);

  // ═════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═════════════════════════════════════════════════════════════════════════
  const handleStart = async () => {
    if (isSupported && !isPermissionGranted) {
      setGameState('waiting_permission');
      const granted = await requestPermission();
      if (!granted) {
        alert('Permesso sensori richiesto per giocare');
        setGameState('idle');
        return;
      }
    }

    setCurrentValue(0);
    spinVelRef.current = 0;
    smoothedOmegaRef.current = 0;
    visualRotationRef.current = 0;
    startFramesRef.current = 0;
    setTarget(generateTarget());
    setRotationAngle(0);
    setGameState('armed');
  };

  const handleRetry = () => {
    setCurrentValue(0);
    spinVelRef.current = 0;
    smoothedOmegaRef.current = 0;
    visualRotationRef.current = 0;
    startFramesRef.current = 0;
    setTarget(generateTarget());
    setRotationAngle(0);
    setGameState('idle');
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  const intensityClass = displayVelocity > 4 ? 'high-intensity' :
                         displayVelocity > 1.5 ? 'medium-intensity' : 'low-intensity';
  
  // Progress for SVG ring (0-100)
  const ringProgress = Math.min(100, progress * 100);
  const circumference = 2 * Math.PI * 46; // radius 46%
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className="disco-rotazione-container">
      {/* Status */}
      {gameState === 'armed' && (
        <div className="disco-status armed">MUOVI PER INIZIARE</div>
      )}
      {gameState === 'running' && (
        <div className="disco-status running">RUOTA IL TELEFONO</div>
      )}
      {gameState === 'critical' && (
        <div className="disco-status critical">⚡ ZONA CRITICA</div>
      )}

      {/* Main Disc */}
      <div className={`disco-rotazione ${intensityClass}`}>
        {/* SVG Progress Ring (outer) */}
        {(gameState === 'armed' || gameState === 'running' || gameState === 'critical') && (
          <svg 
            className="disco-progress-svg"
            viewBox="0 0 100 100"
          >
            {/* Background ring (white) */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
            />
            {/* Progress ring (blue→violet gradient) */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D1FF" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{ 
                transition: 'stroke-dashoffset 0.1s ease-out',
                filter: 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.6))'
              }}
            />
          </svg>
        )}

        {/* Rotating visual elements */}
        <div 
          className="disco-rotazione-rotating"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          <div className="disco-led-ring" />
          <div className="disco-dots" />
          <div className="disco-dots-sides" />
        </div>

        {/* Counter */}
        <div className="disco-rotazione-content">
          <AnimatePresence mode="wait">
            {(gameState === 'idle' || gameState === 'waiting_permission') && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <span className="disco-counter">{target}</span>
              </motion.div>
            )}
            
            {gameState === 'armed' && (
              <motion.div
                key="armed"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                <span className="disco-counter disco-counter-dim">{target}</span>
              </motion.div>
            )}
            
            {(gameState === 'running' || gameState === 'critical') && (
              <motion.span
                key="counter"
                className={`disco-counter ${isInCriticalZone ? 'critical' : ''}`}
                animate={isInCriticalZone ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {Math.round(currentValue)}
              </motion.span>
            )}
            
            {gameState === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="disco-result-overlay"
              >
                <CheckCircle2 className="disco-result-icon text-green-400" />
                <span className="disco-result-text success">PERFETTO!</span>
              </motion.div>
            )}
            
            {gameState === 'fail' && (
              <motion.div
                key="fail"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="disco-result-overlay"
              >
                <XCircle className="disco-result-icon text-red-400" />
                <span className="disco-result-text fail">OLTREPASSATO!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Target indicator */}
        {(gameState === 'armed' || gameState === 'running' || gameState === 'critical') && (
          <div className="disco-target-indicator">
            TARGET: <span className="disco-target-value">{target}</span>
          </div>
        )}
      </div>

      {/* Instructions / Actions */}
      {gameState === 'idle' && (
        <>
          <p className="disco-instructions">
            <strong>Muovi il telefono</strong> con il braccio per far avanzare il disco.
            <br /><br />
            <strong>Inclina</strong> per frenare.
            <br /><br />
            Raggiungi esattamente il target senza superarlo!
          </p>
          <button className="disco-btn" onClick={handleStart}>
            INIZIA
          </button>
        </>
      )}

      {gameState === 'waiting_permission' && (
        <p className="disco-instructions">Attendi autorizzazione sensori...</p>
      )}

      {(gameState === 'success' || gameState === 'fail') && (
        <div className="flex gap-4 mt-8">
          <button className="disco-btn" onClick={handleRetry}>RIPROVA</button>
          {onClose && (
            <button className="disco-btn disco-btn-secondary" onClick={onClose}>CHIUDI</button>
          )}
        </div>
      )}

      {/* Debug (DEV only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-20 left-4 text-xs text-white/30 font-mono space-y-0.5">
          <div>state: {gameState}</div>
          <div>vel: {displayVelocity.toFixed(2)}</div>
          <div>ω: {smoothedOmegaRef.current.toFixed(0)}°/s</div>
          <div>prog: {(progress * 100).toFixed(1)}%</div>
          <div>tilt: {Math.abs(motionData?.tilt?.beta ?? 0).toFixed(0)}°</div>
        </div>
      )}
    </div>
  );
};

export default DiscoRotazione;
