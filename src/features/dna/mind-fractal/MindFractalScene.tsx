/**
 * © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal Scene
 */

import React, { useEffect, useRef, useState } from 'react';
import { initRenderer, renderFrame, cleanupRenderer } from './canvas/renderer';
import { useMindFractalGame } from './logic/useMindFractalGame';
import { AudioEngine } from './audio/AudioEngine';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const MindFractalScene: React.FC = () => {
  const { getCurrentUser } = useUnifiedAuth();
  const user = getCurrentUser();
  const userId = user?.id || '';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const [isWebGL2Available, setIsWebGL2Available] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const {
    gameState,
    handleTap,
    handleOrbit,
    handlePinch,
    reset
  } = useMindFractalGame(userId);

  // Use ref to avoid re-init loop
  const gameRef = useRef(gameState);
  
  // Sync gameRef with gameState without triggering re-init
  useEffect(() => {
    gameRef.current = gameState;
  }, [gameState]);

  // Initialize once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL2 support
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      setIsWebGL2Available(false);
      setIsLoading(false);
      return;
    }

    // Initialize renderer
    const renderer = initRenderer(canvas);
    if (!renderer) {
      setIsWebGL2Available(false);
      setIsLoading(false);
      return;
    }

    // Initialize audio (non-blocking)
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.init().catch((err) => {
      console.warn('[Mind Fractal] Audio init skipped:', err);
    });

    // UI ready as soon as renderer is up
    setIsLoading(false);

    // Animation loop - reads gameRef.current without re-creating
    const animate = (time: number) => {
      if (!renderer) return;
      
      const currentGame = gameRef.current;
      renderFrame(renderer, {
        time: time * 0.001,
        seed: currentGame.seed,
        connections: currentGame.connections,
        moves: currentGame.moves
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupRenderer();
      audioEngineRef.current?.destroy();
    };
  }, []); // Only run once on mount

  // Handle interactions
  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    handleTap({ x, y });
    audioEngineRef.current?.playPulse();
  };

  if (!isWebGL2Available) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">WebGL2 Non Disponibile</h2>
          <p className="text-muted-foreground">
            Il tuo dispositivo non supporta WebGL2. Aggiorna il browser o usa un dispositivo più recente.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground text-lg">Inizializzazione Mind Fractal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0b1021]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        onClick={handleCanvasClick}
        style={{ display: 'block' }}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">SEED</div>
          <div className="text-lg font-mono text-cyan-400">{gameState.seed.toString(16).toUpperCase().slice(0, 8)}</div>
        </div>

        <div className="flex gap-4">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">MOSSE</div>
            <div className="text-lg font-bold text-white">{gameState.moves}</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">TEMPO</div>
            <div className="text-lg font-mono text-white">{Math.floor(gameState.timeSpent / 1000)}s</div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-400 mb-1">COLLEGAMENTI</div>
            <div className="text-lg font-bold text-magenta-400">{gameState.connections}/6</div>
          </div>
        </div>
      </div>

      {/* Victory Banner */}
      {gameState.connections >= 6 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-auto">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-orange-400 mb-4 animate-pulse">
              STABILIZZATO!
            </h1>
            <p className="text-xl text-gray-300 mb-6">Flusso sinaptico in equilibrio perfetto</p>
            <div className="text-3xl font-mono text-cyan-400 mb-8">
              Score: {gameState.score}
            </div>
            <button
              onClick={reset}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
            >
              Nuovo Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
