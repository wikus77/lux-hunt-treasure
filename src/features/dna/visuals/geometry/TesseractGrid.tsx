// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createInnerGlassMaterial } from '../materials/GlassMaterial';

interface TesseractGridProps {
  density: number;
  cubeSize: number;
  reducedMotion?: boolean;
}

/**
 * Creates the recursive inner grid of cubes that creates the "infinite depth" effect
 * Uses instanced rendering for performance with many cubes
 */
export const TesseractGrid: React.FC<TesseractGridProps> = ({ 
  density, 
  cubeSize, 
  reducedMotion = false 
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const edgesGroupRef = useRef<THREE.Group>(null);

  // Calculate grid positions
  const { positions, count } = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const step = cubeSize / density;
    const offset = cubeSize / 2 - step / 2;

    for (let x = 0; x < density; x++) {
      for (let y = 0; y < density; y++) {
        for (let z = 0; z < density; z++) {
          // Skip the very center to leave room for core
          const px = x * step - offset;
          const py = y * step - offset;
          const pz = z * step - offset;
          
          const distanceFromCenter = Math.sqrt(px * px + py * py + pz * pz);
          if (distanceFromCenter > 0.4) {
            positions.push(new THREE.Vector3(px, py, pz));
          }
        }
      }
    }

    return { positions, count: positions.length };
  }, [density, cubeSize]);

  // Glass material for cells
  const glassMaterial = useMemo(() => createInnerGlassMaterial(0.08), []);

  // Cell size
  const cellSize = cubeSize / (density * 1.2);

  // Setup instances
  React.useEffect(() => {
    if (!instancedMeshRef.current) return;

    const dummy = new THREE.Object3D();
    
    positions.forEach((position, i) => {
      dummy.position.copy(position);
      
      // Small random rotation jitter for shimmer effect
      const jitter = 0.05;
      dummy.rotation.set(
        (Math.random() - 0.5) * jitter,
        (Math.random() - 0.5) * jitter,
        (Math.random() - 0.5) * jitter
      );
      
      // Slight scale variation for depth
      const scale = 0.9 + Math.random() * 0.2;
      dummy.scale.setScalar(scale);
      
      dummy.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  // Animate shimmer and color
  useFrame((state) => {
    if (reducedMotion || !instancedMeshRef.current) return;

    const time = state.clock.elapsedTime;
    
    positions.forEach((position, i) => {
      const distance = position.length();
      const wave = Math.sin(time * 2 + distance * 3) * 0.5 + 0.5;
      
      // Color based on position + time
      const hue = (position.x + position.y + position.z + time * 0.1) / (cubeSize * 2);
      const color = new THREE.Color().setHSL((hue % 1 + 1) % 1, 0.8, 0.6);
      
      instancedMeshRef.current!.setColorAt(i, color);
    });
    
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Instanced glass cubes */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, count]}
        material={glassMaterial}
      >
        <boxGeometry args={[cellSize, cellSize, cellSize]} />
      </instancedMesh>

      {/* Neon edges for inner cells */}
      <group ref={edgesGroupRef}>
        {positions.slice(0, Math.min(positions.length, density * 8)).map((pos, i) => (
          <InnerCellEdges key={i} position={pos} size={cellSize} index={i} />
        ))}
      </group>
    </>
  );
};

interface InnerCellEdgesProps {
  position: THREE.Vector3;
  size: number;
  index: number;
}

const InnerCellEdges: React.FC<InnerCellEdgesProps> = ({ position, size, index }) => {
  const edgesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    return new THREE.EdgesGeometry(boxGeometry);
  }, [size]);

  const material = useMemo(() => {
    const hue = (index * 0.1) % 1;
    return new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, 0.6),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
  }, [index]);

  useFrame((state) => {
    if (edgesRef.current) {
      const time = state.clock.elapsedTime;
      const hue = ((index * 0.1) + time * 0.05) % 1;
      material.color.setHSL(hue, 0.9, 0.6);
    }
  });

  return (
    <lineSegments
      ref={edgesRef}
      geometry={geometry}
      material={material}
      position={position}
    />
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
