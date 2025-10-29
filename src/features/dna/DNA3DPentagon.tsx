// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Debug flag
const DEBUG_DNA_3D = true;

interface DNA3DPentagonProps {
  rotation: { x: number; y: number };
  color: string;
  size: number;
}

/**
 * 3D Pentagon Mesh Component
 * Reads rotation from parent, no internal state
 */
const Pentagon3D: React.FC<{ rotation: { x: number; y: number }; color: string }> = ({ rotation, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create pentagon shape (5-sided polygon)
  const pentagonGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 5;
    const radius = 1.2;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);
  
  // Apply rotation from parent (no interpolation here, parent handles smoothing)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (rotation.x * Math.PI) / 180;
      meshRef.current.rotation.y = (rotation.y * Math.PI) / 180;
    }
  });
  
  // Parse color (handles both hex and rgb)
  const meshColor = useMemo(() => {
    try {
      return new THREE.Color(color);
    } catch {
      return new THREE.Color('#00FFFF'); // fallback cyan
    }
  }, [color]);
  
  return (
    <mesh ref={meshRef} geometry={pentagonGeometry}>
      <MeshTransmissionMaterial
        color={meshColor}
        emissive={meshColor}
        emissiveIntensity={0.4}
        metalness={0.2}
        roughness={0.1}
        transmission={0.6}
        thickness={0.8}
        ior={1.5}
        chromaticAberration={0.02}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
};

/**
 * DNA 3D Pentagon Canvas Wrapper
 * Full React Three Fiber scene with lighting and environment
 */
export const DNA3DPentagon: React.FC<DNA3DPentagonProps> = ({ rotation, color, size }) => {
  // Debug trace on mount only
  React.useEffect(() => {
    if (DEBUG_DNA_3D) {
      console.log('[DNA TRACE] 3D active (React Three Fiber)');
    }
  }, []);
  
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: 'transparent',
          pointerEvents: 'none' // Let parent handle all input
        }}
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 5]} intensity={1.0} />
        <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#4444ff" />
        <pointLight position={[0, 0, 3]} intensity={0.6} color={color} distance={10} />
        
        {/* Pentagon mesh */}
        <Pentagon3D rotation={rotation} color={color} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
      </Canvas>
      
      {/* Soft shadow underneath (CSS) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '20px',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
