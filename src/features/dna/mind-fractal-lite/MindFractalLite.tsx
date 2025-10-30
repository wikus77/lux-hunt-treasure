/**
 * © 2025 Joseph MULÉ – M1SSION™ – Mind Fractal Lite (Three.js)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createSceneSetup, handleResize, measureFPS } from './three-helpers';
import {
  createWireTunnel,
  animateTunnel,
  DEFAULT_TUNNEL_CONFIG,
  REDUCED_TUNNEL_CONFIG
} from './createWireTunnel';

interface MindFractalLiteProps {
  onReady?: () => void;
}

export const MindFractalLite: React.FC<MindFractalLiteProps> = ({ onReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firstPresentedRef = useRef(false);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    tunnel: THREE.LineSegments;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('[MF Lite] Initializing Three.js scene');

    // Setup scene
    const { renderer, scene, camera } = createSceneSetup(canvas);
    
    // Create tunnel with default config
    let tunnel = createWireTunnel(DEFAULT_TUNNEL_CONFIG);
    scene.add(tunnel);

    sceneRef.current = { renderer, scene, camera, tunnel };

    let animationFrameId: number;
    let useReducedQuality = false;

    // FPS monitor for quality scaling
    const stopFPSMonitor = measureFPS((fps) => {
      if (fps < 45 && !useReducedQuality) {
        console.log(`[MF Lite] Low FPS detected (${fps}), switching to reduced quality`);
        useReducedQuality = true;
        
        // Replace tunnel with reduced geometry
        scene.remove(tunnel);
        tunnel.geometry.dispose();
        (tunnel.material as THREE.Material).dispose();
        
        tunnel = createWireTunnel(REDUCED_TUNNEL_CONFIG);
        scene.add(tunnel);
        
        if (sceneRef.current) {
          sceneRef.current.tunnel = tunnel;
        }
      }
    });

    // Animation loop
    const animate = (time: number) => {
      const timeInSeconds = time * 0.001;

      // Animate tunnel
      animateTunnel(tunnel, camera, timeInSeconds);

      // Render
      renderer.render(scene, camera);

      // Mark first frame presented
      if (!firstPresentedRef.current) {
        firstPresentedRef.current = true;
        setIsLoading(false);
        onReady?.();
        console.log('[MF Lite] First frame rendered');
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    // Resize handler
    const onResizeHandler = () => {
      handleResize(renderer, camera);
    };
    window.addEventListener('resize', onResizeHandler);

    // Cleanup
    return () => {
      console.log('[MF Lite] Cleanup');
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      stopFPSMonitor();
      window.removeEventListener('resize', onResizeHandler);
      
      tunnel.geometry.dispose();
      (tunnel.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [onReady]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0b1021]">
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
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Minimal HUD */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg pointer-events-none">
        <div className="text-xs text-gray-400 mb-1">MIND FRACTAL</div>
        <div className="text-sm font-mono text-cyan-400">Lite Mode</div>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
