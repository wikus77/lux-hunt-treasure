// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface StarfieldBackgroundProps {
  count?: number;
  radius?: number;
  reducedMotion?: boolean;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  count = 1000,
  radius = 100,
  reducedMotion = false
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + Math.random() * radius * 0.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star colors (white to cyan)
      const colorMix = Math.random();
      colors[i * 3] = 0.8 + colorMix * 0.2;
      colors[i * 3 + 1] = 0.9 + colorMix * 0.1;
      colors[i * 3 + 2] = 1.0;
    }

    return [positions, colors];
  }, [count, radius]);

  // Subtle parallax rotation
  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) return;
    
    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = time * 0.01;
    pointsRef.current.rotation.x = Math.sin(time * 0.005) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
