// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass } from 'postprocessing';
import { createGlassMaterial } from './materials/GlassMaterial';
import { useRubikState } from './hooks/useRubikState';
import { useDNA } from '@/hooks/useDNA';

interface CubeletProps {
  position: [number, number, number];
  colors: { [key: string]: string };
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

const Cubelet: React.FC<CubeletProps> = ({ position, colors, onClick, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Glass material for the cubelet body
  const glassMaterial = useMemo(() => createGlassMaterial(), []);

  // Neon edge material
  const neonMaterials = useMemo(() => {
    const materials: { [key: string]: THREE.MeshStandardMaterial } = {};
    const colorMap: { [key: string]: string } = {
      front: '#00ff00',
      back: '#0000ff',
      right: '#ff0000',
      left: '#ff8800',
      top: '#ffff00',
      bottom: '#ffffff'
    };

    Object.entries(colors).forEach(([face, color]) => {
      const hue = parseInt(color.slice(1), 16) / 0xffffff;
      materials[face] = new THREE.MeshStandardMaterial({
        color: colorMap[face],
        emissive: colorMap[face],
        emissiveIntensity: hovered ? 4.0 : 2.5,
        toneMapped: false,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
    });

    return materials;
  }, [colors, hovered]);

  // Create neon edges using TubeGeometry
  const edges = useMemo(() => {
    const size = 0.95;
    const halfSize = size / 2;
    const radius = 0.008;
    const edgeLines = [
      // Front face edges
      [[-halfSize, -halfSize, halfSize], [halfSize, -halfSize, halfSize]],
      [[halfSize, -halfSize, halfSize], [halfSize, halfSize, halfSize]],
      [[halfSize, halfSize, halfSize], [-halfSize, halfSize, halfSize]],
      [[-halfSize, halfSize, halfSize], [-halfSize, -halfSize, halfSize]],
      // Back face edges
      [[-halfSize, -halfSize, -halfSize], [halfSize, -halfSize, -halfSize]],
      [[halfSize, -halfSize, -halfSize], [halfSize, halfSize, -halfSize]],
      [[halfSize, halfSize, -halfSize], [-halfSize, halfSize, -halfSize]],
      [[-halfSize, halfSize, -halfSize], [-halfSize, -halfSize, -halfSize]],
      // Connecting edges
      [[-halfSize, -halfSize, -halfSize], [-halfSize, -halfSize, halfSize]],
      [[halfSize, -halfSize, -halfSize], [halfSize, -halfSize, halfSize]],
      [[halfSize, halfSize, -halfSize], [halfSize, halfSize, halfSize]],
      [[-halfSize, halfSize, -halfSize], [-halfSize, halfSize, halfSize]]
    ];

    return edgeLines.map((line, idx) => {
      const [start, end] = line;
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      );
      const geometry = new THREE.TubeGeometry(curve, 2, radius, 8, false);
      return { geometry, idx };
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += Math.sin(time * 0.5 + position[0] + position[2]) * 0.0001;
    }
  });

  return (
    <group position={position}>
      {/* Glass cubelet body */}
      <mesh
        ref={meshRef}
        material={glassMaterial}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        <boxGeometry args={[0.95, 0.95, 0.95]} />
      </mesh>

      {/* Neon edges */}
      {edges.map(({ geometry, idx }) => (
        <mesh key={idx} geometry={geometry}>
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={hovered ? 8.0 : 5.0}
            toneMapped={false}
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

const RubikCube: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { dnaProfile } = useDNA();
  const { cubelets, rotateFace, resetCube } = useRubikState();
  const [hoveredCube, setHoveredCube] = useState<string | null>(null);

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.025;
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {cubelets.map((cubelet) => (
        <Cubelet
          key={cubelet.id}
          position={cubelet.position}
          colors={cubelet.colors}
          onClick={() => {
            console.log('Cubelet clicked:', cubelet.id);
            // Detect which face to rotate based on click
            // For now, just rotate a random face for demo
            const faces = ['F', 'B', 'R', 'L', 'U', 'D'];
            rotateFace(faces[Math.floor(Math.random() * faces.length)] as any);
          }}
          onHover={(hovered) => {
            setHoveredCube(hovered ? cubelet.id : null);
          }}
        />
      ))}

      {/* DNA attribute markers (optional visual) */}
      {dnaProfile && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={3.0}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
};

const PostProcessing: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (!gl || !scene || !camera) return;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    // Bloom effect
    const bloom = new BloomEffect({
      intensity: 1.1,
      luminanceThreshold: 0.22,
      luminanceSmoothing: 0.65
    });

    // Chromatic aberration
    const chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0013, 0.0013),
      radialModulation: false,
      modulationOffset: 0
    });

    composer.addPass(new EffectPass(camera, bloom, chroma));
    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
  }, [size]);

  useFrame((_, delta) => {
    if (composerRef.current) {
      composerRef.current.render(delta);
    }
  }, 1);

  return null;
};

const Scene: React.FC = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#00ffff" />

      {/* Rubik Cube */}
      <RubikCube />

      {/* Space background particles */}
      <Stars />

      {/* Post-processing */}
      <PostProcessing />
    </>
  );
};

const Stars: React.FC = () => {
  const points = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const RubikDNACube: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [4, 4, 4], fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15
        }}
      >
        <Scene />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          dampingFactor={0.1}
          enableDamping
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/80 text-sm">
          Trascina • Pizzica • Doppio tap reset
        </div>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
