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
  
  float taper = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  
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
 * Grid Arc Pool - idle arcs that follow tunnel wireframe edges
 */
export class GridArcPool {
  private scene: THREE.Scene;
  private edges: Array<[THREE.Vector3, THREE.Vector3]>;
  private arcs: Arc[] = [];
  private readonly MAX_ARCS = 80;
  private baseRate = 2.5; // arcs/sec
  private rateBoost = 0;
  private boostEndTime = 0;
  private lastSpawn = 0;

  constructor(scene: THREE.Scene, edges: Array<[THREE.Vector3, THREE.Vector3]>) {
    this.scene = scene;
    this.edges = edges;
  }

  updateEdges(edges: Array<[THREE.Vector3, THREE.Vector3]>): void {
    this.edges = edges;
  }

  boostRate(amount: number, duration: number): void {
    this.rateBoost = amount;
    this.boostEndTime = performance.now() + duration;
  }

  update(deltaTime: number, fieldIntensity: number, reduced: boolean): void {
    const now = performance.now();

    // Decay boost
    if (this.rateBoost > 0 && now > this.boostEndTime) {
      this.rateBoost = Math.max(0, this.rateBoost - 0.01);
    }

    // Effective rate
    const effectiveRate = reduced
      ? (this.baseRate + this.rateBoost) * 0.5
      : (this.baseRate + this.rateBoost);

    const expectedInterval = 1000 / effectiveRate;
    const shouldSpawn = (now - this.lastSpawn) > expectedInterval * (0.8 + Math.random() * 0.4);

    if (shouldSpawn) {
      this.spawnIdleArc();
      this.lastSpawn = now;
    }

    // Update existing arcs
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      const age = now - arc.birthTime;
      const ratio = age / arc.lifetime;

      if (ratio >= 1.0) {
        this.scene.remove(arc.mesh);
        arc.mesh.geometry.dispose();
        arc.material.dispose();
        this.arcs.splice(i, 1);
      } else {
        arc.material.uniforms.uTime.value += deltaTime;
        arc.material.uniforms.uLifetimeRatio.value = ratio;
        arc.material.uniforms.uFieldIntensity.value = fieldIntensity;
      }
    }
  }

  private spawnIdleArc(): void {
    if (this.arcs.length >= this.MAX_ARCS || this.edges.length === 0) return;

    // Remove oldest if at capacity
    if (this.arcs.length >= this.MAX_ARCS) {
      const oldest = this.arcs.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
        oldest.mesh.geometry.dispose();
        oldest.material.dispose();
      }
    }

    // Random walk along edges (6-12 segments)
    const segmentCount = 6 + Math.floor(Math.random() * 7);
    const pathPoints: THREE.Vector3[] = [];
    
    let currentEdgeIdx = Math.floor(Math.random() * this.edges.length);
    let currentEnd = Math.random() > 0.5 ? 0 : 1;
    
    pathPoints.push(this.edges[currentEdgeIdx][currentEnd].clone());

    for (let i = 0; i < segmentCount; i++) {
      const nextEdgeIdx = Math.floor(Math.random() * this.edges.length);
      const nextEnd = Math.random() > 0.5 ? 0 : 1;
      pathPoints.push(this.edges[nextEdgeIdx][nextEnd].clone());
      currentEdgeIdx = nextEdgeIdx;
      currentEnd = 1 - nextEnd;
    }

    // Create curve
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const tubeRadius = 0.06; // Cinematic visibility
    const geometry = new THREE.TubeGeometry(curve, 32, tubeRadius, 6, false);

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

    const lifetime = 0.8 + Math.random() * 0.6; // 0.8-1.4s

    this.arcs.push({
      mesh,
      material,
      birthTime: performance.now(),
      lifetime: lifetime * 1000
    });
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
