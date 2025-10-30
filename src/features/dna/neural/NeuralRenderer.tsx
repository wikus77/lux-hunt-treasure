/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Renderer
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Tube } from '@react-three/drei';
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

// Node component with physical material and axon glow
const NeuralNodeMesh: React.FC<{
  node: NeuralNode;
  isSelected: boolean;
  onClick: (id: string) => void;
}> = ({ node, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const axonRef = useRef<THREE.Mesh>(null);
  const bpm = 80;
  const beatInterval = 60 / bpm;

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !axonRef.current) return;

    // Synchronized pulse at 80 BPM
    const beatPhase = (state.clock.elapsedTime % beatInterval) / beatInterval;
    const pulse = Math.sin(beatPhase * Math.PI * 2) * 0.5 + 0.5;
    
    const scale = 1 + pulse * 0.08;
    meshRef.current.scale.setScalar(scale);

    // Glow pulse
    const glowScale = isSelected ? 1.8 : 1.4 + pulse * 0.2;
    glowRef.current.scale.setScalar(glowScale);

    // Axon rotation
    axonRef.current.rotation.z += 0.01;

    // Update emissive intensity based on pulse
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (material.emissiveIntensity !== undefined) {
      material.emissiveIntensity = (isSelected ? 1.2 : 0.6) + pulse * 0.4;
    }
  });

  return (
    <group position={node.position}>
      {/* Outer glow halo */}
      <Sphere ref={glowRef} args={[0.2, 16, 16]}>
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isSelected ? 0.4 : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Axon glow tube */}
      <mesh ref={axonRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (Math.PI / 2) * i]}>
            <capsuleGeometry args={[0.01, 0.3, 4, 8]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </mesh>

      {/* Main neuron sphere - Physical material */}
      <Sphere
        ref={meshRef}
        args={[0.14, 48, 48]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
      >
        <meshPhysicalMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 1.2 : 0.6}
          metalness={0.1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.8}
          thickness={0.5}
          ior={1.45}
          attenuationDistance={4}
          attenuationColor={new THREE.Color(node.color)}
        />
      </Sphere>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.26, 32]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

// Link component with traveling spark
const NeuralLinkMesh: React.FC<{ link: NeuralLink }> = ({ link }) => {
  const lineRef = useRef<any>(null);
  const sparkRef = useRef<THREE.Mesh>(null);
  const [sparkProgress, setSparkProgress] = useState(0);

  // Create layered glow effect
  const glowLayers = useMemo(() => [
    { width: 0.1, opacity: 0.15 },
    { width: 0.06, opacity: 0.35 },
    { width: 0.035, opacity: 0.7 }
  ], []);

  // Calculate spark position along bezier curve
  useFrame((state) => {
    if (!sparkRef.current) return;
    
    // Traveling spark animation
    const speed = 0.3;
    const progress = (state.clock.elapsedTime * speed) % 1;
    setSparkProgress(progress);

    // Interpolate position along curve points
    const idx = Math.floor(progress * (link.points.length - 1));
    const nextIdx = Math.min(idx + 1, link.points.length - 1);
    const t = (progress * (link.points.length - 1)) - idx;
    
    const p1 = link.points[idx];
    const p2 = link.points[nextIdx];
    
    sparkRef.current.position.set(
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t,
      p1[2] + (p2[2] - p1[2]) * t
    );

    // Pulse spark
    const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5;
    sparkRef.current.scale.setScalar(0.8 + pulse * 0.4);
  });

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
          blending={THREE.AdditiveBlending}
        />
      ))}

      {/* Main line */}
      <Line
        ref={lineRef}
        points={link.points}
        color={link.color}
        lineWidth={0.03}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
      />

      {/* Traveling spark */}
      <Sphere ref={sparkRef} args={[0.06, 16, 16]}>
        <meshBasicMaterial
          color={link.color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
