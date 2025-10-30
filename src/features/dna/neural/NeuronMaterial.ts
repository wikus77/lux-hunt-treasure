/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neuron Shader Material
 */

import * as THREE from 'three';

export class NeuronMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 1.0 },
        uCoreColor: { value: new THREE.Color('#ffb23a') },
        uMembraneColor: { value: new THREE.Color('#ffd37a') },
        uHaloColor: { value: new THREE.Color('#ffa06a') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uCoreColor;
        uniform vec3 uMembraneColor;
        uniform vec3 uHaloColor;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
          
          // Pulsing effect (68-76 BPM)
          float pulse = 0.85 + 0.15 * sin(uTime * 4.71) * uPulse;
          
          // Core to membrane gradient
          float coreMix = smoothstep(0.3, 0.7, length(vUv - 0.5) * 2.0);
          vec3 baseColor = mix(uCoreColor, uMembraneColor, coreMix);
          
          // Add hot halo on edges
          vec3 color = mix(baseColor, uHaloColor, fresnel * 0.7);
          
          // Apply pulse to intensity
          color *= pulse;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
      blending: THREE.AdditiveBlending,
    });
  }

  updateTime(time: number) {
    this.uniforms.uTime.value = time;
  }

  setPulse(pulse: number) {
    this.uniforms.uPulse.value = pulse;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
