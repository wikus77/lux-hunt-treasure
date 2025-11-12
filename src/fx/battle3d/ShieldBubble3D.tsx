// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShieldBubble3DProps {
  targetLatLng: [number, number];
  onEnd?: () => void;
}

function ShieldBubble3DInner({ targetLatLng, onEnd }: ShieldBubble3DProps) {
  const bubbleRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const startTime = useRef(Date.now());

  const target = new THREE.Vector3(targetLatLng[1] * 0.1, 0, targetLatLng[0] * 0.1);

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    progress.current = Math.min(elapsed / 2500, 1);

    if (bubbleRef.current) {
      const pulse = Math.sin(elapsed * 0.005) * 0.1 + 1;
      bubbleRef.current.scale.set(pulse, pulse, pulse);
      
      const material = bubbleRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.6 - progress.current * 0.6);
    }

    if (progress.current >= 1 && onEnd) {
      onEnd();
    }
  });

  return (
    <mesh ref={bubbleRef} position={target}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="blue" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function ShieldBubble3D(props: ShieldBubble3DProps) {
  useEffect(() => {
    console.debug('[BattleFX] ShieldBubble3D mounted');
    return () => console.debug('[BattleFX] ShieldBubble3D unmounted');
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <ShieldBubble3DInner {...props} />
      </Canvas>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
