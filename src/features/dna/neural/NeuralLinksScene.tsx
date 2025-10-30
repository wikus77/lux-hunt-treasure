/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Links Scene
 */

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DNAComposerVanilla } from '../common/DNAComposerVanilla';
import { NeuralRenderer } from './NeuralRenderer';
import { UiHUD } from './UiHUD';
import { useNeuralGame } from './useNeuralGame';
import { NebulaBackground, NeuralParticles, DynamicLights } from './NeuralFX';

export const NeuralLinksScene: React.FC = () => {
  const {
    gameState,
    isLoading,
    selectedNode,
    handleNodeClick,
    handleReset,
    handleUndo
  } = useNeuralGame();

  const controlsRef = useRef<any>(null);

  const handleRecenter = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground text-lg">Inizializzazione rete neurale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#0b1021' }}>
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          {/* Deep space nebula background - exact color */}
          <color attach="background" args={['#0b1021']} />
          <NebulaBackground />
          
          {/* Dense particle field (1000-2000 as specified) */}
          <NeuralParticles />

          {/* Lighting setup - EXACT specs */}
          <hemisphereLight args={['#2a51ff', '#0b1021', 0.2]} />
          <ambientLight intensity={0.15} />
          
          {/* Dynamic synced lights - soft blue/cyan + warm rim */}
          <DynamicLights />

          {/* Neural network */}
          {gameState && (
            <NeuralRenderer
              nodes={gameState.nodes}
              links={gameState.links}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
            />
          )}

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={4}
            maxDistance={15}
            maxPolarAngle={Math.PI}
            enablePan={false}
          />

          {/* Post-processing: EXACT specs - Bloom (threshold 0.78, strength 1.15, radius 0.58) + Vignette + ChromaticAberration + Noise */}
          <DNAComposerVanilla
            enabled={true}
            bloom={1.15}
            vignette={0.3}
            chromaticAberration={0.0012}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <UiHUD
        gameState={gameState}
        onReset={handleReset}
        onUndo={handleUndo}
        onRecenter={handleRecenter}
      />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
