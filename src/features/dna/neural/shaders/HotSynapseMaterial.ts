/**
 * © 2025 Joseph MULÉ – M1SSION™ – Hot Synapse Shader Material
 */

import * as THREE from 'three';

export class HotSynapseMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 1.0 },
        uCoreColor: { value: new THREE.Color('#ffffff') },
        uRimColor: { value: new THREE.Color('#ffa06a') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uCoreColor;
        uniform vec3 uRimColor;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
          
          // Pulsing effect (60-76 BPM)
          float pulse = 0.7 + 0.3 * sin(uTime * 4.5) * uPulse;
          
          // Mix core white with rim orange based on fresnel
          vec3 color = mix(uCoreColor, uRimColor, fresnel * 0.6);
          
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
