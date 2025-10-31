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
  
  // Link arcs are brighter - BOOSTED +150% intensity
  float brightnessMod = mix(2.0, 3.0, uIsLink); // Maximum brightness for visibility
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
  private readonly MAX_ARCS = 200; // BOOSTED +100% for maximum density
  private lastIdleSpawn = 0;
  private lastSurge = 0;
  private surgeInterval = 3000 + Math.random() * 3000; // 3-6s randomized
  private ringsPerSegment: number = 0; // Will be calculated from geometry

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Build edge list from tunnel geometry and calculate ring structure
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

    // Estimate edges per ring (assuming cylindrical structure)
    const uniqueZ = new Set<number>();
    for (let i = 0; i < pos.count; i++) {
      uniqueZ.add(Math.round(pos.getZ(i) * 10) / 10); // Round to avoid float precision issues
    }
    const estimatedRings = uniqueZ.size;
    this.ringsPerSegment = estimatedRings > 0 ? Math.floor(this.edges.length / estimatedRings) : 64;

    console.info('[GridArcPool] Bound', this.edges.length, 'edges,', estimatedRings, 'rings,', this.ringsPerSegment, 'edges/ring');
  }

  /**
   * Spawn white link arc
   */
  spawnLinkArc(start: THREE.Vector3, end: THREE.Vector3): void {
    this.createArc(start, end, 0.4, new THREE.Color(0xffffff), true);
  }

  /**
   * Update and spawn idle arcs + periodic surge
   */
  update(deltaTime: number, opts: { reduced: boolean }): void {
    const now = performance.now();
    
    // Spawn idle arcs - BOOSTED +100%
    const targetRate = opts.reduced ? 3.5 : 7.0; // Hz (+100% from original 1.2/2.5)
    const interval = 1000 / targetRate;
    
    if (now - this.lastIdleSpawn > interval && this.edges.length > 0) {
      this.spawnIdleArcChain();
      this.lastIdleSpawn = now;
    }

    // Periodic SURGE - full-mesh propagating discharge
    if (now - this.lastSurge > this.surgeInterval && this.edges.length > 0) {
      this.spawnSurge();
      this.lastSurge = now;
      this.surgeInterval = 3000 + Math.random() * 3000; // Randomize next surge (3-6s)
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
    const ttl = 0.5 + Math.random() * 0.3; // REDUCED for faster turnover (0.5-0.8s)
    
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
    const radius = isLink ? 0.14 : 0.10; // BOOSTED +75% for maximum visibility
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

  /**
   * Spawn SURGE effect - ENHANCED propagating discharge across 8-14 rings
   */
  private spawnSurge(): void {
    const ringCount = 8 + Math.floor(Math.random() * 7); // 8-14 rings (wider propagation)
    const surgeDuration = 250 + Math.random() * 200; // 250-450ms total (longer, more visible)
    const delayPerRing = surgeDuration / ringCount;
    
    const startRing = Math.floor(Math.random() * (this.edges.length / this.ringsPerSegment - ringCount));
    
    console.info('[GridArcPool] 🌊 SURGE activated:', ringCount, 'rings,', surgeDuration.toFixed(0), 'ms');

    for (let r = 0; r < ringCount; r++) {
      setTimeout(() => {
        const ringStartIdx = (startRing + r) * this.ringsPerSegment;
        const ringEndIdx = Math.min(ringStartIdx + this.ringsPerSegment, this.edges.length);
        
        // Color gradient: cyan → violet with progress
        const progress = r / ringCount;
        const hue = 0.52 + progress * 0.08; // 0.52 (cyan) → 0.60 (violet)
        const color = new THREE.Color().setHSL(hue, 1.0, 0.65);
        
        // Spawn arcs for entire ring
        for (let i = ringStartIdx; i < ringEndIdx; i += 2) { // Sample every 2nd edge for performance
          const [p0, p1] = this.edges[i];
          if (p0 && p1) {
            this.createArc(p0, p1, 0.3, color, false);
          }
        }
      }, r * delayPerRing);
    }
    
    // Emit event for potential audio/visual feedback
    window.dispatchEvent(new CustomEvent('mindfractal:surge', {
      detail: { rings: ringCount, duration: surgeDuration }
    }));
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
