// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createInnerGlassMaterial } from '../materials/GlassMaterial';

interface TesseractGridProps {
  density: number;
  cubeSize: number;
  reducedMotion?: boolean;
}

/**
 * Recursive inner grid of instanced glass cubes
 * Creates the "infinite depth" effect from reference images
 */
export const TesseractGrid: React.FC<TesseractGridProps> = ({ density, cubeSize, reducedMotion = false }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Calculate grid positions (skip center to create hollow effect)
  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const step = cubeSize / density;
    const offset = cubeSize / 2 - step / 2;
    
    for (let x = 0; x < density; x++) {
      for (let y = 0; y < density; y++) {
        for (let z = 0; z < density; z++) {
          // Skip center cells to create depth
          if (
            (x === Math.floor(density / 2) || x === Math.floor(density / 2) - 1) &&
            (y === Math.floor(density / 2) || y === Math.floor(density / 2) - 1) &&
            (z === Math.floor(density / 2) || z === Math.floor(density / 2) - 1)
          ) {
            continue;
          }
          
          pos.push(
            new THREE.Vector3(
              x * step - offset,
              y * step - offset,
              z * step - offset
            )
          );
        }
      }
    }
    return pos;
  }, [density, cubeSize]);

  const cellSize = useMemo(() => cubeSize / density * 0.75, [cubeSize, density]);
  
  // Glass material for inner cells
  const material = useMemo(() => {
    return createInnerGlassMaterial(0.08);
  }, []);

  // Setup instances
  useEffect(() => {
    if (!meshRef.current) return;
    
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  // Animate shimmer effect
  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    
    const time = state.clock.elapsedTime;
    
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      
      // Subtle pulse based on position and time
      const distance = pos.length();
      const pulse = Math.sin(time * 1.5 + distance * 0.5) * 0.05 + 1.0;
      dummy.scale.setScalar(pulse);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Dynamic color per instance
      const hue = (distance * 0.1 + time * 0.05) % 1;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      meshRef.current!.setColorAt(i, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} material={material}>
        <boxGeometry args={[cellSize, cellSize, cellSize]} />
      </instancedMesh>
      
      {/* Add edges to some inner cells for extra detail */}
      {positions.slice(0, Math.min(12, positions.length)).map((pos, idx) => (
        <InnerCellEdges key={`cell-${idx}`} position={pos} size={cellSize} index={idx} />
      ))}
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
