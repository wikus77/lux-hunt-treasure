// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

interface Arc {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  birthTime: number;
  lifetime: number;
}

const arcVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const arcFragmentShader = `
uniform float uTime;
uniform float uLifetimeRatio;
uniform float uFieldIntensity;
varying vec2 vUv;

// Simple noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  float t = vUv.x - uTime * 2.0;
  float wave = noise(vec2(t * 8.0, uTime * 3.0)) * 0.5 + 0.5;
  
  // Taper from center to edges
  float taper = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  
  // Cyan (#35E9FF) to violet (#A64DFF) gradient with white spike
  vec3 cyan = vec3(0.208, 0.914, 1.0);
  vec3 violet = vec3(0.651, 0.302, 1.0);
  vec3 white = vec3(1.5, 1.5, 1.5);
  
  vec3 color = mix(cyan, violet, vUv.x);
  if (wave > 0.85) {
    color = mix(color, white, (wave - 0.85) / 0.15);
  }
  
  float intensityMod = mix(0.8, 1.2, uFieldIntensity);
  float alpha = wave * taper * (1.0 - uLifetimeRatio) * intensityMod;
  
  gl_FragColor = vec4(color, alpha);
}
`;

/**
 * Electric Arc Pool - manages up to 80 active arcs with TTL 0.6-1.4s
 */
export class ElectricArcPool {
  private scene: THREE.Scene;
  private arcs: Arc[] = [];
  private readonly MAX_ARCS = 80;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Create arc along a path (start to end)
   */
  createArc(start: THREE.Vector3, end: THREE.Vector3): void {
    // Remove oldest if at capacity
    if (this.arcs.length >= this.MAX_ARCS) {
      const oldest = this.arcs.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
        oldest.mesh.geometry.dispose();
        oldest.material.dispose();
      }
    }

    // Create curve for arc path
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const offset = new THREE.Vector3()
      .subVectors(end, start)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize()
      .multiplyScalar(Math.random() * 0.3);
    mid.add(offset);

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const points = curve.getPoints(32);
    const geometry = new THREE.TubeGeometry(curve, 32, 0.02, 4, false);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uLifetimeRatio: { value: 0 },
          uFieldIntensity: { value: 1.0 }
        },
      vertexShader: arcVertexShader,
      fragmentShader: arcFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    const lifetime = 0.6 + Math.random() * 0.8; // 0.6-1.4s

    this.arcs.push({
      mesh,
      material,
      birthTime: performance.now(),
      lifetime: lifetime * 1000
    });

    // Emit event
    window.dispatchEvent(new CustomEvent('mindfractal:fx-arc', {
      detail: { pathLen: start.distanceTo(end), ttl: lifetime }
    }));
  }

  /**
   * Update all arcs with field intensity modulation
   */
  update(deltaTime: number, fieldIntensity: number = 1.0): void {
    const now = performance.now();
    
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      const age = now - arc.birthTime;
      const ratio = age / arc.lifetime;

      if (ratio >= 1.0) {
        // Remove expired
        this.scene.remove(arc.mesh);
        arc.mesh.geometry.dispose();
        arc.material.dispose();
        this.arcs.splice(i, 1);
      } else {
        // Update uniforms
        arc.material.uniforms.uTime.value += deltaTime;
        arc.material.uniforms.uLifetimeRatio.value = ratio;
        arc.material.uniforms.uFieldIntensity.value = fieldIntensity;
      }
    }
  }

  dispose(): void {
    for (const arc of this.arcs) {
      this.scene.remove(arc.mesh);
      arc.mesh.geometry.dispose();
      arc.material.dispose();
    }
    this.arcs = [];
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
