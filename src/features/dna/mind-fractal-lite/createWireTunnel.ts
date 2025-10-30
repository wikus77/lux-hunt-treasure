// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

export interface TunnelConfig {
  rings: number;
  segments: number;
  startRadius: number;
  endRadius: number;
  depth: number;
}

/**
 * Seeded random number generator for deterministic jitter
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
 * Creates a wireframe tunnel geometry with organic deformation
 * Replicates the reference image: triangular mesh degrading towards center
 */
export function createWireTunnel(config: TunnelConfig, seed: number): THREE.LineSegments {
  const { rings, segments, startRadius, endRadius, depth } = config;
  
  const rng = new SeededRandom(seed);
  const vertices: number[] = [];
  
  // Generate ring vertices with decreasing radius and organic jitter
  const ringData: THREE.Vector3[][] = [];
  
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = -t * depth;
    const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);
    
    const ring: THREE.Vector3[] = [];
    
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      
      // Organic jitter (scale with radius to maintain proportions)
      const jitterAmount = radius * 0.08;
      const jitterX = (rng.next() - 0.5) * jitterAmount;
      const jitterY = (rng.next() - 0.5) * jitterAmount;
      const jitterZ = (rng.next() - 0.5) * (depth * 0.02);
      
      const x = Math.cos(theta) * radius + jitterX;
      const y = Math.sin(theta) * radius + jitterY;
      
      ring.push(new THREE.Vector3(x, y, z + jitterZ));
    }
    
    ringData.push(ring);
  }
  
  // Create line segments for edges (wireframe effect)
  // Connect radial lines and circumferential lines
  
  for (let r = 0; r < rings; r++) {
    const currentRing = ringData[r];
    const nextRing = ringData[r + 1];
    
    for (let s = 0; s < segments; s++) {
      const nextS = (s + 1) % segments;
      
      // Circumferential line (around the ring)
      vertices.push(
        currentRing[s].x, currentRing[s].y, currentRing[s].z,
        currentRing[nextS].x, currentRing[nextS].y, currentRing[nextS].z
      );
      
      // Radial line (towards next ring)
      vertices.push(
        currentRing[s].x, currentRing[s].y, currentRing[s].z,
        nextRing[s].x, nextRing[s].y, nextRing[s].z
      );
      
      // Diagonal line (triangulation)
      vertices.push(
        currentRing[nextS].x, currentRing[nextS].y, currentRing[nextS].z,
        nextRing[s].x, nextRing[s].y, nextRing[s].z
      );
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthWrite: true,
    depthTest: true
  });
  
  const lineSegments = new THREE.LineSegments(geometry, material);
  
  return lineSegments;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
