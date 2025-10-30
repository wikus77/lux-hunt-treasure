/**
 * © 2025 Joseph MULÉ – M1SSION™ – Synapse Filament Shader Material
 */

import * as THREE from 'three';

export class SynapseMaterial extends THREE.ShaderMaterial {
  constructor(colorA: string, colorB: string) {
    super({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uAudioPower: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uAudioPower;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Smooth noise for energy flow
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        void main() {
          // Gradient along tube length
          float gradientMix = vUv.x;
          
          // Energy flow animation
          float flow = sin(vUv.x * 6.28 - uTime * 3.0) * 0.5 + 0.5;
          
          // Audio-reactive pulse
          float audioPulse = 0.8 + 0.2 * uAudioPower;
          
          // Mix colors with flow and audio
          vec3 color = mix(uColorA, uColorB, gradientMix);
          color = mix(color, uColorB * 1.5, flow * 0.3);
          color *= audioPulse;
          
          // Rim lighting on edges
          float rim = 1.0 - abs(vUv.y - 0.5) * 2.0;
          color += vec3(1.0) * pow(rim, 3.0) * 0.2;
          
          gl_FragColor = vec4(color, 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  updateTime(time: number) {
    this.uniforms.uTime.value = time;
  }

  setAudioPower(power: number) {
    this.uniforms.uAudioPower.value = power;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
