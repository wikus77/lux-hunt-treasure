import { useState, useEffect, useRef } from 'react';

interface RadarSweepState {
  angle: number;
  opacity: number;
  pulse: number;
}

export function useRadarSweep(enabled = true) {
  const [state, setState] = useState<RadarSweepState>({
    angle: 0,
    opacity: 0.35,
    pulse: 1
  });
  
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const rotationPeriod = 20000; // 20s per full rotation
      const pulsePeriod = 2000; // 2s pulse cycle
      
      const angle = (elapsed % rotationPeriod) / rotationPeriod * 360;
      const pulsePhase = (elapsed % pulsePeriod) / pulsePeriod;
      const pulse = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.15;
      
      setState({
        angle,
        opacity: 0.35,
        pulse
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);

  return state;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
