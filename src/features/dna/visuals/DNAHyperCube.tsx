// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useDNA } from '@/hooks/useDNA';
import { isMobile } from '@/lib/utils/device';
import { createGlassMaterial } from './materials/GlassMaterial';
import { createNeonEdges } from './geometry/NeonEdges';
import { TesseractGrid } from './geometry/TesseractGrid';
import { DNAPanels } from './panels/DNAPanels';

interface HyperCubeSceneProps {
  reducedMotion?: boolean;
}

const HyperCubeScene: React.FC<HyperCubeSceneProps> = ({ reducedMotion = false }) => {
  const { dnaProfile } = useDNA();
  const groupRef = useRef<THREE.Group>(null);
  const { gl, scene, camera } = useThree();
  const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null);
  
  const mobile = isMobile();
  const gridDensity = mobile ? 4 : 6;

  // Configure renderer for professional output
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.shadowMap.enabled = false;
  }, [gl]);

  // Glass material for outer cube faces
  const glassMaterial = useMemo(() => createGlassMaterial(), []);

  // Neon edges for outer cube
  const outerEdges = useMemo(() => createNeonEdges(2.0, 3), []);

  // Panel data from DNA profile
  const panelData = useMemo(() => {
    if (!dnaProfile) return null;
    return {
      front: { label: 'Vibrazione', value: dnaProfile.vibrazione },
      top: { label: 'Intuito', value: dnaProfile.intuito },
      right: { label: 'Audacia', value: dnaProfile.audacia },
      left: { label: 'Etica', value: dnaProfile.etica },
      back: { label: 'Rischio', value: dnaProfile.rischio }
    };
  }, [dnaProfile]);

  // Central core glow
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (coreRef.current && !reducedMotion) {
      const time = state.clock.elapsedTime;
      const intensity = 4.5 + Math.sin(time * 2) * 0.8;
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      
      // Rainbow shift
      const hue = (time * 0.1) % 1;
      (coreRef.current.material as THREE.MeshStandardMaterial).color.setHSL(hue, 1, 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#00d1ff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.6} color="#ff2768" />

      {/* Central core */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={4.5}
          toneMapped={false}
        />
      </mesh>

      {/* Outer glass cube faces */}
      <mesh material={glassMaterial}>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>

      {/* Outer neon edges */}
      {outerEdges}

      {/* Recursive inner grid */}
      <TesseractGrid density={gridDensity} cubeSize={2.0} reducedMotion={reducedMotion} />

      {/* DNA Panels */}
      {panelData && (
        <DNAPanels
          data={panelData}
          activePanelIndex={activePanelIndex}
          onPanelClick={setActivePanelIndex}
          cubeSize={2.0}
        />
      )}
    </group>
  );
};

interface DNAHyperCubeProps {
  className?: string;
  reducedMotion?: boolean;
}

export const DNAHyperCube: React.FC<DNAHyperCubeProps> = ({ 
  className = '', 
  reducedMotion = false 
}) => {
  const mobile = isMobile();

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={38} near={0.1} far={100} />
        
        {/* HDRI Environment */}
        <Environment preset="studio" />
        
        <HyperCubeScene reducedMotion={reducedMotion} />

        {/* Orbit controls with custom settings */}
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.8}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />

        {/* Post-processing effects */}
        {!reducedMotion && (
          <EffectComposer multisampling={mobile ? 0 : 4}>
            <Bloom
              intensity={mobile ? 0.8 : 1.1}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              kernelSize={KernelSize.MEDIUM}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.0018, 0.0018)}
            />
          </EffectComposer>
        )}
        {reducedMotion && (
          <EffectComposer multisampling={mobile ? 0 : 4}>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              kernelSize={KernelSize.SMALL}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
