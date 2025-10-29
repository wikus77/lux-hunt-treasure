// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

/**
 * Creates a professional glass material with transmission, iridescence, and Fresnel effects
 * Matches the holographic glass appearance from reference images
 */
export function createGlassMaterial(): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    transmission: 1.0,
    thickness: 0.75,
    roughness: 0.07,
    metalness: 0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    ior: 1.5,
    reflectivity: 0.95,
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 800],
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    color: new THREE.Color('#88ffff'),
    attenuationColor: new THREE.Color('#6ffcff'),
    attenuationDistance: 1.4
  });

  return material;
}

/**
 * Creates a semi-transparent glass material for inner grid cells
 */
export function createInnerGlassMaterial(opacity: number = 0.08): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    transmission: 0.95,
    thickness: 0.4,
    roughness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    ior: 1.45,
    iridescence: 0.7,
    iridescenceIOR: 1.2,
    iridescenceThicknessRange: [100, 400],
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
    depthWrite: false,
    color: new THREE.Color('#aaffff')
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
