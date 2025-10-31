// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

/**
 * Seeded random for deterministic geometry
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

/**
 * Simple 1D Perlin-like noise
 */
function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3.0 - 2.0 * f);
  
  const a = Math.sin(i * 12.9898 + 78.233) * 43758.5453123;
  const b = Math.sin((i + 1) * 12.9898 + 78.233) * 43758.5453123;
  
  return (a - Math.floor(a)) * (1 - u) + (b - Math.floor(b)) * u;
}

export interface TunnelConfig {
  rings: number;
  segments: number;
  radius: number;
  depth: number;
  baseTwist?: number;
  noiseAmp?: number;
}

export interface TunnelData {
  geometry: THREE.BufferGeometry;
  edges: Array<[THREE.Vector3, THREE.Vector3]>;
}

/**
 * Build fractal tunnel with progressive twist and cached edges for arcs
 */
export function buildFractalTunnel(config: TunnelConfig): TunnelData {
  const { rings, segments, radius, depth, baseTwist = 0, noiseAmp = 0.15 } = config;
  const rng = new SeededRandom(42);
  
  const positions: number[] = [];
  const indices: number[] = [];
  const edges: Array<[THREE.Vector3, THREE.Vector3]> = [];

  // Generate vertices with spiral, twist, and noise
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = t * depth;
    
    // Progressive twist per ring (perceptible torsion)
    const progressiveTwist = baseTwist * (r / rings);
    const spiralRotation = t * Math.PI * 0.5 + progressiveTwist;
    
    // Radius degradation (exponential toward center)
    const currentRadius = radius * Math.pow(1 - t, 1.2) + 0.5;
    
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2 + spiralRotation;
      
      // Organic jitter
      const noiseVal = noise1D(r * 0.3 + s * 0.15) * noiseAmp;
      const jitterR = (rng.next() - 0.5) * currentRadius * 0.08;
      const jitterZ = (rng.next() - 0.5) * 0.3;
      
      const x = Math.cos(theta) * (currentRadius + noiseVal + jitterR);
      const y = Math.sin(theta) * (currentRadius + noiseVal + jitterR);
      
      positions.push(x, y, z + jitterZ);
    }
  }

  // Generate triangle indices and extract edges
  const edgeSet = new Set<string>();
  
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const current = r * (segments + 1) + s;
      const next = current + segments + 1;
      
      indices.push(current, next, current + 1);
      indices.push(current + 1, next, next + 1);
      
      // Extract unique edges for grid arcs
      const addEdge = (a: number, b: number) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          const v1 = new THREE.Vector3(
            positions[a * 3],
            positions[a * 3 + 1],
            positions[a * 3 + 2]
          );
          const v2 = new THREE.Vector3(
            positions[b * 3],
            positions[b * 3 + 1],
            positions[b * 3 + 2]
          );
          edges.push([v1, v2]);
        }
      };

      addEdge(current, next);
      addEdge(current, current + 1);
      addEdge(next, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  return { geometry, edges };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
