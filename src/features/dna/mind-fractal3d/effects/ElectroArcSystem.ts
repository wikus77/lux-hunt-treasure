// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

interface Arc {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  lifetime: number;
  maxLifetime: number;
}

/**
 * ElectroArc shader (neon cyan/violet with noise pulsation)
 */
const arcVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragmentShader = `
  uniform float uTime;
  uniform float uAlpha;
  varying vec2 vUv;
  
  // Simple noise
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    // Distance from arc center
    float dist = abs(vUv.y - 0.5) * 2.0;
    
    // Gradient cyan -> violet
    vec3 cyan = vec3(0.2, 0.8, 1.0);
    vec3 violet = vec3(0.67, 0.4, 1.0);
    vec3 color = mix(cyan, violet, vUv.x);
    
    // Pulsating intensity
    float pulse = sin(uTime * 3.0 + vUv.x * 6.28) * 0.5 + 0.5;
    float noiseVal = noise(vec2(vUv.x * 10.0, uTime * 2.0));
    
    // Core glow
    float core = 1.0 - smoothstep(0.0, 0.4, dist);
    float glow = 1.0 - smoothstep(0.4, 1.0, dist);
    
    float intensity = core + glow * 0.6 + pulse * noiseVal * 0.3;
    
    // Taper at ends
    float taper = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    
    gl_FragColor = vec4(color * intensity * taper, intensity * taper * uAlpha);
  }
`;

/**
 * System to manage neon electric arcs between nodes
 */
export class ElectroArcSystem {
  private scene: THREE.Scene;
  private arcs: Arc[] = [];
  private maxArcs: number;
  private arcPool: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, maxArcs: number = 64) {
    this.scene = scene;
    this.maxArcs = maxArcs;
  }

  /**
   * Create a new arc between two points
   */
  createArc(start: THREE.Vector3, end: THREE.Vector3): void {
    // Remove oldest arc if at capacity
    if (this.arcs.length >= 6) {
      const oldest = this.arcs.shift()!;
      this.scene.remove(oldest.mesh);
      oldest.material.dispose();
      oldest.mesh.geometry.dispose();
    }

    // Generate curve with control points for organic shape
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    mid.add(offset);

    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3().lerpVectors(start, mid, 0.33),
      mid,
      new THREE.Vector3().lerpVectors(mid, end, 0.67),
      end
    ]);

    // Create tube geometry
    const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);

    // Shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: arcVertexShader,
      fragmentShader: arcFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 1.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.arcs.push({
      mesh,
      material,
      lifetime: 0,
      maxLifetime: 2.5
    });
  }

  /**
   * Update all arcs (fade out and remove)
   */
  update(deltaTime: number): void {
    const time = performance.now() * 0.001;

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      arc.lifetime += deltaTime;

      // Update time uniform
      arc.material.uniforms.uTime.value = time;

      // Fade out
      const fadeProgress = arc.lifetime / arc.maxLifetime;
      arc.material.uniforms.uAlpha.value = Math.max(0, 1.0 - fadeProgress);

      // Remove when expired
      if (arc.lifetime >= arc.maxLifetime) {
        this.scene.remove(arc.mesh);
        arc.material.dispose();
        arc.mesh.geometry.dispose();
        this.arcs.splice(i, 1);
      }
    }
  }

  /**
   * Cleanup all arcs
   */
  dispose(): void {
    for (const arc of this.arcs) {
      this.scene.remove(arc.mesh);
      arc.material.dispose();
      arc.mesh.geometry.dispose();
    }
    this.arcs = [];
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
