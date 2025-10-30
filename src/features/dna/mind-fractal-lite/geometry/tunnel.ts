// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

export interface TunnelQuality {
  rings: number;
  segments: number;
  label: string;
}

export const QUALITY_PRESETS: Record<string, TunnelQuality> = {
  high: { rings: 140, segments: 120, label: 'High (Desktop)' },
  mobile: { rings: 80, segments: 64, label: 'Mobile' },
  low: { rings: 56, segments: 40, label: 'Low (Reduced)' }
};

/**
 * Seeded random number generator for deterministic tunnel generation
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

export interface TunnelGeometry {
  positions: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
}

/**
 * Generate wireframe tunnel geometry with degrading radius towards center
 * Creates a triangulated mesh that degrades into a central black hole
 */
export function generateTunnelGeometry(
  quality: TunnelQuality,
  seed: number,
  startRadius: number = 2.5,
  endRadius: number = 0.15,
  depth: number = 12
): TunnelGeometry {
  const { rings, segments } = quality;
  const rng = new SeededRandom(seed);
  
  const positions: number[] = [];
  const indices: number[] = [];
  
  // Generate ring vertices with decreasing radius
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = -t * depth;
    
    // Exponential decay for more dramatic convergence
    const radius = THREE.MathUtils.lerp(
      startRadius,
      endRadius,
      Math.pow(t, 1.8)
    );
    
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      
      // Organic jitter (scales with radius to maintain proportions)
      const jitterAmount = radius * 0.06 * (1 - t * 0.5);
      const jitterX = (rng.next() - 0.5) * jitterAmount;
      const jitterY = (rng.next() - 0.5) * jitterAmount;
      const jitterZ = (rng.next() - 0.5) * (depth * 0.015);
      
      const x = Math.cos(theta) * radius + jitterX;
      const y = Math.sin(theta) * radius + jitterY;
      
      positions.push(x, y, z + jitterZ);
    }
  }
  
  // Generate triangular mesh indices
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const current = r * (segments + 1) + s;
      const next = current + segments + 1;
      
      // Two triangles per quad
      indices.push(current, next, current + 1);
      indices.push(current + 1, next, next + 1);
    }
  }
  
  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices),
    vertexCount: positions.length / 3
  };
}

/**
 * Create Three.js LineSegments from tunnel geometry using EdgesGeometry
 */
export function createWireframeTunnel(
  quality: TunnelQuality,
  seed: number,
  material: THREE.Material
): THREE.LineSegments {
  const { positions, indices } = generateTunnelGeometry(quality, seed);
  
  // Create base geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  
  // Extract edges for wireframe effect
  const edgesGeometry = new THREE.EdgesGeometry(geometry, 5);
  const lineSegments = new THREE.LineSegments(edgesGeometry, material);
  
  return lineSegments;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
