// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';
import { createGlassMaterial } from './materials/GlassMaterial';
import { useRubikState } from './hooks/useRubikState';
import { usePreferences } from '@/hooks/usePreferences';

// Helper: create cube edges as TubeGeometry curves
function createCubeEdges() {
  const size = 0.7;
  const halfSize = size / 2;
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

  return edgeLines.map((line) => {
    const [start, end] = line;
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...(start as [number, number, number])),
      new THREE.Vector3(...(end as [number, number, number]))
    );
    return {
      curve,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  });
}

// Individual cubelet with glass material, colored stickers, and neon edges
interface CubeletProps {
  position: [number, number, number];
  rotation: [number, number, number];
  colors: {
    front: string;
    back: string;
    right: string;
    left: string;
    top: string;
    bottom: string;
  };
}

const Cubelet: React.FC<CubeletProps> = ({ position, rotation, colors }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glassMat = useMemo(() => createGlassMaterial(), []);
  
  // Sticker offset from cube center
  const stickerOffset = 0.476;
  const stickerSize = 0.65;

  return (
    <group position={position} rotation={rotation}>
      {/* Main glass cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <primitive object={glassMat} />
      </mesh>

      {/* Colored stickers on visible faces */}
      {colors.front !== '#000000' && (
        <mesh position={[0, 0, stickerOffset]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.front} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.front}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
      {colors.back !== '#000000' && (
        <mesh position={[0, 0, -stickerOffset]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.back} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.back}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
      {colors.right !== '#000000' && (
        <mesh position={[stickerOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.right} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.right}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
      {colors.left !== '#000000' && (
        <mesh position={[-stickerOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.left} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.left}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
      {colors.top !== '#000000' && (
        <mesh position={[0, stickerOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.top} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.top}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
      {colors.bottom !== '#000000' && (
        <mesh position={[0, -stickerOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial 
            color={colors.bottom} 
            transparent 
            opacity={0.95} 
            side={THREE.DoubleSide}
            emissive={colors.bottom}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Neon edges using TubeGeometry */}
      {createCubeEdges().map((edge, i) => (
        <mesh key={i} position={edge.position} rotation={edge.rotation}>
          <tubeGeometry args={[edge.curve, 8, 0.008, 8, false]} />
          <meshStandardMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.8}
            emissive="#00ffff"
            emissiveIntensity={2.0}
            toneMapped={false}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Camera fit utility
function useCameraFit() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const box = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(3, 3, 3) // 4×4 cube approximate size
      );
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      
      const padding = 1.25;
      const distance = (sphere.radius * padding) / Math.tan((camera.fov * Math.PI) / 360);
      
      camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
      camera.lookAt(0, 0, 0);
      camera.near = distance * 0.1;
      camera.far = distance * 3;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);
}

// Starfield background
const Stars: React.FC = () => {
  const points = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

// Post-processing with vanilla postprocessing library
const PostProcessing: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (!gl || !scene || !camera) return;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    // Bloom effect
    const bloom = new BloomEffect({
      intensity: reducedMotion ? 0.6 : 1.1,
      luminanceThreshold: 0.22,
      luminanceSmoothing: 0.65
    });

    composer.addPass(new EffectPass(camera, bloom));
    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, reducedMotion]);

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

// Scene with all cubelets and environment
const RubikScene: React.FC = () => {
  const { cubelets, rotateFace, scramble, resetCube } = useRubikState();
  const groupRef = useRef<THREE.Group>(null);
  const { reducedMotion } = usePreferences();
  
  useCameraFit();

  // Floating animation (subtle for 4×4)
  useFrame(({ clock }) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.02;
      groupRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <>
      {/* Starfield background */}
      {!reducedMotion && <Stars />}

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 8, 8]} intensity={1.0} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#00ffff" />

      {/* All 64 cubelets (4×4×4) */}
      <group ref={groupRef}>
        {cubelets.map((cubelet) => (
          <Cubelet
            key={cubelet.id}
            position={cubelet.position}
            rotation={cubelet.rotation}
            colors={cubelet.colors}
          />
        ))}
      </group>

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.7}
      />

      {/* Post-processing */}
      <PostProcessing reducedMotion={reducedMotion || false} />
    </>
  );
};

// Main export component with square adaptive sizing
export default function RubikDNACube() {
  const { reducedMotion } = usePreferences();
  
  return (
    <div 
      className="relative mx-auto"
      style={{
        width: 'min(90vw, 75vh)',
        height: 'min(90vw, 75vh)',
        maxWidth: '800px',
        maxHeight: '800px'
      }}
    >
      <Canvas
        camera={{ position: [5, 4, 5], fov: 42, near: 0.5, far: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
      >
        <RubikScene />
      </Canvas>
      
      {/* Optional control hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-white/60 pointer-events-none">
        Trascina • Ruota • Doppio tap reset
      </div>
    </div>
  );
}

export { RubikDNACube };

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
