/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Renderer
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NeuralNode, NeuralLink } from './types';

interface NeuralRendererProps {
  nodes: NeuralNode[];
  links: NeuralLink[];
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

export const NeuralRenderer: React.FC<NeuralRendererProps> = ({
  nodes,
  links,
  selectedNode,
  onNodeClick
}) => {
  return (
    <group>
      {/* Render links first (behind nodes) */}
      {links.map(link => (
        <NeuralLinkMesh key={link.id} link={link} />
      ))}

      {/* Render nodes */}
      {nodes.map(node => (
        <NeuralNodeMesh
          key={node.id}
          node={node}
          isSelected={node.id === selectedNode}
          onClick={onNodeClick}
        />
      ))}
    </group>
  );
};

// Node component
const NeuralNodeMesh: React.FC<{
  node: NeuralNode;
  isSelected: boolean;
  onClick: (id: string) => void;
}> = ({ node, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    // Gentle pulse
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + node.position[0]) * 0.05;
    meshRef.current.scale.setScalar(scale);

    // Glow pulse
    const glowScale = isSelected ? 1.6 : 1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    glowRef.current.scale.setScalar(glowScale);
  });

  return (
    <group position={node.position}>
      {/* Glow halo */}
      <Sphere ref={glowRef} args={[0.15, 16, 16]}>
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isSelected ? 0.6 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Main sphere */}
      <Sphere
        ref={meshRef}
        args={[0.12, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
      >
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

// Link component
const NeuralLinkMesh: React.FC<{ link: NeuralLink }> = ({ link }) => {
  const lineRef = useRef<any>(null);

  // Create layered glow effect
  const glowLayers = useMemo(() => [
    { width: 0.08, opacity: 0.2 },
    { width: 0.05, opacity: 0.4 },
    { width: 0.03, opacity: 0.8 }
  ], []);

  return (
    <group>
      {/* Glow layers */}
      {glowLayers.map((layer, i) => (
        <Line
          key={i}
          points={link.points}
          color={link.color}
          lineWidth={layer.width}
          transparent
          opacity={layer.opacity}
        />
      ))}

      {/* Main line */}
      <Line
        ref={lineRef}
        points={link.points}
        color={link.color}
        lineWidth={0.025}
        transparent
        opacity={1}
      />
    </group>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
