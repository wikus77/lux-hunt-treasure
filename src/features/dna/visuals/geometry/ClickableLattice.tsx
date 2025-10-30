// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ClickableLatticeProps {
  density?: number; // 3 = 27 cubes, 4 = 64 cubes
  size?: number;
  highlightTarget?: string | null;
  targets?: Record<string, { cell: [number, number, number]; level: number }>;
  seed?: string;
  onCubeClick?: (cellIndex: [number, number, number], target?: string) => void;
}

/**
 * Clickable internal lattice with thin neon edges
 * 64 interactive cubes (4x4x4) for DNA target discovery
 */
export const ClickableLattice: React.FC<ClickableLatticeProps> = ({
  density = 4,
  size = 3,
  highlightTarget = null,
  targets = {},
  seed = 'default',
  onCubeClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { raycaster, pointer, camera, gl } = useThree();
  const [hoveredCube, setHoveredCube] = useState<string | null>(null);
  
  // Generate cube positions
  const cubeData = useMemo(() => {
    const data: Array<{
      pos: THREE.Vector3;
      cell: [number, number, number];
      isTarget: string | null;
      key: string;
    }> = [];
    
    const spacing = size / (density + 1);
    const offset = -size / 2 + spacing;
    
    // Seeded random for consistent jitter
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
          
          // Subtle jitter
          const jitter = 0.05;
          basePos.x += (seededRandom() - 0.5) * jitter;
          basePos.y += (seededRandom() - 0.5) * jitter;
          basePos.z += (seededRandom() - 0.5) * jitter;
          
          // Check if target cube
          let isTarget: string | null = null;
          for (const [name, target] of Object.entries(targets)) {
            if (target.cell && 
                target.cell[0] === x && 
                target.cell[1] === y && 
                target.cell[2] === z) {
              isTarget = name;
              break;
            }
          }
          
          data.push({
            pos: basePos,
            cell: [x, y, z],
            isTarget,
            key: `cube-${x}-${y}-${z}`
          });
        }
      }
    }
    
    return data;
  }, [density, size, targets, seed]);

  // Handle clicks
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    
    raycaster.setFromCamera(pointer, camera);
    
    if (groupRef.current) {
      const intersects = raycaster.intersectObjects(groupRef.current.children, true);
      
      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        const cubeIndex = parseInt(intersected.userData.cubeIndex);
        
        if (!isNaN(cubeIndex) && cubeData[cubeIndex]) {
          const cube = cubeData[cubeIndex];
          onCubeClick?.(cube.cell, cube.isTarget || undefined);
        }
      }
    }
  };

  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick as any);
    return () => canvas.removeEventListener('click', handleClick as any);
  }, [gl, cubeData, onCubeClick]);

  // Animate cubes
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Raycasting for hover
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(groupRef.current.children, true);
    
    if (intersects.length > 0) {
      const hovered = intersects[0].object.userData.cubeKey;
      if (hovered !== hoveredCube) {
        setHoveredCube(hovered);
      }
    } else if (hoveredCube) {
      setHoveredCube(null);
    }
    
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        const cube = cubeData[i];
        
        // Subtle rotation
        child.rotation.x = Math.sin(time * 0.2 + i * 0.1) * 0.03;
        child.rotation.y = Math.cos(time * 0.15 + i * 0.08) * 0.03;
        
        // Scale animation for targets
        if (cube?.isTarget === highlightTarget) {
          const pulse = Math.sin(time * 5) * 0.2 + 1.2;
          child.scale.setScalar(pulse);
        } else if (cube?.key === hoveredCube) {
          child.scale.setScalar(1.1);
        } else {
          child.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {cubeData.map((cube, index) => (
        <LatticeCube
          key={cube.key}
          position={cube.pos}
          size={size / (density * 2.8)}
          isTarget={cube.isTarget}
          highlighted={cube.isTarget === highlightTarget}
          hovered={cube.key === hoveredCube}
          index={index}
          cubeKey={cube.key}
        />
      ))}
    </group>
  );
};

interface LatticeCubeProps {
  position: THREE.Vector3;
  size: number;
  isTarget: string | null;
  highlighted: boolean;
  hovered: boolean;
  index: number;
  cubeKey: string;
}

const LatticeCube: React.FC<LatticeCubeProps> = ({
  position,
  size,
  isTarget,
  highlighted,
  hovered,
  index,
  cubeKey
}) => {
  const edgesRef = useRef<THREE.LineSegments>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => new THREE.BoxGeometry(size, size, size), [size]);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  
  // Store cube index in userData for raycasting
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.cubeIndex = index;
      meshRef.current.userData.cubeKey = cubeKey;
    }
  }, [index, cubeKey]);
  
  // Animate neon edges
  useFrame((state) => {
    if (!edgesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const material = edgesRef.current.material as THREE.LineBasicMaterial;
    
    if (highlighted) {
      // Bright pulsing for DNA targets
      const pulse = Math.sin(time * 7) * 0.4 + 0.6;
      material.color.setHSL((time * 0.4 + index * 0.1) % 1, 1.0, 0.7 * pulse);
      material.opacity = 0.95;
    } else if (hovered) {
      // Hover glow
      material.color.set('#00ffff');
      material.opacity = 0.8;
    } else if (isTarget) {
      // Subtle glow for hidden targets
      material.color.setHSL((time * 0.12 + index * 0.05) % 1, 0.9, 0.55);
      material.opacity = 0.6;
    } else {
      // Standard thin neon
      material.color.setHSL((time * 0.06 + index * 0.02) % 1, 0.75, 0.45);
      material.opacity = 0.35;
    }
  });

  return (
    <group position={position}>
      {/* Glass cube for clicking */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          transmission={0.98}
          thickness={0.25}
          roughness={0.08}
          clearcoat={0.7}
          ior={1.45}
          iridescence={highlighted ? 0.8 : 0.4}
          transparent
          opacity={highlighted ? 0.25 : (hovered ? 0.15 : 0.06)}
          color={highlighted ? '#00ffff' : (hovered ? '#00ddff' : '#aaffff')}
          depthWrite={false}
        />
      </mesh>
      
      {/* Thin neon edges */}
      <lineSegments ref={edgesRef} geometry={edgesGeometry}>
        <lineBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          linewidth={highlighted ? 2.5 : (hovered ? 2 : 1)}
        />
      </lineSegments>
      
      {/* Highlight ring for discovered targets */}
      {highlighted && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size * 1.3, size * 0.04, 8, 32]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Vertical ring */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[size * 1.3, size * 0.04, 8, 32]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
      
      {/* Hover indicator */}
      {hovered && !highlighted && (
        <mesh>
          <sphereGeometry args={[size * 0.15, 16, 16]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
