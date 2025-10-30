/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Visual Effects
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Deep space background - exact colors from specs
const SPACE_BG_COLOR = '#0b1021';
const NEBULA_COLOR_1 = '#0f1f3d';
const NEBULA_COLOR_2 = '#14264a';

// Nebula background with shader
export function NebulaBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(NEBULA_COLOR_1) },
          uColor2: { value: new THREE.Color(NEBULA_COLOR_2) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying vec2 vUv;

          // Perlin noise
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          void main() {
            vec2 uv = vUv * 2.0;
            
            // Multi-octave Perlin noise for nebula
            float n1 = snoise(uv * 1.5 + uTime * 0.02);
            float n2 = snoise(uv * 3.0 - uTime * 0.015);
            float n3 = snoise(uv * 6.0 + uTime * 0.01);
            
            float nebula = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1);
            nebula = smoothstep(-0.4, 0.8, nebula);
            
            // Mix exact nebula colors from specs
            vec3 finalColor = mix(uColor1, uColor2, nebula * 0.7);
            
            // Subtle stars
            float stars = step(0.985, fract(sin(dot(uv * 600.0, vec2(12.9898, 78.233))) * 43758.5453));
            finalColor += vec3(stars * 0.25);
            
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[100, 32, 32]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

// Dense particle field (1000-2000 as specified)
export function NeuralParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const count = 1800; // Dense field
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);

      vel[i3] = (Math.random() - 0.5) * 0.015;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.015;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Respawn on boundary
      const dist = Math.sqrt(
        positions[i] ** 2 +
          positions[i + 1] ** 2 +
          positions[i + 2] ** 2
      );

      if (dist > 120 || dist < 35) {
        const radius = 50 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#ffffff"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Dynamic point lights - soft blue/cyan + warm rim
export function DynamicLights() {
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const light3Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Soft blue light
    if (light1Ref.current) {
      light1Ref.current.position.x = Math.sin(t * 0.4) * 10;
      light1Ref.current.position.z = Math.cos(t * 0.4) * 10;
      light1Ref.current.intensity = 0.6 + Math.sin(t * 2) * 0.15;
    }

    // Cyan light
    if (light2Ref.current) {
      light2Ref.current.position.x = Math.sin(t * 0.35 + Math.PI / 2) * 12;
      light2Ref.current.position.z = Math.cos(t * 0.35 + Math.PI / 2) * 12;
      light2Ref.current.intensity = 0.4 + Math.sin(t * 1.8) * 0.1;
    }

    // Warm rim light
    if (light3Ref.current) {
      light3Ref.current.position.x = Math.sin(t * 0.3 + Math.PI) * 8;
      light3Ref.current.position.z = Math.cos(t * 0.3 + Math.PI) * 8;
      light3Ref.current.intensity = 0.4 + Math.sin(t * 1.5) * 0.12;
    }
  });

  return (
    <>
      {/* Soft blue light */}
      <pointLight
        ref={light1Ref}
        color="#2a51ff"
        position={[10, 3, 0]}
        intensity={0.6}
        distance={25}
      />
      
      {/* Cyan light */}
      <pointLight
        ref={light2Ref}
        color="#2fc5ff"
        position={[0, -3, 12]}
        intensity={0.4}
        distance={22}
      />
      
      {/* Warm rim light */}
      <pointLight
        ref={light3Ref}
        color="#ffa06a"
        position={[-8, 2, -10]}
        intensity={0.4}
        distance={20}
      />
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
