// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// DISCO ROTAZIONE - Motion-based mini-game
// Move phone with arm/shoulder to advance, tilt to brake
// Target a specific quota without overshooting

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useMotionSensor } from '@/hooks/useMotionSensor';
import { isCapacitorNative } from '@/utils/capacitor';
import { haptic, hapticSuccess, hapticError, hapticHeavy, hapticMedium, hapticLight } from '@/utils/haptics';
import '@/styles/disco-rotazione.css';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  // Target generation
  TARGET_MIN: 800,
  TARGET_MAX: 1300,
  REMEMBER_LAST_N: 5, // Avoid repeating recent targets
  
  // Physics
  BASE_VELOCITY_MULTIPLIER: 0.08, // How much motion affects progress
  INERTIA_DECAY: 0.985, // How quickly velocity decays (1 = no decay)
  MASS_INCREASE_RATE: 0.0003, // Mass increases as progress grows
  MAX_MASS_MULTIPLIER: 3, // Maximum mass effect
  BRAKE_POWER: 0.15, // How strong tilt braking is
  
  // Critical zone
  CRITICAL_ZONE_THRESHOLD: 0.92, // Start difficulty increase at 92%
  CRITICAL_INSTABILITY: 0.3, // Random jitter amplitude in critical zone
  
  // Soft-lock
  SOFT_LOCK_TOLERANCE: 0.005, // How close to target to trigger soft-lock
  SOFT_LOCK_DURATION: 800, // ms to hold for success
  
  // Haptic rate limiting
  HAPTIC_MIN_INTERVAL: 50, // Minimum ms between haptics
  HAPTIC_VELOCITY_THRESHOLD: 5, // Min velocity to trigger haptics
};

// Remember recent targets to avoid repetition
const recentTargets: number[] = [];

const generateTarget = (): number => {
  let target: number;
  let attempts = 0;
  
  do {
    target = Math.floor(
      Math.random() * (CONFIG.TARGET_MAX - CONFIG.TARGET_MIN) + CONFIG.TARGET_MIN
    );
    attempts++;
  } while (recentTargets.includes(target) && attempts < 10);
  
  // Add to memory and trim
  recentTargets.push(target);
  if (recentTargets.length > CONFIG.REMEMBER_LAST_N) {
    recentTargets.shift();
  }
  
  return target;
};

// ═══════════════════════════════════════════════════════════════════════════
// GAME STATES
// ═══════════════════════════════════════════════════════════════════════════
type GameState = 'idle' | 'waiting_permission' | 'running' | 'critical' | 'success' | 'fail';

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
  // Motion sensor
  const { 
    isSupported, 
    isPermissionGranted, 
    requestPermission, 
    angularVelocity, 
    tiltBrakeForce 
  } = useMotionSensor();

  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [target, setTarget] = useState(() => generateTarget());
  const [currentValue, setCurrentValue] = useState(0);
  const [internalVelocity, setInternalVelocity] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Refs for physics
  const velocityRef = useRef(0);
  const massRef = useRef(1);
  const softLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHapticRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate progress (0-1)
  const progress = Math.min(1, currentValue / target);
  const isInCriticalZone = progress >= CONFIG.CRITICAL_ZONE_THRESHOLD;

  // ═════════════════════════════════════════════════════════════════════════
  // HAPTIC FEEDBACK - Rate limited and velocity-proportional
  // ═════════════════════════════════════════════════════════════════════════
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy') => {
    const now = Date.now();
    if (now - lastHapticRef.current < CONFIG.HAPTIC_MIN_INTERVAL) return;
    
    lastHapticRef.current = now;
    
    if (isCapacitorNative()) {
      switch (intensity) {
        case 'heavy': hapticHeavy(); break;
        case 'medium': hapticMedium(); break;
        default: hapticLight(); break;
      }
    } else {
      // Web fallback - vibration API
      if (navigator.vibrate) {
        navigator.vibrate(intensity === 'heavy' ? 30 : intensity === 'medium' ? 15 : 5);
      }
    }
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // PHYSICS LOOP
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (gameState !== 'running' && gameState !== 'critical') return;

    const physicsLoop = () => {
      // Get input velocity from motion sensor
      const inputVelocity = angularVelocity * CONFIG.BASE_VELOCITY_MULTIPLIER;
      
      // Apply mass (increases with progress for difficulty)
      massRef.current = 1 + (progress * CONFIG.MASS_INCREASE_RATE * target * CONFIG.MAX_MASS_MULTIPLIER);
      
      // Add input velocity, reduced by mass
      velocityRef.current += inputVelocity / massRef.current;
      
      // Apply brake from tilt
      const brakeForce = tiltBrakeForce * CONFIG.BRAKE_POWER;
      velocityRef.current *= (1 - brakeForce);
      
      // Apply inertia decay
      velocityRef.current *= CONFIG.INERTIA_DECAY;
      
      // Critical zone instability
      if (isInCriticalZone && Math.random() < 0.1) {
        const jitter = (Math.random() - 0.5) * CONFIG.CRITICAL_INSTABILITY * velocityRef.current;
        velocityRef.current += jitter;
      }
      
      // Update value
      const newValue = currentValue + velocityRef.current;
      
      // Check for overshoot (FAIL)
      if (newValue > target * 1.005) { // 0.5% tolerance
        setGameState('fail');
        setCurrentValue(newValue);
        if (isCapacitorNative()) hapticError();
        if (onFail) onFail(Math.round(newValue));
        return;
      }
      
      // Check for soft-lock (SUCCESS)
      const distanceToTarget = Math.abs(newValue - target) / target;
      if (distanceToTarget < CONFIG.SOFT_LOCK_TOLERANCE && Math.abs(velocityRef.current) < 0.1) {
        if (!softLockTimerRef.current) {
          softLockTimerRef.current = setTimeout(() => {
            setGameState('success');
            setCurrentValue(target);
            if (isCapacitorNative()) hapticSuccess();
            if (onSuccess) onSuccess(target);
          }, CONFIG.SOFT_LOCK_DURATION);
        }
      } else if (softLockTimerRef.current) {
        clearTimeout(softLockTimerRef.current);
        softLockTimerRef.current = null;
      }
      
      // Update state
      setCurrentValue(Math.max(0, newValue));
      setInternalVelocity(velocityRef.current);
      setRotationAngle(prev => prev + velocityRef.current * 5);
      
      // Update game state
      if (isInCriticalZone && gameState !== 'critical') {
        setGameState('critical');
      }
      
      // Haptic feedback based on velocity
      if (Math.abs(velocityRef.current) > CONFIG.HAPTIC_VELOCITY_THRESHOLD) {
        const intensity = Math.abs(velocityRef.current) > 20 ? 'heavy' : 
                          Math.abs(velocityRef.current) > 10 ? 'medium' : 'light';
        // Rate limit haptics more when going fast
        const interval = CONFIG.HAPTIC_MIN_INTERVAL + (100 - Math.min(100, Math.abs(velocityRef.current) * 3));
        if (Date.now() - lastHapticRef.current > interval) {
          triggerHaptic(intensity);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(physicsLoop);
    };

    animationFrameRef.current = requestAnimationFrame(physicsLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (softLockTimerRef.current) {
        clearTimeout(softLockTimerRef.current);
      }
    };
  }, [gameState, angularVelocity, tiltBrakeForce, currentValue, target, progress, isInCriticalZone, triggerHaptic, onSuccess, onFail]);

  // ═════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═════════════════════════════════════════════════════════════════════════
  const handleStart = async () => {
    if (!isSupported) {
      // Fallback for non-supported devices (desktop debug)
      setGameState('running');
      return;
    }

    if (!isPermissionGranted) {
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
    velocityRef.current = 0;
    massRef.current = 1;
    setTarget(generateTarget());
    setRotationAngle(0);
    setGameState('running');
    
    if (isCapacitorNative()) hapticHeavy();
  };

  const handleRetry = () => {
    setCurrentValue(0);
    velocityRef.current = 0;
    massRef.current = 1;
    setTarget(generateTarget());
    setRotationAngle(0);
    setGameState('idle');
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  const intensityClass = Math.abs(internalVelocity) > 15 ? 'high-intensity' :
                         Math.abs(internalVelocity) > 5 ? 'medium-intensity' : 'low-intensity';

  return (
    <div className="disco-rotazione-container">
      {/* Status */}
      {gameState === 'running' && (
        <div className="disco-status running">RUOTA IL TELEFONO</div>
      )}
      {gameState === 'critical' && (
        <div className="disco-status critical">⚡ ZONA CRITICA</div>
      )}

      {/* Main Disc */}
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
        {(gameState === 'running' || gameState === 'critical') && (
          <div 
            className="disco-progress-arc"
            style={{ '--progress': progress } as React.CSSProperties}
          />
        )}

        {/* Counter */}
        <div className="disco-rotazione-content">
          <AnimatePresence mode="wait">
            {gameState === 'idle' || gameState === 'waiting_permission' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <span 
                  className="disco-counter"
                  style={{ fontSize: 'clamp(36px, 10vw, 52px)' }}
                >
                  {target}
                </span>
              </motion.div>
            ) : gameState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="disco-result-overlay"
              >
                <CheckCircle2 className="disco-result-icon text-green-400" />
                <span className="disco-result-text success">PERFETTO!</span>
              </motion.div>
            ) : gameState === 'fail' ? (
              <motion.div
                key="fail"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="disco-result-overlay"
              >
                <XCircle className="disco-result-icon text-red-400" />
                <span className="disco-result-text fail">OLTREPASSATO!</span>
              </motion.div>
            ) : (
              <motion.span
                key="counter"
                className={`disco-counter ${isInCriticalZone ? 'critical' : ''}`}
                animate={isInCriticalZone ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {Math.round(currentValue)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Target indicator */}
        {(gameState === 'running' || gameState === 'critical') && (
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
        <div className="fixed bottom-20 left-4 text-xs text-white/30 font-mono">
          <div>v: {internalVelocity.toFixed(2)}</div>
          <div>m: {massRef.current.toFixed(2)}</div>
          <div>p: {(progress * 100).toFixed(1)}%</div>
          <div>motion: {angularVelocity.toFixed(1)}°/s</div>
          <div>brake: {(tiltBrakeForce * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
};

export default DiscoRotazione;
