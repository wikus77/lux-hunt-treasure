// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createWireframeTunnel, QUALITY_PRESETS, type TunnelQuality } from './geometry/tunnel';
import { LightningSystem } from './effects/lightning';
import { useFractalInput } from './input/useFractalInput';
import { useDNAFractalGame } from './state/useDNAFractalGame';
import { useMindFractalSession } from './persistence/useMindFractalSession';
import { FPSMonitor } from './fpsMonitor';
import { Loader2 } from 'lucide-react';

interface MindFractalLiteProps {
  seed: number;
  reduced?: boolean;
  onReady?: () => void;
  onBurst?: () => void;
}

/**
 * Mind Fractal 3D - Pure Three.js implementation
 * Wireframe tunnel with OrbitControls, neon lightning effects, and evolution mechanics
 */
export const MindFractalLite: React.FC<MindFractalLiteProps> = ({
  seed,
  reduced = false,
  onReady,
  onBurst
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<TunnelQuality>(
    reduced ? QUALITY_PRESETS.low : QUALITY_PRESETS.mobile
  );
  
  // Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const tunnelRef = useRef<THREE.LineSegments | null>(null);
  const lightningRef = useRef<LightningSystem | null>(null);
  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const firstFrameRef = useRef(false);
  
  // Game state
  const { selectLast, queueUpsert } = useMindFractalSession();
  const [gameState, gameActions] = useDNAFractalGame(
    seed,
    (state) => {
      queueUpsert({
        seed: state.seed,
        moves: state.moves,
        time_spent: state.timeSpent,
        completion_ratio: state.completionRatio
      });
    }
  );
  
  // Dynamic color based on completion ratio
  const getWireframeColor = useCallback((ratio: number): THREE.Color => {
    if (ratio < 0.3) {
      // Ice blue → Silver
      return new THREE.Color().lerpColors(
        new THREE.Color(0xA7C7FF),
        new THREE.Color(0xD9D9D9),
        ratio / 0.3
      );
    } else if (ratio < 0.7) {
      // Silver
      return new THREE.Color(0xD9D9D9);
    } else {
      // Silver → Platinum (near white)
      return new THREE.Color().lerpColors(
        new THREE.Color(0xD9D9D9),
        new THREE.Color(0xF5F5F5),
        (ratio - 0.7) / 0.3
      );
    }
  }, []);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      rect.width / rect.height,
      0.1,
      200
    );
    camera.position.set(0, 0.5, 3.5);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    
    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = reduced ? 0.15 : 0.08;
    controls.minDistance = 1.2;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI * 0.66;
    controls.enablePan = false;
    controlsRef.current = controls;
    
    // FPS Monitor
    const fpsMonitor = new FPSMonitor();
    fpsMonitorRef.current = fpsMonitor;
    
    // Wireframe tunnel material
    const tunnelMaterial = new THREE.LineBasicMaterial({
      color: getWireframeColor(gameState.completionRatio),
      transparent: true,
      opacity: 0.85,
      depthWrite: true,
      depthTest: true
    });
    
    // Create tunnel
    const tunnel = createWireframeTunnel(quality, seed, tunnelMaterial);
    scene.add(tunnel);
    tunnelRef.current = tunnel;
    
    // Lightning system
    const lightning = new LightningSystem(
      scene,
      reduced ? 32 : (quality === QUALITY_PRESETS.high ? 128 : 64)
    );
    lightningRef.current = lightning;
    
    // Load last session
    selectLast().then(session => {
      if (session) {
        console.info('[MindFractal] Loaded session:', session);
        // TODO: Restore state from session
      }
    });
    
    // Animation loop
    let lastTime = performance.now();
    let idleLightningTimer = 0;
    let pulseTime = 0;
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      // FPS monitoring
      const currentFps = fpsMonitor.tick();
      const avgFps = fpsMonitor.getAverage();
      
      // Quality scaling (check every 2s)
      if (now % 2000 < 16 && !reduced) {
        if (avgFps < 45 && quality !== QUALITY_PRESETS.low) {
          console.info('[MindFractal] Low FPS detected, reducing quality');
          setQuality(QUALITY_PRESETS.low);
        } else if (avgFps > 58 && quality === QUALITY_PRESETS.low) {
          console.info('[MindFractal] FPS stable, increasing quality');
          setQuality(QUALITY_PRESETS.mobile);
        }
        
        setFps(Math.round(avgFps));
      }
      
      // Update controls
      controls.update();
      
      // Pulse animation on wireframe
      pulseTime += deltaTime * 0.6;
      const pulse = Math.sin(pulseTime) * 0.5 + 0.5;
      
      if (tunnelRef.current?.material instanceof THREE.LineBasicMaterial) {
        tunnelRef.current.material.opacity = 0.75 + pulse * 0.15;
        tunnelRef.current.material.color = getWireframeColor(gameState.completionRatio);
      }
      
      // Slow rotation
      if (tunnelRef.current) {
        tunnelRef.current.rotation.z += deltaTime * 0.05;
      }
      
      // Idle lightning
      idleLightningTimer += deltaTime;
      if (idleLightningTimer > 1.5 && lightning) {
        lightning.createIdleBolts(2.5, reduced ? 1 : 2);
        idleLightningTimer = 0;
      }
      
      // Update lightning
      if (lightning) {
        lightning.update(deltaTime);
      }
      
      // Render
      renderer.render(scene, camera);
      
      // First frame callback
      if (!firstFrameRef.current) {
        firstFrameRef.current = true;
        setIsLoading(false);
        onReady?.();
        console.info('[MindFractal] First frame rendered');
      }
    };
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (lightningRef.current) {
        lightningRef.current.dispose();
      }
      
      if (tunnelRef.current) {
        scene.remove(tunnelRef.current);
        tunnelRef.current.geometry.dispose();
        if (tunnelRef.current.material instanceof THREE.Material) {
          tunnelRef.current.material.dispose();
        }
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [seed, quality, reduced, onReady, getWireframeColor, gameState.completionRatio, selectLast]);
  
  // Input handling
  useFractalInput(canvasRef, cameraRef.current, {
    onTap: (event) => {
      console.info('[MindFractal] Tap:', event.normalized);
      gameActions.incrementMoves();
      
      // Create lightning at tap position
      if (lightningRef.current && cameraRef.current) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(
          new THREE.Vector2(event.normalized.x, event.normalized.y),
          cameraRef.current
        );
        
        const targetPos = raycaster.ray.origin.clone().add(
          raycaster.ray.direction.multiplyScalar(3)
        );
        
        lightningRef.current.createBolt(
          new THREE.Vector3(0, 0, 0),
          targetPos,
          0.5,
          1.2
        );
      }
    },
    onTrace: (event) => {
      gameActions.incrementConnections();
    }
  });
  
  // Evolve DNA handler
  const handleEvolve = useCallback(() => {
    gameActions.evolve();
    
    // Visual burst
    if (lightningRef.current) {
      lightningRef.current.createBurst(new THREE.Vector3(0, 0, -2), 16);
    }
    
    // Boost tunnel brightness temporarily
    if (tunnelRef.current?.material instanceof THREE.LineBasicMaterial) {
      const originalOpacity = tunnelRef.current.material.opacity;
      tunnelRef.current.material.opacity = 1.0;
      
      setTimeout(() => {
        if (tunnelRef.current?.material instanceof THREE.LineBasicMaterial) {
          tunnelRef.current.material.opacity = originalOpacity;
        }
      }, 2000);
    }
    
    onBurst?.();
  }, [gameActions, onBurst]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-white/70 text-sm font-medium">Inizializzazione Mind Fractal...</p>
          </div>
        </div>
      )}
      
      {/* HUD Overlay */}
      {!isLoading && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-cyan-400/30">
            <p className="text-xs text-cyan-400 font-mono">
              FPS: <span className="font-bold">{fps}</span>
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-purple-400/30">
            <p className="text-xs text-purple-400 font-mono">
              Completion: <span className="font-bold">{(gameState.completionRatio * 100).toFixed(1)}%</span>
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20">
            <p className="text-xs text-white/60 font-mono">
              {quality.label} | {reduced ? 'Reduced' : 'Normal'}
            </p>
          </div>
        </div>
      )}
      
      {/* Evolve DNA Button (testing) */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleEvolve}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
        >
          ⚡ Evolvi DNA
        </button>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
