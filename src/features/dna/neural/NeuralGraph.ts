/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Graph Generator
 */

import { NeuralNode, NEURAL_COLORS } from './types';

/**
 * Seeded random number generator (PRNG)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Generate neural network graph with paired nodes
 */
export function generateNeuralGraph(seed: string, pairsCount: number): NeuralNode[] {
  const rng = new SeededRandom(seed);
  const nodes: NeuralNode[] = [];
  const radius = 3.5;
  const minDistance = 1.2; // Minimum distance between nodes

  // Generate pairs
  for (let i = 0; i < pairsCount; i++) {
    const color = NEURAL_COLORS[i % NEURAL_COLORS.length];
    const pairId = `pair_${i}`;

    // Generate two nodes for this pair
    for (let j = 0; j < 2; j++) {
      let position: [number, number, number];
      let attempts = 0;
      
      // Try to find a position that's not too close to existing nodes
      do {
        const theta = rng.next() * Math.PI * 2;
        const phi = Math.acos(2 * rng.next() - 1);
        const r = radius * (0.6 + rng.next() * 0.4);

        position = [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ];

        attempts++;
      } while (
        attempts < 50 &&
        nodes.some(n => distance(position, n.position) < minDistance)
      );

      nodes.push({
        id: `node_${i}_${j}`,
        position,
        color,
        pairId
      });
    }
  }

  return nodes;
}

/**
 * Calculate distance between two 3D points
 */
function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

/**
 * Check if a new link intersects with existing links
 */
export function checkLinkIntersection(
  newPoints: Array<[number, number, number]>,
  existingLinks: Array<{ points: Array<[number, number, number]> }>
): boolean {
  // Simplified intersection check
  // In a full implementation, you'd check line segment intersections in 3D
  // For now, we'll use a proximity check on segments
  
  const threshold = 0.3;

  for (const link of existingLinks) {
    for (let i = 0; i < newPoints.length - 1; i++) {
      for (let j = 0; j < link.points.length - 1; j++) {
        const dist = segmentDistance(
          newPoints[i],
          newPoints[i + 1],
          link.points[j],
          link.points[j + 1]
        );
        
        if (dist < threshold) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Calculate minimum distance between two line segments
 */
function segmentDistance(
  a1: [number, number, number],
  a2: [number, number, number],
  b1: [number, number, number],
  b2: [number, number, number]
): number {
  // Simplified: check midpoint distances
  const aMid: [number, number, number] = [
    (a1[0] + a2[0]) / 2,
    (a1[1] + a2[1]) / 2,
    (a1[2] + a2[2]) / 2
  ];
  const bMid: [number, number, number] = [
    (b1[0] + b2[0]) / 2,
    (b1[1] + b2[1]) / 2,
    (b1[2] + b2[2]) / 2
  ];
  
  return distance(aMid, bMid);
}

/**
 * Generate smooth path between two nodes using waypoints
 */
export function generateLinkPath(
  from: [number, number, number],
  to: [number, number, number],
  segments: number = 12
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  
  // Create a curved path (simple arc in 3D)
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2
  ];
  
  // Add some curvature offset perpendicular to the line
  const offset = 0.5;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  
  // Perpendicular vector (simplified)
  const perpX = -dy;
  const perpY = dx;
  const perpZ = 0;
  const perpLen = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ) || 1;
  
  mid[0] += (perpX / perpLen) * offset;
  mid[1] += (perpY / perpLen) * offset;
  mid[2] += (perpZ / perpLen) * offset;
  
  // Generate smooth curve
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Quadratic Bezier
    const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * mid[0] + t2 * to[0];
    const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * mid[1] + t2 * to[1];
    const z = (1 - t) * (1 - t) * from[2] + 2 * (1 - t) * t * mid[2] + t2 * to[2];
    
    points.push([x, y, z]);
  }
  
  return points;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
