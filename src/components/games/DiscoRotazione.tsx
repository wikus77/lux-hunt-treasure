// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// DISCO ROTAZIONE - Motion-based mini-game
// Move phone with arm/shoulder to advance, tilt to brake
// Target a specific quota without overshooting
// 🔧 FIX v2: ARMED state + motion threshold + proper physics

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMotionSensor } from '@/hooks/useMotionSensor';
import { isCapacitorNative } from '@/utils/capacitor';
import { hapticSuccess, hapticError, hapticHeavy, hapticMedium, hapticLight } from '@/utils/haptics';
import '@/styles/disco-rotazione.css';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  // Target generation
  TARGET_MIN: 800,
  TARGET_MAX: 1300,
  REMEMBER_LAST_N: 5,
  
  // MOTION THRESHOLD - ignores noise below this
  MOTION_NOISE_THRESHOLD: 8, // degrees/sec - below this = no input
  MOTION_START_THRESHOLD: 15, // degrees/sec - above this for N frames = start
  MOTION_START_FRAMES: 6, // frames above threshold to start
  
  // Physics - SMOOTHING
  SMOOTHING_ALPHA: 0.15, // lower = smoother, higher = more responsive
  
  // Physics - GAIN & INERTIA
  BASE_GAIN: 0.012, // how much motion adds to spinVelocity
  INERTIA_DECAY_BASE: 2.0, // base decay rate (per second)
  INERTIA_DECAY_HIGH: 4.5, // decay rate when progress > 70%
  INERTIA_DECAY_CRITICAL: 7.0, // decay rate when progress > 90%
  
  // MASS VIRTUAL (reduces effective gain as progress increases)
  MASS_AT_START: 1.0,
  MASS_AT_70_PERCENT: 1.8,
  MASS_AT_90_PERCENT: 3.0,
  
  // BRAKE via tilt
  BRAKE_MAX_TILT: 30, // degrees - full tilt angle for max brake
  BRAKE_POWER_CURVE: 1.5, // exponent for progressive brake (>1 = harder at high tilt)
  BRAKE_STRENGTH: 8.0, // how strong max brake decelerates (per second)
  
  // Critical zone
  CRITICAL_ZONE_THRESHOLD: 0.92,
  CRITICAL_INSTABILITY_AMP: 0.15, // amplitude of random perturbation on GAIN (not position)
  CRITICAL_INSTABILITY_CHANCE: 0.08, // probability per frame
  
  // Soft-lock
  SOFT_LOCK_TOLERANCE: 0.004, // 0.4% of target
  SOFT_LOCK_DURATION: 700, // ms to hold for success
  SOFT_LOCK_MAX_VELOCITY: 0.3, // must be nearly stopped
  
  // Haptic rate limiting
  HAPTIC_MIN_INTERVAL: 60, // ms
  HAPTIC_MAX_RATE: 15, // max haptics per second
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

// Lerp helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
    tiltBrakeForce,
    motionData
  } = useMotionSensor();

  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [target, setTarget] = useState(() => generateTarget());
  const [currentValue, setCurrentValue] = useState(0);
  const [displayVelocity, setDisplayVelocity] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Physics refs (persist across renders)
  const spinVelocityRef = useRef(0); // internal spin velocity
  const smoothedOmegaRef = useRef(0); // smoothed angular velocity from sensor
  const lastTimeRef = useRef(0);
  const startFramesAboveThresholdRef = useRef(0);
  const softLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHapticRef = useRef(0);
  const hapticCountRef = useRef(0);
  const hapticSecondRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Progress
  const progress = Math.min(1, currentValue / target);
  const isInCriticalZone = progress >= CONFIG.CRITICAL_ZONE_THRESHOLD;

  // ═════════════════════════════════════════════════════════════════════════
  // HAPTIC with rate limiting
  // ═════════════════════════════════════════════════════════════════════════
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    
    // Reset counter each second
    if (currentSecond !== hapticSecondRef.current) {
      hapticSecondRef.current = currentSecond;
      hapticCountRef.current = 0;
    }
    
    // Check rate limits
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
      navigator.vibrate(intensity === 'heavy' ? 25 : intensity === 'medium' ? 12 : 5);
    }
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // ARMED STATE - Wait for real motion
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameState !== 'armed') {
      startFramesAboveThresholdRef.current = 0;
      return;
    }

    const checkMotion = () => {
      const omega = angularVelocity;
      
      // Smooth the input
      smoothedOmegaRef.current = lerp(smoothedOmegaRef.current, omega, CONFIG.SMOOTHING_ALPHA);
      
      // Check if above start threshold
      if (smoothedOmegaRef.current > CONFIG.MOTION_START_THRESHOLD) {
        startFramesAboveThresholdRef.current++;
        
        if (startFramesAboveThresholdRef.current >= CONFIG.MOTION_START_FRAMES) {
          // Real motion detected - START!
          console.log('[DiscoRotazione] Motion detected - STARTING!');
          if (isCapacitorNative()) hapticHeavy();
          setGameState('running');
          return;
        }
      } else {
        // Reset counter if motion drops
        startFramesAboveThresholdRef.current = Math.max(0, startFramesAboveThresholdRef.current - 1);
      }
      
      animationFrameRef.current = requestAnimationFrame(checkMotion);
    };

    animationFrameRef.current = requestAnimationFrame(checkMotion);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, angularVelocity]);

  // ═════════════════════════════════════════════════════════════════════════
  // PHYSICS LOOP - Only when RUNNING or CRITICAL
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameState !== 'running' && gameState !== 'critical') return;

    lastTimeRef.current = performance.now();

    const physicsLoop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1); // cap at 100ms
      lastTimeRef.current = now;

      // ─────────────────────────────────────────────────────────────────────
      // 1. SMOOTH INPUT from motion sensor
      // ─────────────────────────────────────────────────────────────────────
      const rawOmega = angularVelocity;
      smoothedOmegaRef.current = lerp(smoothedOmegaRef.current, rawOmega, CONFIG.SMOOTHING_ALPHA);
      
      // Apply noise threshold - below this = zero input
      const effectiveOmega = smoothedOmegaRef.current > CONFIG.MOTION_NOISE_THRESHOLD 
        ? smoothedOmegaRef.current - CONFIG.MOTION_NOISE_THRESHOLD 
        : 0;

      // ─────────────────────────────────────────────────────────────────────
      // 2. CALCULATE VIRTUAL MASS (increases with progress)
      // ─────────────────────────────────────────────────────────────────────
      let mass: number;
      if (progress < 0.7) {
        mass = lerp(CONFIG.MASS_AT_START, CONFIG.MASS_AT_70_PERCENT, progress / 0.7);
      } else if (progress < 0.9) {
        mass = lerp(CONFIG.MASS_AT_70_PERCENT, CONFIG.MASS_AT_90_PERCENT, (progress - 0.7) / 0.2);
      } else {
        mass = CONFIG.MASS_AT_90_PERCENT + (progress - 0.9) * 5; // very heavy near end
      }

      // ─────────────────────────────────────────────────────────────────────
      // 3. CALCULATE EFFECTIVE GAIN (with critical zone instability)
      // ─────────────────────────────────────────────────────────────────────
      let effectiveGain = CONFIG.BASE_GAIN / mass;
      
      // Critical zone instability - random perturbation on GAIN (not position)
      if (isInCriticalZone && Math.random() < CONFIG.CRITICAL_INSTABILITY_CHANCE) {
        const perturbation = (Math.random() - 0.5) * 2 * CONFIG.CRITICAL_INSTABILITY_AMP;
        effectiveGain *= (1 + perturbation);
      }

      // ─────────────────────────────────────────────────────────────────────
      // 4. ADD INPUT TO SPIN VELOCITY
      // ─────────────────────────────────────────────────────────────────────
      spinVelocityRef.current += effectiveOmega * effectiveGain * dt * 60; // scale by ~60fps

      // ─────────────────────────────────────────────────────────────────────
      // 5. APPLY INERTIA DECAY (exponential)
      // ─────────────────────────────────────────────────────────────────────
      let decay: number;
      if (progress < 0.7) {
        decay = CONFIG.INERTIA_DECAY_BASE;
      } else if (progress < 0.9) {
        decay = lerp(CONFIG.INERTIA_DECAY_BASE, CONFIG.INERTIA_DECAY_HIGH, (progress - 0.7) / 0.2);
      } else {
        decay = lerp(CONFIG.INERTIA_DECAY_HIGH, CONFIG.INERTIA_DECAY_CRITICAL, (progress - 0.9) / 0.1);
      }
      spinVelocityRef.current *= Math.exp(-decay * dt);

      // ─────────────────────────────────────────────────────────────────────
      // 6. APPLY TILT BRAKE
      // ─────────────────────────────────────────────────────────────────────
      // tiltBrakeForce is 0-1 from useMotionSensor, but let's use raw tilt for more control
      const tiltAngle = motionData?.tilt?.beta ?? 0;
      const normalizedTilt = Math.min(1, Math.abs(tiltAngle) / CONFIG.BRAKE_MAX_TILT);
      const brakeForce = Math.pow(normalizedTilt, CONFIG.BRAKE_POWER_CURVE);
      
      // Brake subtracts from velocity
      const brakeDecel = brakeForce * CONFIG.BRAKE_STRENGTH * dt;
      if (spinVelocityRef.current > 0) {
        spinVelocityRef.current = Math.max(0, spinVelocityRef.current - brakeDecel);
      }

      // ─────────────────────────────────────────────────────────────────────
      // 7. UPDATE POSITION
      // ─────────────────────────────────────────────────────────────────────
      const newValue = currentValue + spinVelocityRef.current;

      // ─────────────────────────────────────────────────────────────────────
      // 8. CHECK OVERSHOOT (FAIL)
      // ─────────────────────────────────────────────────────────────────────
      if (newValue > target * 1.003) { // 0.3% tolerance
        setGameState('fail');
        setCurrentValue(newValue);
        if (isCapacitorNative()) {
          // Fail haptic pattern: 3 decreasing impacts
          hapticHeavy();
          setTimeout(() => hapticMedium(), 100);
          setTimeout(() => hapticLight(), 180);
        }
        if (onFail) onFail(Math.round(newValue));
        return;
      }

      // ─────────────────────────────────────────────────────────────────────
      // 9. CHECK SOFT-LOCK (SUCCESS)
      // ─────────────────────────────────────────────────────────────────────
      const distanceToTarget = Math.abs(newValue - target) / target;
      const isNearlyStill = Math.abs(spinVelocityRef.current) < CONFIG.SOFT_LOCK_MAX_VELOCITY;
      
      if (distanceToTarget < CONFIG.SOFT_LOCK_TOLERANCE && isNearlyStill) {
        if (!softLockTimerRef.current) {
          console.log('[DiscoRotazione] Soft-lock initiated');
          softLockTimerRef.current = setTimeout(() => {
            setGameState('success');
            setCurrentValue(target);
            if (isCapacitorNative()) {
              hapticSuccess();
              setTimeout(() => hapticMedium(), 150);
            }
            if (onSuccess) onSuccess(target);
          }, CONFIG.SOFT_LOCK_DURATION);
        }
      } else if (softLockTimerRef.current) {
        clearTimeout(softLockTimerRef.current);
        softLockTimerRef.current = null;
      }

      // ─────────────────────────────────────────────────────────────────────
      // 10. UPDATE STATE
      // ─────────────────────────────────────────────────────────────────────
      setCurrentValue(Math.max(0, newValue));
      setDisplayVelocity(spinVelocityRef.current);
      setRotationAngle(prev => prev + spinVelocityRef.current * 3);

      // Update game state to critical
      if (isInCriticalZone && gameState !== 'critical') {
        setGameState('critical');
        if (isCapacitorNative()) hapticMedium();
      }

      // ─────────────────────────────────────────────────────────────────────
      // 11. HAPTIC FEEDBACK (proportional to velocity)
      // ─────────────────────────────────────────────────────────────────────
      const vel = Math.abs(spinVelocityRef.current);
      if (vel > 0.5) {
        const intensity: 'light' | 'medium' | 'heavy' = 
          vel > 8 ? 'heavy' : vel > 3 ? 'medium' : 'light';
        triggerHaptic(intensity);
      }

      animationFrameRef.current = requestAnimationFrame(physicsLoop);
    };

    animationFrameRef.current = requestAnimationFrame(physicsLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (softLockTimerRef.current) clearTimeout(softLockTimerRef.current);
    };
  }, [gameState, angularVelocity, tiltBrakeForce, motionData, currentValue, target, progress, isInCriticalZone, triggerHaptic, onSuccess, onFail]);

  // ═════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═════════════════════════════════════════════════════════════════════════
  const handleStart = async () => {
    // Request permission if needed
    if (isSupported && !isPermissionGranted) {
      setGameState('waiting_permission');
      const granted = await requestPermission();
      if (!granted) {
        alert('Permesso sensori richiesto per giocare');
        setGameState('idle');
        return;
      }
    }

    // Reset state
    setCurrentValue(0);
    spinVelocityRef.current = 0;
    smoothedOmegaRef.current = 0;
    startFramesAboveThresholdRef.current = 0;
    setTarget(generateTarget());
    setRotationAngle(0);
    
    // Go to ARMED state - wait for motion
    setGameState('armed');
    console.log('[DiscoRotazione] ARMED - waiting for motion...');
  };

  const handleRetry = () => {
    setCurrentValue(0);
    spinVelocityRef.current = 0;
    smoothedOmegaRef.current = 0;
    startFramesAboveThresholdRef.current = 0;
    setTarget(generateTarget());
    setRotationAngle(0);
    setGameState('idle');
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  const intensityClass = Math.abs(displayVelocity) > 6 ? 'high-intensity' :
                         Math.abs(displayVelocity) > 2 ? 'medium-intensity' : 'low-intensity';

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

      {/* Main Disc - SAME SIZE AS BUZZ */}
      <div className={`disco-rotazione ${intensityClass}`}>
        {/* Rotating elements */}
        <div 
          className="disco-rotazione-rotating"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          <div className="disco-led-ring" />
          <div className="disco-dots" />
          <div className="disco-dots-sides" />
        </div>

        {/* Progress arc */}
        {(gameState === 'armed' || gameState === 'running' || gameState === 'critical') && (
          <div 
            className="disco-progress-arc"
            style={{ '--progress': progress } as React.CSSProperties}
          />
        )}

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
        <p className="disco-instructions">
          Attendi autorizzazione sensori...
        </p>
      )}

      {(gameState === 'success' || gameState === 'fail') && (
        <div className="flex gap-4 mt-8">
          <button className="disco-btn" onClick={handleRetry}>
            RIPROVA
          </button>
          {onClose && (
            <button className="disco-btn disco-btn-secondary" onClick={onClose}>
              CHIUDI
            </button>
          )}
        </div>
      )}

      {/* Debug info (DEV only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-20 left-4 text-xs text-white/30 font-mono space-y-0.5">
          <div>state: {gameState}</div>
          <div>spinVel: {displayVelocity.toFixed(2)}</div>
          <div>omega: {smoothedOmegaRef.current.toFixed(1)}°/s</div>
          <div>progress: {(progress * 100).toFixed(1)}%</div>
          <div>tilt: {(motionData?.tilt?.beta ?? 0).toFixed(1)}°</div>
        </div>
      )}
    </div>
  );
};

export default DiscoRotazione;
