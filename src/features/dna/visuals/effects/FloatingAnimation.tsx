// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingAnimationProps {
  children: React.ReactNode;
  amplitude?: number;
  period?: number;
  enabled?: boolean;
}

export const FloatingAnimation: React.FC<FloatingAnimationProps> = ({
  children,
  amplitude = 0.015,
  period = 7,
  enabled = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const startY = useRef<number>(0);

  useFrame((state) => {
    if (!groupRef.current || !enabled) return;
    
    if (startY.current === 0) {
      startY.current = groupRef.current.position.y;
    }
    
    const time = state.clock.elapsedTime;
    const offset = Math.sin((time * Math.PI * 2) / period) * amplitude;
    groupRef.current.position.y = startY.current + offset;
  });

  return <group ref={groupRef}>{children}</group>;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
