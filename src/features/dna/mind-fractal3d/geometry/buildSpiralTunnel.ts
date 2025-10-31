// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

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
  twist?: number; // Radians of twist per unit depth
}

export interface TunnelGeometry {
  positions: Float32Array;
  indices: Uint32Array;
}

/**
 * Build a spiral tunnel with organic noise and depth degradation
 */
export function buildSpiralTunnel(config: TunnelConfig): TunnelGeometry {
  const { rings, segments, radius, depth, twist = 0 } = config;
  const rng = new SeededRandom(42);
  
  const positions: number[] = [];
  const indices: number[] = [];

  // Generate vertices with spiral and noise
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const z = t * depth;
    
    // Spiral rotation + twist
    const spiralRotation = t * Math.PI * 0.5 + t * twist;
    
    // Radius degradation (exponential toward center)
    const currentRadius = radius * Math.pow(1 - t, 1.2) + 0.5;
    
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2 + spiralRotation;
      
      // Organic jitter
      const noiseVal = noise1D(r * 0.3 + s * 0.15) * 0.15;
      const jitterR = (rng.next() - 0.5) * currentRadius * 0.08;
      const jitterZ = (rng.next() - 0.5) * 0.3;
      
      const x = Math.cos(theta) * (currentRadius + noiseVal + jitterR);
      const y = Math.sin(theta) * (currentRadius + noiseVal + jitterR);
      
      positions.push(x, y, z + jitterZ);
    }
  }

  // Generate triangle indices
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const current = r * (segments + 1) + s;
      const next = current + segments + 1;
      
      indices.push(current, next, current + 1);
      indices.push(current + 1, next, next + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices)
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
