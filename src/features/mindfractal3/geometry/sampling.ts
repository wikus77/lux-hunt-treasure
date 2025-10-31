// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

/**
 * Sample N points from tunnel geometry using seeded distribution
 */
export function samplePoints(
  geometry: THREE.BufferGeometry,
  count: number,
  seed: number
): THREE.Vector3[] {
  const positions = geometry.attributes.position;
  const totalPoints = positions.count;
  const points: THREE.Vector3[] = [];

  // Seeded random
  let s = seed;
  const seededRandom = () => {
    const x = Math.sin(s++) * 43758.5453123;
    return x - Math.floor(x);
  };

  // Stratified sampling for better distribution
  const stride = Math.floor(totalPoints / count);
  
  for (let i = 0; i < count; i++) {
    const baseIdx = i * stride;
    const offset = Math.floor(seededRandom() * stride * 0.8); // Some variance
    const idx = Math.min(baseIdx + offset, totalPoints - 1);
    
    points.push(
      new THREE.Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      )
    );
  }

  return points;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
