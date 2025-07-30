// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface InkDropEffectProps {
  onComplete: () => void;
}

const InkDropShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 st = vUv;
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(st, center);
      
      // Ink drop expansion
      float dropRadius = uProgress * 1.5;
      float ripple = sin(dist * 20.0 - uTime * 10.0) * 0.1;
      float ink = smoothstep(dropRadius + ripple, dropRadius - 0.1, dist);
      
      // Add noise for organic feel
      float n = noise(st * 10.0 + uTime);
      ink += n * 0.1 * uProgress;
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, ink);
    }
  `
};

const InkDropMesh: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  useEffect(() => {
    // GSAP animation for ink drop
    gsap.timeline()
      .to(materialRef.current?.uniforms.uProgress, {
        duration: 1.5,
        value: 1,
        ease: "power2.out",
        onComplete
      });
  }, [onComplete]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        {...InkDropShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

const InkDropEffect: React.FC<InkDropEffectProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <InkDropMesh onComplete={onComplete} />
      </Canvas>
    </div>
  );
};

export default InkDropEffect;