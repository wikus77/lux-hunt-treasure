// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createWireTunnel, TunnelConfig } from './createWireTunnel';
import { FPSMonitor } from './fpsMonitor';

interface MindFractalLiteProps {
  seed?: number;
  onReady?: () => void;
}

/**
 * Mind Fractal Lite - Pure Three.js wireframe tunnel
 * Replicates reference: black background, white/silver triangular mesh, center hole, depth effect
 */
export const MindFractalLite: React.FC<MindFractalLiteProps> = ({ 
  seed = 42069, 
  onReady 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 2000);
    camera.position.z = 120;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Create tunnel with default quality
    const defaultConfig: TunnelConfig = {
      rings: 80,
      segments: 60,
      startRadius: 60,
      endRadius: 4,
      depth: 400
    };
    
    const reducedConfig: TunnelConfig = {
      rings: 40,
      segments: 30,
      startRadius: 60,
      endRadius: 4,
      depth: 400
    };
    
    let currentConfig = defaultConfig;
    let tunnel = createWireTunnel(currentConfig, seed);
    scene.add(tunnel);
    
    // FPS monitoring for quality scaling
    const fpsMonitor = new FPSMonitor();
    let qualityReduced = false;
    let frameCount = 0;
    
    // Animation state
    let time = 0;
    let animationId: number;
    let firstFramePresented = false;
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      time += 0.016; // ~60fps
      frameCount++;
      
      // FPS monitoring
      const currentFps = fpsMonitor.tick();
      
      // Quality scaling on iOS if FPS drops below 45
      if (frameCount > 120 && !qualityReduced) { // Wait 2s before scaling
        const avgFps = fpsMonitor.getAverage();
        
        if (avgFps < 45) {
          console.log('[MindFractalLite] Low FPS detected, reducing quality:', avgFps);
          qualityReduced = true;
          
          // Replace tunnel with reduced quality
          scene.remove(tunnel);
          tunnel.geometry.dispose();
          (tunnel.material as THREE.Material).dispose();
          
          currentConfig = reducedConfig;
          tunnel = createWireTunnel(currentConfig, seed);
          scene.add(tunnel);
        }
      }
      
      // Update FPS display every 30 frames
      if (frameCount % 30 === 0) {
        setFps(Math.round(fpsMonitor.getAverage()));
      }
      
      // Gentle pulsation on front rings (scale modulation)
      const pulseFactor = 1 + Math.sin(time * 0.6) * 0.02;
      tunnel.scale.setScalar(pulseFactor);
      
      // Slow rotation
      tunnel.rotation.z += 0.0005;
      
      // Slight camera drift (optional, very subtle)
      camera.position.z = 120 + Math.sin(time * 0.3) * 2;
      
      // Render
      renderer.render(scene, camera);
      
      // Close spinner after first frame
      if (!firstFramePresented) {
        firstFramePresented = true;
        setIsLoading(false);
        onReady?.();
      }
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      scene.remove(tunnel);
      tunnel.geometry.dispose();
      (tunnel.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [seed, onReady]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm">Inizializzazione tunnel neurale...</p>
          </div>
        </div>
      )}
      
      {/* FPS & Mode HUD */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs font-mono">
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-400/30 text-cyan-400">
          {fps} FPS
        </div>
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-purple-400/30 text-purple-400">
          Lite Mode
        </div>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
