// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

/**
 * Custom shader material for neon lightning effects
 * Creates animated cyan/violet electric arcs with glow
 */
export function createLightningMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDash: { value: 0 },
      uNoiseScale: { value: 2.5 },
      uCyan: { value: new THREE.Color(0x00ffff) },
      uViolet: { value: new THREE.Color(0xff00ff) },
      uIntensity: { value: 1.0 }
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
      uniform float uDash;
      uniform float uNoiseScale;
      uniform vec3 uCyan;
      uniform vec3 uViolet;
      uniform float uIntensity;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // Simple 1D noise for dash animation
      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }
      
      float noise1d(float x) {
        float i = floor(x);
        float f = fract(x);
        return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
      }
      
      void main() {
        // Dash/serpentine animation
        float dash = noise1d(vUv.x * uNoiseScale + uDash);
        
        // Fade towards endpoints
        float fade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        
        // Color mix based on noise
        vec3 color = mix(uCyan, uViolet, noise1d(vUv.x * 3.0 + uTime * 0.5));
        
        // Glow effect via smoothstep
        float glow = smoothstep(0.3, 0.7, dash) * fade * uIntensity;
        
        gl_FragColor = vec4(color * glow, glow * 0.9);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

export interface LightningBolt {
  line: THREE.Line;
  startTime: number;
  duration: number;
  intensity: number;
}

/**
 * Lightning system for managing multiple electric arcs
 */
export class LightningSystem {
  private bolts: LightningBolt[] = [];
  private material: THREE.ShaderMaterial;
  private scene: THREE.Scene;
  private maxBolts: number;
  private poolSize: number;
  
  constructor(scene: THREE.Scene, maxBolts: number = 64) {
    this.scene = scene;
    this.maxBolts = maxBolts;
    this.poolSize = maxBolts;
    this.material = createLightningMaterial();
  }
  
  /**
   * Create a lightning bolt between two points
   */
  createBolt(
    start: THREE.Vector3,
    end: THREE.Vector3,
    duration: number = 0.5,
    intensity: number = 1.0
  ): void {
    if (this.bolts.length >= this.maxBolts) {
      // Remove oldest bolt
      const oldest = this.bolts.shift();
      if (oldest) {
        this.scene.remove(oldest.line);
      }
    }
    
    // Create line geometry
    const points = [start.clone(), end.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Add UV coordinates for shader
    const uvs = new Float32Array([0, 0, 1, 1]);
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    const line = new THREE.Line(geometry, this.material.clone());
    
    this.scene.add(line);
    
    this.bolts.push({
      line,
      startTime: performance.now(),
      duration: duration * 1000,
      intensity
    });
  }
  
  /**
   * Create idle lightning bolts (background ambient)
   */
  createIdleBolts(tunnelRadius: number, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      const theta1 = Math.random() * Math.PI * 2;
      const theta2 = Math.random() * Math.PI * 2;
      const r1 = tunnelRadius * (0.3 + Math.random() * 0.7);
      const r2 = tunnelRadius * (0.3 + Math.random() * 0.7);
      const z1 = -Math.random() * 8;
      const z2 = z1 - (1 + Math.random() * 2);
      
      const start = new THREE.Vector3(
        Math.cos(theta1) * r1,
        Math.sin(theta1) * r1,
        z1
      );
      
      const end = new THREE.Vector3(
        Math.cos(theta2) * r2,
        Math.sin(theta2) * r2,
        z2
      );
      
      this.createBolt(start, end, 0.3 + Math.random() * 0.4, 0.4 + Math.random() * 0.3);
    }
  }
  
  /**
   * Burst effect: create multiple bolts radiating from center
   */
  createBurst(center: THREE.Vector3, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 1.5 + Math.random() * 1.0;
      
      const end = new THREE.Vector3(
        center.x + Math.cos(angle) * distance,
        center.y + Math.sin(angle) * distance,
        center.z - Math.random() * 0.5
      );
      
      this.createBolt(center, end, 0.8 + Math.random() * 0.4, 1.2 + Math.random() * 0.3);
    }
  }
  
  /**
   * Update animation and remove expired bolts
   */
  update(deltaTime: number): void {
    const now = performance.now();
    
    // Update shader uniforms
    this.bolts.forEach(bolt => {
      const elapsed = now - bolt.startTime;
      const progress = Math.min(elapsed / bolt.duration, 1.0);
      
      if (bolt.line.material instanceof THREE.ShaderMaterial) {
        bolt.line.material.uniforms.uTime.value = now * 0.001;
        bolt.line.material.uniforms.uDash.value = progress * 5.0;
        bolt.line.material.uniforms.uIntensity.value = bolt.intensity * (1.0 - progress);
      }
    });
    
    // Remove expired bolts
    this.bolts = this.bolts.filter(bolt => {
      const elapsed = now - bolt.startTime;
      if (elapsed >= bolt.duration) {
        this.scene.remove(bolt.line);
        bolt.line.geometry.dispose();
        if (bolt.line.material instanceof THREE.Material) {
          bolt.line.material.dispose();
        }
        return false;
      }
      return true;
    });
  }
  
  /**
   * Cleanup all bolts
   */
  dispose(): void {
    this.bolts.forEach(bolt => {
      this.scene.remove(bolt.line);
      bolt.line.geometry.dispose();
      if (bolt.line.material instanceof THREE.Material) {
        bolt.line.material.dispose();
      }
    });
    this.bolts = [];
    this.material.dispose();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
