// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InternalLatticeProps {
  density?: number; // 3 = 3x3x3 = 27 cubes, 4 = 4x4x4 = 64 cubes, etc.
  size?: number;
  highlightTarget?: string | null;
  targets?: Record<string, { x: number; y: number; z: number }> | { [key: string]: { x: number; y: number; z: number } };
  seed?: string;
}

/**
 * Internal lattice of micro-cubes with neon edges
 * Creates a volumetric grid inside the main tesseract
 */
export const InternalLattice: React.FC<InternalLatticeProps> = ({
  density = 4,
  size = 3,
  highlightTarget = null,
  targets = {},
  seed = 'default'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate cube positions based on density
  const cubePositions = useMemo(() => {
    const positions: Array<{ pos: THREE.Vector3; isTarget: string | null; key: string }> = [];
    const spacing = size / (density + 1);
    const offset = -size / 2 + spacing;
    
    // Create seeded random for stable jitter
    const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let random = seedNum % 1000 / 1000;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let x = 0; x < density; x++) {
      for (let y = 0; y < density; y++) {
        for (let z = 0; z < density; z++) {
          const basePos = new THREE.Vector3(
            offset + x * spacing,
            offset + y * spacing,
            offset + z * spacing
          );
          
          // Add slight jitter for organic feel
          const jitter = 0.08;
          basePos.x += (seededRandom() - 0.5) * jitter;
          basePos.y += (seededRandom() - 0.5) * jitter;
          basePos.z += (seededRandom() - 0.5) * jitter;
          
          // Check if this position matches a target
          let isTarget: string | null = null;
          for (const [name, target] of Object.entries(targets)) {
            // Map target coordinates (-2 to 2) to grid indices
            const targetX = Math.floor(((target.x + 2) / 4) * density);
            const targetY = Math.floor(((target.y + 2) / 4) * density);
            const targetZ = Math.floor(((target.z + 2) / 4) * density);
            
            if (Math.abs(targetX - x) <= 0 && Math.abs(targetY - y) <= 0 && Math.abs(targetZ - z) <= 0) {
              isTarget = name;
              break;
            }
          }
          
          positions.push({
            pos: basePos,
            isTarget,
            key: `${x}-${y}-${z}`
          });
        }
      }
    }
    
    return positions;
  }, [density, size, targets, seed]);

  // Animate the lattice
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        // Slight rotation for each micro-cube
        child.rotation.x = Math.sin(time * 0.3 + i * 0.1) * 0.05;
        child.rotation.y = Math.cos(time * 0.2 + i * 0.15) * 0.05;
        
        // Pulse scale for highlighted targets
        const cubeData = cubePositions[i];
        if (cubeData?.isTarget === highlightTarget) {
          const pulse = Math.sin(time * 4) * 0.15 + 1.15;
          child.scale.setScalar(pulse);
        } else {
          child.scale.setScalar(1);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {cubePositions.map(({ pos, isTarget, key }, index) => (
        <MicroCube
          key={key}
          position={pos}
          size={size / (density * 2.5)}
          isTarget={isTarget}
          highlighted={isTarget === highlightTarget}
          index={index}
        />
      ))}
    </group>
  );
};

interface MicroCubeProps {
  position: THREE.Vector3;
  size: number;
  isTarget: string | null;
  highlighted: boolean;
  index: number;
}

const MicroCube: React.FC<MicroCubeProps> = ({ position, size, isTarget, highlighted, index }) => {
  const edgesRef = useRef<THREE.LineSegments>(null);
  
  // Create geometry once
  const geometry = useMemo(() => new THREE.BoxGeometry(size, size, size), [size]);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  
  // Animate edges
  useFrame((state) => {
    if (!edgesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const material = edgesRef.current.material as THREE.LineBasicMaterial;
    
    if (highlighted) {
      // Bright pulsing for highlighted target
      const pulse = Math.sin(time * 6) * 0.3 + 0.7;
      material.color.setHSL((time * 0.3 + index * 0.1) % 1, 1.0, 0.6 * pulse);
      material.opacity = 0.9;
    } else if (isTarget) {
      // Subtle glow for non-highlighted targets
      material.color.setHSL((time * 0.1 + index * 0.05) % 1, 0.8, 0.5);
      material.opacity = 0.5;
    } else {
      // Standard neon edges
      material.color.setHSL((time * 0.05 + index * 0.02) % 1, 0.7, 0.4);
      material.opacity = 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Inner glass cube */}
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          transmission={0.95}
          thickness={0.3}
          roughness={0.1}
          clearcoat={0.6}
          ior={1.45}
          iridescence={0.5}
          transparent
          opacity={highlighted ? 0.2 : 0.08}
          color={highlighted ? '#00ffff' : '#aaffff'}
          depthWrite={false}
        />
      </mesh>
      
      {/* Neon edges */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          linewidth={highlighted ? 2 : 1}
        />
      </lineSegments>
      
      {/* Highlight ring for targets */}
      {highlighted && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 1.2, size * 0.05, 8, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
