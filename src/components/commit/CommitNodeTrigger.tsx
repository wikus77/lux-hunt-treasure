/**
 * COMMIT NODE TRIGGER — 3D Torus Model
 * Opens fullscreen modal on tap
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CommitModal } from './CommitModal';
import './commit-node.css';

// ═══════════════════════════════════════════════════════════════════════════════
// 3D TORUS MODEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface TorusModelProps {
  url: string;
}

const TorusModel: React.FC<TorusModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Auto-rotate slowly
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.3;
    }
  });

  // Scale and center the model
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.8 / maxDim; // Fit to ~1.8 units
      scene.scale.setScalar(scale);
      
      // Center
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center.multiplyScalar(scale));
    }
  }, [scene]);

  return (
    <group ref={modelRef}>
      <primitive object={scene.clone()} />
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

const LoadingFallback: React.FC = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#00ffff" wireframe opacity={0.3} transparent />
  </mesh>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodeTrigger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      setOriginRect(triggerRef.current.getBoundingClientRect());
    }
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      {/* 3D Torus Container */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className="commit-node-3d-wrapper"
        style={{
          width: '90px',
          height: '90px',
          cursor: 'pointer',
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          style={{ 
            width: '100%', 
            height: '100%',
            background: 'transparent',
          }}
          gl={{ 
            alpha: true, 
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#00ffff" />
          <pointLight position={[-2, -2, -2]} intensity={0.5} color="#ffffff" />
          
          <Suspense fallback={<LoadingFallback />}>
            <TorusModel url="/models/torus_noise.glb" />
          </Suspense>
        </Canvas>

        {/* Glow overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.15)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Modal */}
      <CommitModal
        isOpen={isModalOpen}
        onClose={handleClose}
        originRect={originRect}
      />
    </>
  );
};

// Preload model
useGLTF.preload('/models/torus_noise.glb');

export default CommitNodeTrigger;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
