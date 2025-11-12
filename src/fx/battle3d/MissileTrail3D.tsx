// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface MissileTrail3DProps {
  fromLatLng: [number, number];
  toLatLng: [number, number];
  onEnd?: () => void;
}

function MissileTrail3DInner({ fromLatLng, toLatLng, onEnd }: MissileTrail3DProps) {
  const lineRef = useRef<any>(null);
  const progress = useRef(0);
  const startTime = useRef(Date.now());

  // Convert lat/lng to simple 3D coordinates (placeholder - adjust based on your scene)
  const from = new THREE.Vector3(fromLatLng[1] * 0.1, 0, fromLatLng[0] * 0.1);
  const to = new THREE.Vector3(toLatLng[1] * 0.1, 0, toLatLng[0] * 0.1);

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    progress.current = Math.min(elapsed / 1500, 1);

    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = progress.current < 0.8 ? 1 : (1 - progress.current) / 0.2;
    }

    if (progress.current >= 1 && onEnd) {
      onEnd();
    }
  });

  const points = [from, to];

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color="red"
        lineWidth={3}
        transparent
        opacity={1}
      />
      {progress.current > 0.8 && (
        <mesh position={to}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="orange" />
        </mesh>
      )}
    </group>
  );
}

export function MissileTrail3D(props: MissileTrail3DProps) {
  useEffect(() => {
    console.debug('[BattleFX] MissileTrail3D mounted');
    return () => console.debug('[BattleFX] MissileTrail3D unmounted');
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <MissileTrail3DInner {...props} />
      </Canvas>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
