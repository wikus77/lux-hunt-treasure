// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const M1ssionLogo3D = () => {
  console.log("🚀 M1ssionLogo3D component mounting");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    try {
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    } catch (error) {
      console.error("❌ M1ssionLogo3D useFrame error:", error);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Center>
          <group>
            {/* Main logo shape */}
            <mesh position={[-1, 0, 0]}>
              <boxGeometry args={[1.5, 0.4, 0.15]} />
              <meshStandardMaterial 
                color="#00FFFF" 
                emissive="#00FFFF"
                emissiveIntensity={0.4}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Secondary shape */}
            <mesh position={[1, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 8]} />
              <meshStandardMaterial 
                color="#FFFFFF" 
                emissive="#FFFFFF"
                emissiveIntensity={0.2}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        </Center>
      </Float>
    </group>
  );
};

const Hero3DScene = () => {
  console.log("🎬 Hero3DScene component mounting");
  
  const handleCanvasError = (error: any) => {
    console.error("❌ Canvas error caught:", error);
    return null;
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        className="absolute inset-0"
        onError={handleCanvasError}
      >
        <Suspense fallback={
          <Html center>
            <div className="text-cyan-400 animate-spin text-3xl">⟳</div>
          </Html>
        }>
          <React.Fragment>
            <Environment preset="night" />
          
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.2} 
            color="#ffffff"
            castShadow
          />
          
          <ambientLight intensity={0.6} color="#4a90e2" />
          
          <pointLight 
            position={[0, 0, 5]} 
            intensity={1.0} 
            color="#00FFFF" 
          />
          
          <pointLight 
            position={[-5, 5, 0]} 
            intensity={0.8} 
            color="#ffffff" 
          />

            <M1ssionLogo3D />

            <EffectComposer>
              <Bloom 
                intensity={0.6}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
              />
              <Vignette 
                offset={0.2}
                darkness={0.3}
              />
            </EffectComposer>
          </React.Fragment>
        </Suspense>
      </Canvas>

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-center space-y-8 max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-white drop-shadow-2xl">
            The Future
            <span className="block font-thin text-4xl md:text-6xl mt-4 text-cyan-400 drop-shadow-lg">
              Starts Here
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Discover next-generation experiences with M1SSION™
          </p>

          <button className="pointer-events-auto group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
            <span className="relative z-10">Start Mission</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero3DScene;