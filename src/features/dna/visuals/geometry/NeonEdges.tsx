// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface NeonEdgesProps {
  size: number;
  layers?: number;
}

/**
 * Creates thick iridescent neon edges using TubeGeometry for realistic thickness
 * Multiple layers with different widths create the holographic rainbow effect
 */
export function createNeonEdges(size: number, layers: number = 3): React.ReactElement[] {
  const halfSize = size / 2;
  
  // Define the 12 edges of a cube
  const edges = [
    // Bottom face
    [[-halfSize, -halfSize, -halfSize], [halfSize, -halfSize, -halfSize]],
    [[halfSize, -halfSize, -halfSize], [halfSize, -halfSize, halfSize]],
    [[halfSize, -halfSize, halfSize], [-halfSize, -halfSize, halfSize]],
    [[-halfSize, -halfSize, halfSize], [-halfSize, -halfSize, -halfSize]],
    // Top face
    [[-halfSize, halfSize, -halfSize], [halfSize, halfSize, -halfSize]],
    [[halfSize, halfSize, -halfSize], [halfSize, halfSize, halfSize]],
    [[halfSize, halfSize, halfSize], [-halfSize, halfSize, halfSize]],
    [[-halfSize, halfSize, halfSize], [-halfSize, halfSize, -halfSize]],
    // Vertical edges
    [[-halfSize, -halfSize, -halfSize], [-halfSize, halfSize, -halfSize]],
    [[halfSize, -halfSize, -halfSize], [halfSize, halfSize, -halfSize]],
    [[halfSize, -halfSize, halfSize], [halfSize, halfSize, halfSize]],
    [[-halfSize, -halfSize, halfSize], [-halfSize, halfSize, halfSize]]
  ];

  const edgeElements: React.ReactElement[] = [];
  const baseWidths = [0.025, 0.018, 0.012]; // Thick to thin layers

  edges.forEach((edge, edgeIndex) => {
    const [start, end] = edge;
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );

    // Create multiple layers per edge for rainbow effect
    for (let layer = 0; layer < layers; layer++) {
      const width = baseWidths[layer] || 0.01;
      edgeElements.push(
        <NeonEdge
          key={`edge-${edgeIndex}-layer-${layer}`}
          curve={curve}
          width={width}
          hueOffset={(edgeIndex / edges.length) + (layer * 0.1)}
          layer={layer}
        />
      );
    }
  });

  return edgeElements;
}

interface NeonEdgeProps {
  curve: THREE.Curve<THREE.Vector3>;
  width: number;
  hueOffset: number;
  layer: number;
}

const NeonEdge: React.FC<NeonEdgeProps> = ({ curve, width, hueOffset, layer }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 2, width, 8, false);
  }, [curve, width]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hueOffset % 1, 1, 0.5),
      emissive: new THREE.Color().setHSL(hueOffset % 1, 1, 0.5),
      emissiveIntensity: 3.0 - (layer * 0.5),
      toneMapped: false,
      transparent: true,
      opacity: 0.9 - (layer * 0.15),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, [hueOffset, layer]);

  // Animate color shifting along HSV spectrum
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const hue = (hueOffset + time * 0.05) % 1;
      material.color.setHSL(hue, 1, 0.5);
      material.emissive.setHSL(hue, 1, 0.5);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
