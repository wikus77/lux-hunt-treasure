// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

interface Arc {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  birthTime: number;
  lifetime: number;
  isLink: boolean;
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
uniform vec3 uColor;
uniform float uIsLink;
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
  
  vec3 color = uColor;
  
  // White spike at wave peak (last 15%)
  if (wave > 0.85) {
    color = mix(color, vec3(1.5), (wave - 0.85) / 0.15);
  }
  
  // Link arcs are brighter
  float brightnessMod = mix(1.0, 1.5, uIsLink);
  float alpha = wave * taper * (1.0 - uLifetimeRatio) * brightnessMod;
  
  gl_FragColor = vec4(color, alpha);
}
`;

/**
 * Grid Arc Pool - spawns arcs that follow tunnel edges
 */
export class GridArcPool {
  private scene: THREE.Scene;
  private arcs: Arc[] = [];
  private edges: Array<[THREE.Vector3, THREE.Vector3]> = [];
  private readonly MAX_ARCS = 80;
  private lastIdleSpawn = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Build edge list from tunnel geometry
   */
  bindGeometry(geometry: THREE.BufferGeometry): void {
    this.edges = [];
    const pos = geometry.getAttribute('position');
    const index = geometry.getIndex();
    if (!index || !pos) return;

    const getVec = (i: number) =>
      new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));

    // Extract edges from triangles
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      
      this.edges.push([getVec(a), getVec(b)]);
      this.edges.push([getVec(b), getVec(c)]);
      this.edges.push([getVec(c), getVec(a)]);
    }

    console.info('[GridArcPool] Bound', this.edges.length, 'edges');
  }

  /**
   * Spawn white link arc
   */
  spawnLinkArc(start: THREE.Vector3, end: THREE.Vector3): void {
    this.createArc(start, end, 0.4, new THREE.Color(0xffffff), true);
  }

  /**
   * Update and spawn idle arcs
   */
  update(deltaTime: number, opts: { reduced: boolean }): void {
    const now = performance.now();
    
    // Spawn idle arcs
    const targetRate = opts.reduced ? 1.2 : 2.5; // Hz
    const interval = 1000 / targetRate;
    
    if (now - this.lastIdleSpawn > interval && this.edges.length > 0) {
      this.spawnIdleArcChain();
      this.lastIdleSpawn = now;
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
      }
    }
  }

  /**
   * Spawn short chain of arcs along edges
   */
  private spawnIdleArcChain(): void {
    const chainLength = 5 + Math.floor(Math.random() * 8); // 5-12 edges
    let startIdx = Math.floor(Math.random() * this.edges.length);
    
    const hue = 0.55 + Math.random() * 0.1; // cyan→violet range
    const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
    const ttl = 0.7 + Math.random() * 0.3;
    
    for (let i = 0; i < chainLength && startIdx < this.edges.length; i++) {
      const [p0, p1] = this.edges[startIdx];
      if (p0 && p1) {
        this.createArc(p0, p1, ttl, color, false);
      }
      startIdx = (startIdx + 1 + Math.floor(Math.random() * 3)) % this.edges.length;
    }
  }

  /**
   * Create tube arc between two points
   */
  private createArc(
    start: THREE.Vector3,
    end: THREE.Vector3,
    ttl: number,
    color: THREE.Color,
    isLink: boolean
  ): void {
    if (this.arcs.length >= this.MAX_ARCS) {
      const oldest = this.arcs.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
        oldest.mesh.geometry.dispose();
        oldest.material.dispose();
      }
    }

    const curve = new THREE.LineCurve3(start, end);
    const radius = isLink ? 0.08 : 0.06;
    const geometry = new THREE.TubeGeometry(curve, 8, radius, 4, false);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLifetimeRatio: { value: 0 },
        uColor: { value: color },
        uIsLink: { value: isLink ? 1.0 : 0.0 }
      },
      vertexShader: arcVertexShader,
      fragmentShader: arcFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.arcs.push({
      mesh,
      material,
      birthTime: performance.now(),
      lifetime: ttl * 1000,
      isLink
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
