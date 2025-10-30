/**
 * Rubik's Cube 4×4 Mesh Components
 * Neon wireframe rendering with glass faces
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { RubikCubie } from './types';
import { RUBIK_COLORS, type Face } from './colors';

interface CubieProps {
  cubie: RubikCubie;
  size: number;
  gap: number;
  lineWidth: number;
}

/**
 * Single cubie with neon wireframe edges
 */
export const Cubelet: React.FC<CubieProps> = ({ cubie, size, gap, lineWidth }) => {
  const [x, y, z] = cubie.pos;
  const [rx, ry, rz] = cubie.orient;

  // Calculate world position with gap
  const spacing = size + gap;
  const position: [number, number, number] = [
    (x - 1.5) * spacing,
    (y - 1.5) * spacing,
    (z - 1.5) * spacing
  ];

  const rotation: [number, number, number] = [
    (rx * Math.PI) / 180,
    (ry * Math.PI) / 180,
    (rz * Math.PI) / 180
  ];

  // Get visible faces and their colors
  const visibleFaces = useMemo(() => {
    const faces: Array<{ face: Face; color: string }> = [];
    if (x === 0 && cubie.stickers?.L) faces.push({ face: 'L', color: cubie.stickers.L });
    if (x === 3 && cubie.stickers?.R) faces.push({ face: 'R', color: cubie.stickers.R });
    if (y === 0 && cubie.stickers?.D) faces.push({ face: 'D', color: cubie.stickers.D });
    if (y === 3 && cubie.stickers?.U) faces.push({ face: 'U', color: cubie.stickers.U });
    if (z === 0 && cubie.stickers?.B) faces.push({ face: 'B', color: cubie.stickers.B });
    if (z === 3 && cubie.stickers?.F) faces.push({ face: 'F', color: cubie.stickers.F });
    return faces;
  }, [x, y, z, cubie.stickers]);

  return (
    <group position={position} rotation={rotation}>
      {/* Glass body */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshPhysicalMaterial
          transmission={0.35}
          thickness={0.4}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.2}
          transparent
          opacity={0.08}
          depthWrite={false}
          color={new THREE.Color('#aaffff')}
        />
      </mesh>

      {/* Neon wireframe edges - only colored on external faces */}
      {visibleFaces.map(({ face, color }) => (
        <CubieEdges key={face} face={face} size={size} color={color} lineWidth={lineWidth} />
      ))}

      {/* Internal edges (cyan soft) */}
      {visibleFaces.length < 3 && (
        <CubieEdges face="INNER" size={size} color={RUBIK_COLORS.INNER} lineWidth={lineWidth * 0.7} />
      )}
    </group>
  );
};

interface CubieEdgesProps {
  face: Face | 'INNER';
  size: number;
  color: string;
  lineWidth: number;
}

/**
 * Neon edges for a single face
 */
const CubieEdges: React.FC<CubieEdgesProps> = ({ face, size, color, lineWidth }) => {
  const points = useMemo(() => {
    const h = size / 2;

    if (face === 'INNER') {
      // Full cube outline as tuples
      return [
        [-h, -h, -h] as [number, number, number], 
        [h, -h, -h] as [number, number, number], 
        [h, h, -h] as [number, number, number], 
        [-h, h, -h] as [number, number, number], 
        [-h, -h, -h] as [number, number, number], // Back
        [-h, -h, h] as [number, number, number], 
        [h, -h, h] as [number, number, number], 
        [h, h, h] as [number, number, number], 
        [-h, h, h] as [number, number, number], 
        [-h, -h, h] as [number, number, number], // Front
        [-h, -h, -h] as [number, number, number], 
        [-h, -h, h] as [number, number, number], // Connect
        [h, -h, -h] as [number, number, number], 
        [h, -h, h] as [number, number, number], // Connect
        [h, h, -h] as [number, number, number], 
        [h, h, h] as [number, number, number], // Connect
        [-h, h, -h] as [number, number, number], 
        [-h, h, h] as [number, number, number] // Connect
      ];
    }

    // Face-specific edges
    switch (face) {
      case 'F':
        return [
          [-h, -h, h] as [number, number, number], 
          [h, -h, h] as [number, number, number], 
          [h, h, h] as [number, number, number], 
          [-h, h, h] as [number, number, number], 
          [-h, -h, h] as [number, number, number]
        ];
      case 'B':
        return [
          [-h, -h, -h] as [number, number, number], 
          [h, -h, -h] as [number, number, number], 
          [h, h, -h] as [number, number, number], 
          [-h, h, -h] as [number, number, number], 
          [-h, -h, -h] as [number, number, number]
        ];
      case 'U':
        return [
          [-h, h, -h] as [number, number, number], 
          [h, h, -h] as [number, number, number], 
          [h, h, h] as [number, number, number], 
          [-h, h, h] as [number, number, number], 
          [-h, h, -h] as [number, number, number]
        ];
      case 'D':
        return [
          [-h, -h, -h] as [number, number, number], 
          [h, -h, -h] as [number, number, number], 
          [h, -h, h] as [number, number, number], 
          [-h, -h, h] as [number, number, number], 
          [-h, -h, -h] as [number, number, number]
        ];
      case 'L':
        return [
          [-h, -h, -h] as [number, number, number], 
          [-h, h, -h] as [number, number, number], 
          [-h, h, h] as [number, number, number], 
          [-h, -h, h] as [number, number, number], 
          [-h, -h, -h] as [number, number, number]
        ];
      case 'R':
        return [
          [h, -h, -h] as [number, number, number], 
          [h, h, -h] as [number, number, number], 
          [h, h, h] as [number, number, number], 
          [h, -h, h] as [number, number, number], 
          [h, -h, -h] as [number, number, number]
        ];
      default:
        return [] as Array<[number, number, number]>;
    }
  }, [face, size]);

  if (points.length === 0) return null;

  const opacity = face === 'INNER' ? 0.15 : 0.95;

  return (
    <>
      {/* Main line */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        depthWrite={false}
        // @ts-ignore
        blending={THREE.AdditiveBlending}
      />
      
      {/* Glow outline (second pass for neon effect) */}
      {face !== 'INNER' && (
        <Line
          points={points}
          color={color}
          lineWidth={lineWidth * 1.8}
          transparent
          opacity={0.25}
          depthWrite={false}
          // @ts-ignore
          blending={THREE.AdditiveBlending}
        />
      )}
    </>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
