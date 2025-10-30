/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Links Scene
 */

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
    <div className="relative w-full h-screen bg-black overflow-hidden">
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
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          {/* Deep space nebula background */}
          <NebulaBackground />
          
          {/* Enhanced particle field */}
          <NeuralParticles />

          {/* Lighting setup */}
          <hemisphereLight args={['#0051ba', '#000033', 0.4]} />
          <ambientLight intensity={0.2} />
          
          {/* Dynamic synced lights */}
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

          {/* Post-processing: Bloom + Vignette + subtle effects */}
          <DNAComposerVanilla
            enabled={true}
            bloom={1.8}
            vignette={0.3}
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
