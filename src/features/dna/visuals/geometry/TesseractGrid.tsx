// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createInnerGlassMaterial } from '../materials/GlassMaterial';

interface TesseractGridProps {
  density: number; // 3, 4, or 6
  cubeSize: number;
  reducedMotion?: boolean;
  highlightedTarget?: { x: number; y: number; z: number } | null;
}

/**
 * Recursive inner grid of instanced glass cubes with dynamic LOD
 * Creates the "infinite depth" effect from reference images
 */
export const TesseractGrid: React.FC<TesseractGridProps> = ({ 
  density, 
  cubeSize,
  reducedMotion = false,
  highlightedTarget = null
}) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const edgesGroupRef = useRef<THREE.Group>(null);
  const [fps, setFps] = useState(60);
  
  // Dynamic LOD based on performance
  const [lodDensity, setLodDensity] = useState(density);
  
  useEffect(() => {
    // Auto-LOD: adjust density based on FPS
    if (fps < 45 && lodDensity > 3) {
      setLodDensity(prev => Math.max(3, prev - 1));
      console.log('🔻 DNA LOD: reduced to', lodDensity - 1);
    } else if (fps >= 55 && lodDensity < density) {
      setLodDensity(prev => Math.min(density, prev + 1));
      console.log('🔺 DNA LOD: increased to', lodDensity + 1);
    }
  }, [fps, density, lodDensity]);
  
  // Calculate grid dimensions
  const gridSize = lodDensity;
  const spacing = cubeSize / gridSize;

  // Calculate cube positions (hollow center)
  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const halfGrid = gridSize / 2;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          // Skip center region for hollow effect
          const isCenterX = Math.abs(x - halfGrid + 0.5) < 1;
          const isCenterY = Math.abs(y - halfGrid + 0.5) < 1;
          const isCenterZ = Math.abs(z - halfGrid + 0.5) < 1;
          
          if (isCenterX && isCenterY && isCenterZ) continue;
          
          pos.push(new THREE.Vector3(
            (x - halfGrid + 0.5) * spacing,
            (y - halfGrid + 0.5) * spacing,
            (z - halfGrid + 0.5) * spacing
          ));
        }
      }
    }
    return pos;
  }, [gridSize, spacing]);

  const cellSize = spacing * 0.75;
  const material = useMemo(() => createInnerGlassMaterial(0.08), []);

  // Setup instances
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  // Measure FPS and animate cubes
  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;
    
    const currentFps = 1 / delta;
    setFps(prev => prev * 0.95 + currentFps * 0.05); // Smooth average
    
    if (reducedMotion) return;
    
    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();
    const tempScale = new THREE.Vector3();
    const dummy = new THREE.Object3D();

    positions.forEach((pos, index) => {
      const x = pos.x / spacing;
      const y = pos.y / spacing;
      const z = pos.z / spacing;
      
      // Subtle pulse
      const pulseIntensity = Math.sin(time * 1.5 + (x + y + z) * 0.5) * 0.5 + 0.5;
      const baseHue = (x * 0.1 + y * 0.1 + z * 0.1) % 1;
      
      // Check if this cube is highlighted
      const isHighlighted = highlightedTarget && 
        Math.abs(x - highlightedTarget.x) < 0.1 &&
        Math.abs(y - highlightedTarget.y) < 0.1 &&
        Math.abs(z - highlightedTarget.z) < 0.1;
      
      const scaleFactor = isHighlighted ? 1.3 : 1 + pulseIntensity * 0.05;
      
      // Dynamic color shift (boost if highlighted)
      const hue = isHighlighted ? 0.5 : (baseHue + time * 0.1 + index * 0.01) % 1;
      const saturation = isHighlighted ? 1.0 : 0.8;
      const lightness = isHighlighted ? 0.8 : 0.6;
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      
      matrix.makeTranslation(pos.x, pos.y, pos.z);
      matrix.scale(tempScale.set(scaleFactor, scaleFactor, scaleFactor));
      instancedMeshRef.current!.setMatrixAt(index, matrix);
      instancedMeshRef.current!.setColorAt(index, color);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh 
        ref={instancedMeshRef} 
        args={[undefined, undefined, positions.length]} 
        material={material}
      >
        <boxGeometry args={[cellSize, cellSize, cellSize]} />
      </instancedMesh>
      
      {/* Edge details for select cubes */}
      <group ref={edgesGroupRef}>
        {positions.slice(0, Math.min(12, positions.length)).map((pos, idx) => (
          <InnerCellEdges key={`cell-${idx}`} position={pos} size={cellSize} index={idx} />
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
