// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EMPWave3DProps {
  centerLatLng: [number, number];
  onEnd?: () => void;
}

function EMPWave3DInner({ centerLatLng, onEnd }: EMPWave3DProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startTime = useRef(Date.now());

  const center = new THREE.Vector3(centerLatLng[1] * 0.1, 0, centerLatLng[0] * 0.1);

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    progress.current = Math.min(elapsed / 2000, 1);

    if (ringRef.current) {
      const scale = 1 + progress.current * 3;
      ringRef.current.scale.set(scale, scale, scale);
      
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 1 - progress.current;
    }

    if (progress.current >= 1 && onEnd) {
      onEnd();
    }
  });

  return (
    <mesh ref={ringRef} position={center} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.7, 32]} />
      <meshBasicMaterial color="cyan" transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function EMPWave3D(props: EMPWave3DProps) {
  useEffect(() => {
    console.debug('[BattleFX] EMPWave3D mounted');
    return () => console.debug('[BattleFX] EMPWave3D unmounted');
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <EMPWave3DInner {...props} />
      </Canvas>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
