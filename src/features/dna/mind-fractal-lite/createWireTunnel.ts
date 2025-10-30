/**
 * © 2025 Joseph MULÉ – M1SSION™ – Wire Tunnel Geometry Generator
 */

import * as THREE from 'three';

export interface TunnelConfig {
  segments: number;
  rings: number;
  radiusStart: number;
  radiusEnd: number;
  depth: number;
}

export const DEFAULT_TUNNEL_CONFIG: TunnelConfig = {
  segments: 160,
  rings: 80,
  radiusStart: 2.0,
  radiusEnd: 0.05,
  depth: 40
};

export const REDUCED_TUNNEL_CONFIG: TunnelConfig = {
  segments: 80,
  rings: 40,
  radiusStart: 2.0,
  radiusEnd: 0.05,
  depth: 40
};

/**
 * Creates a wireframe tunnel geometry with triangular mesh
 * degrading towards the center (vortex effect)
 */
export function createWireTunnel(config: TunnelConfig): THREE.LineSegments {
  const { segments, rings, radiusStart, radiusEnd, depth } = config;
  
  const positions: number[] = [];
  const indices: number[] = [];

  // Generate vertices
  for (let r = 0; r < rings; r++) {
    const t = r / (rings - 1); // 0 to 1
    const z = -t * depth;
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, Math.pow(t, 0.7));

    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      positions.push(x, y, z);
    }
  }

  // Generate line indices (triangulated wireframe)
  for (let r = 0; r < rings - 1; r++) {
    for (let s = 0; s < segments; s++) {
      const curr = r * segments + s;
      const next = r * segments + ((s + 1) % segments);
      const currNext = (r + 1) * segments + s;
      const nextNext = (r + 1) * segments + ((s + 1) % segments);

      // Triangle 1 edges
      indices.push(curr, next);
      indices.push(next, currNext);
      indices.push(currNext, curr);

      // Triangle 2 edges
      indices.push(next, nextNext);
      indices.push(nextNext, currNext);
      indices.push(currNext, next);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  const material = new THREE.LineBasicMaterial({
    color: 0xcfcfcf,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  return new THREE.LineSegments(geometry, material);
}

/**
 * Animate tunnel (pulsation + drift)
 */
export function animateTunnel(
  tunnel: THREE.LineSegments,
  camera: THREE.PerspectiveCamera,
  time: number
): void {
  // Subtle pulsation via opacity
  const material = tunnel.material as THREE.LineBasicMaterial;
  material.opacity = 0.65 + Math.sin(time * 0.5) * 0.1;

  // Slow drift towards center
  const driftSpeed = 0.02;
  camera.position.z = 1.8 + Math.sin(time * 0.1) * 0.1;
  
  // Subtle rotation
  tunnel.rotation.z = time * 0.02;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
