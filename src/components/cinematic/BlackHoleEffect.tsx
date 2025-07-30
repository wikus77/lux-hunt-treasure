// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface BlackHoleEffectProps {
  isVisible: boolean;
  onComplete: () => void;
}

const BlackHoleShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    vec3 blackHole(vec2 uv, vec2 center, float intensity) {
      vec2 dir = uv - center;
      float dist = length(dir);
      
      // Event horizon
      float horizon = 0.2 * intensity;
      
      // Accretion disk
      float disk = smoothstep(horizon, horizon + 0.3, dist) * 
                   smoothstep(0.8, 0.6, dist);
      
      // Gravitational lensing effect
      float lensing = 1.0 - smoothstep(0.0, horizon * 2.0, dist);
      
      // Swirl effect
      float angle = atan(dir.y, dir.x) + uTime * 2.0 + dist * 10.0;
      float spiral = sin(angle * 5.0) * 0.5 + 0.5;
      
      // Combine effects
      vec3 color = vec3(0.0);
      color += vec3(0.0, 0.7, 1.0) * disk * spiral * 0.3; // Cyan accretion
      color += vec3(1.0, 0.4, 0.0) * disk * (1.0 - spiral) * 0.2; // Orange glow
      
      // Black center
      color *= (1.0 - smoothstep(0.0, horizon, dist));
      
      return color;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5, 0.5);
      
      vec3 color = blackHole(uv, center, uIntensity);
      
      // Add noise for realism
      float n = noise(uv * 20.0 + uTime);
      color += n * 0.1 * uIntensity;
      
      gl_FragColor = vec4(color, uIntensity);
    }
  `
};

const BlackHoleMesh: React.FC<{ isVisible: boolean; onComplete: () => void }> = ({ isVisible, onComplete }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  useEffect(() => {
    if (isVisible && materialRef.current) {
      gsap.timeline()
        .to(materialRef.current.uniforms.uIntensity, {
          duration: 2,
          value: 1,
          ease: "power2.inOut"
        })
        .to(materialRef.current.uniforms.uIntensity, {
          duration: 1,
          value: 0.3,
          ease: "power2.out",
          onComplete
        });
    }
  }, [isVisible, onComplete]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!isVisible) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        {...BlackHoleShader}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const BlackHoleEffect: React.FC<BlackHoleEffectProps> = ({ isVisible, onComplete }) => {
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <BlackHoleMesh isVisible={isVisible} onComplete={onComplete} />
      </Canvas>
    </div>
  );
};

export default BlackHoleEffect;