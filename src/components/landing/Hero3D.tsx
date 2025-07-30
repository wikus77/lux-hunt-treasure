// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Environment, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

const M1ssionLogo3D = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Center>
          <mesh>
            <boxGeometry args={[2, 0.5, 0.2]} />
            <meshStandardMaterial 
              color="#00FFFF" 
              emissive="#00FFFF"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Center>
      </Float>
    </group>
  );
};

const Hero3DScene = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        className="absolute inset-0"
      >
        <Suspense fallback={
          <Html center>
            <div className="text-primary animate-spin">⟳</div>
          </Html>
        }>
          <Environment preset="studio" />
          
          {/* Soft directional light */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Ambient light */}
          <ambientLight intensity={0.4} />
          
          {/* Point light for extra glow */}
          <pointLight 
            position={[0, 0, 5]} 
            intensity={0.5} 
            color="#00FFFF" 
          />

          <M1ssionLogo3D />

          <EffectComposer>
            <Bloom 
              intensity={0.4}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
            />
            <Vignette 
              offset={0.3}
              darkness={0.4}
            />
            <DepthOfField 
              focusDistance={0.01}
              focalLength={0.02}
              bokehScale={2}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-center space-y-8 max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-foreground">
            The Future
            <span className="block font-thin text-4xl md:text-6xl mt-4 text-muted-foreground">
              Starts Here
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover next-generation experiences with M1SSION™
          </p>

          <button className="pointer-events-auto group relative px-12 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="relative z-10">Start Mission</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/30 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero3DScene;