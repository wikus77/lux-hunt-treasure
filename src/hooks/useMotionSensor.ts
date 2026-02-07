// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// Motion Sensor Hook for Disco Rotazione Mini-Game
// Uses DeviceMotionEvent for rotation tracking via arm/shoulder movement

import { useState, useEffect, useRef, useCallback } from 'react';
import { isCapacitorNative, isCapacitorIOS } from '@/utils/capacitor';

export interface MotionData {
  rotationRate: { alpha: number; beta: number; gamma: number };
  acceleration: { x: number; y: number; z: number };
  tilt: { beta: number; gamma: number }; // For braking
}

interface UseMotionSensorReturn {
  isSupported: boolean;
  isPermissionGranted: boolean | null;
  requestPermission: () => Promise<boolean>;
  motionData: MotionData | null;
  angularVelocity: number; // Combined rotation velocity
  tiltBrakeForce: number; // 0-1, how much tilt is braking
}

const SMOOTHING_FACTOR = 0.3; // Lower = smoother, higher = more responsive

export const useMotionSensor = (): UseMotionSensorReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [tiltBrakeForce, setTiltBrakeForce] = useState(0);

  const smoothedVelocityRef = useRef(0);
  const lastUpdateRef = useRef(0);

  // Check support
  useEffect(() => {
    const supported = typeof DeviceMotionEvent !== 'undefined';
    setIsSupported(supported);

    // On non-iOS or older browsers, permission might be implicit
    if (supported && !isCapacitorIOS()) {
      // Try to see if we can access without permission
      setIsPermissionGranted(true);
    }
  }, []);

  // Request permission (required on iOS 13+)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[MotionSensor] Not supported');
      return false;
    }

    // iOS 13+ requires explicit permission request from user gesture
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        const granted = permission === 'granted';
        setIsPermissionGranted(granted);
        console.log('[MotionSensor] Permission:', permission);
        return granted;
      } catch (err) {
        console.error('[MotionSensor] Permission error:', err);
        setIsPermissionGranted(false);
        return false;
      }
    } else {
      // Non-iOS or older browsers - assume granted
      setIsPermissionGranted(true);
      return true;
    }
  }, [isSupported]);

  // Motion event handler
  useEffect(() => {
    if (!isSupported || isPermissionGranted !== true) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      
      // Throttle to ~60fps
      if (now - lastUpdateRef.current < 16) return;
      lastUpdateRef.current = now;

      const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
      const acceleration = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

      // Calculate angular velocity from rotation rate
      // Use gamma (twist around z-axis when holding phone vertically) and beta
      // for arm movement detection
      const alpha = rotationRate.alpha || 0;
      const beta = rotationRate.beta || 0;
      const gamma = rotationRate.gamma || 0;

      // Combined rotation magnitude (degrees per second)
      // Emphasize gamma (wrist rotation) and alpha (horizontal spin)
      const rawVelocity = Math.sqrt(
        (gamma * gamma) * 1.5 + // Wrist rotation - most important
        (alpha * alpha) * 0.8 + // Horizontal spin
        (beta * beta) * 0.3     // Forward/back tilt - less important
      );

      // Smooth the velocity
      smoothedVelocityRef.current = 
        smoothedVelocityRef.current * (1 - SMOOTHING_FACTOR) + 
        rawVelocity * SMOOTHING_FACTOR;

      // Calculate tilt brake force from device orientation
      // When phone is tilted forward (negative beta) = braking
      const tiltBeta = acceleration.y || 0;
      const tiltGamma = acceleration.x || 0;
      
      // Normalize tilt to 0-1 brake force
      // Tilting forward (leaning phone down) = stronger brake
      const normalizedTilt = Math.min(1, Math.max(0, 
        (Math.abs(tiltBeta) / 10) + (Math.abs(tiltGamma) / 10)
      )) * 0.5; // Max 50% from tilt alone

      setMotionData({
        rotationRate: { alpha, beta, gamma },
        acceleration: { 
          x: acceleration.x || 0, 
          y: acceleration.y || 0, 
          z: acceleration.z || 0 
        },
        tilt: { 
          beta: tiltBeta, 
          gamma: tiltGamma 
        }
      });

      setAngularVelocity(smoothedVelocityRef.current);
      setTiltBrakeForce(normalizedTilt);
    };

    window.addEventListener('devicemotion', handleMotion, true);

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [isSupported, isPermissionGranted]);

  return {
    isSupported,
    isPermissionGranted,
    requestPermission,
    motionData,
    angularVelocity,
    tiltBrakeForce
  };
};

export default useMotionSensor;
