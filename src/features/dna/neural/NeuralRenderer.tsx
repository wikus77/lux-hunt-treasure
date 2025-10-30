/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Renderer
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { NeuralNode, NeuralLink, NEURON_CORE_COLOR, NEURON_HALO_COLOR, NEURON_HIGHLIGHT_COLOR } from './types';
import { HotSynapseMaterial } from './shaders/HotSynapseMaterial';

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

interface NeuralNodeProps {
  node: NeuralNode;
  isSelected: boolean;
  onClick: (id: string) => void;
}

function NeuralNodeMesh({ node, isSelected, onClick }: NeuralNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Points>(null);

  // BPM-synchronized pulse (68-76 BPM)
  const bpm = 72;
  const frequency = bpm / 60;

  // Create orbital particle corona
  const coronaParticles = React.useMemo(() => {
    const particles = new THREE.BufferGeometry();
    const positions: number[] = [];
    const count = 24;
    
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 0.25 + Math.random() * 0.05;
      
      positions.push(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius,
        Math.sin(phi) * Math.sin(theta) * radius
      );
    }
    
    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return particles;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const pulse = 0.85 + 0.15 * Math.sin(time * frequency * Math.PI * 2);
    
    // Exact material properties from specs
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.emissiveIntensity = pulse * (isSelected ? 2.0 : 1.7);

    // Subtle rotation
    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x += 0.001;

    // Glow layer pulse
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMat.opacity = pulse * 0.35;
    }

    // Rotate corona particles
    if (coronaRef.current) {
      coronaRef.current.rotation.y = time * 0.15;
      coronaRef.current.rotation.x = time * 0.08;
    }
  });

  return (
    <group position={node.position}>
      {/* Main neuron sphere - EXACT specs from requirements */}
      <Sphere
        ref={meshRef}
        args={[0.15, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color={NEURON_CORE_COLOR}
          emissive={NEURON_CORE_COLOR}
          emissiveIntensity={1.7}
          clearcoat={1}
          transmission={0.55}
          thickness={0.35}
          ior={1.35}
          roughness={0.18}
          metalness={0}
          attenuationDistance={4}
          attenuationColor={NEURON_HALO_COLOR}
        />
      </Sphere>

      {/* Glow halo - hot orange */}
      <Sphere ref={glowRef} args={[0.24, 16, 16]}>
        <meshBasicMaterial
          color={NEURON_HALO_COLOR}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* Orbital particle corona */}
      <points ref={coronaRef} geometry={coronaParticles}>
        <pointsMaterial
          size={0.02}
          color={NEURON_HIGHLIGHT_COLOR}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Selection indicator */}
      {isSelected && (
        <Sphere args={[0.30, 16, 16]}>
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Hover ring */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.26, 32]} />
          <meshBasicMaterial
            color={NEURON_HIGHLIGHT_COLOR}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

interface NeuralLinkProps {
  link: NeuralLink;
}

function NeuralLinkMesh({ link }: NeuralLinkProps) {
  const tubeRef = useRef<THREE.Mesh>(null);
  const sparkRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const [sparkPos, setSparkPos] = useState(0);
  const hotMaterialRef = useRef<HotSynapseMaterial | null>(null);

  // Create curve from points
  const curve = React.useMemo(() => {
    const points = link.points.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points);
  }, [link.points]);

  // Create THIN tube geometry (0.006-0.012 radius as specified)
  const tubeGeometry = React.useMemo(() => {
    return new THREE.TubeGeometry(curve, 24, 0.008, 6, false);
  }, [curve]);

  // Thicker glow tube
  const glowTubeGeometry = React.useMemo(() => {
    return new THREE.TubeGeometry(curve, 24, 0.015, 6, false);
  }, [curve]);

  // Create hot synapse material for active links
  const hotMaterial = React.useMemo(() => {
    hotMaterialRef.current = new HotSynapseMaterial();
    return hotMaterialRef.current;
  }, []);

  useFrame((state) => {
    // Update hot synapse shader time
    if (hotMaterialRef.current) {
      hotMaterialRef.current.updateTime(state.clock.elapsedTime);
    }

    // Animate traveling spark
    const speed = 0.4;
    const newPos = (state.clock.elapsedTime * speed) % 1;
    setSparkPos(newPos);

    const point = curve.getPoint(newPos);
    
    if (sparkRef.current) {
      sparkRef.current.position.copy(point);
    }
    
    if (flareRef.current) {
      flareRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* Main filament tube - THIN as specified */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshBasicMaterial
          color={link.color}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow layer (subtle) */}
      <mesh geometry={glowTubeGeometry}>
        <meshBasicMaterial
          color={link.color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Traveling spark with hot synapse material */}
      <Sphere ref={sparkRef} args={[0.035, 12, 12]}>
        <primitive object={hotMaterial} attach="material" />
      </Sphere>

      {/* Spark flare (tiny lens dirt effect) */}
      <Sphere ref={flareRef} args={[0.055, 8, 8]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
