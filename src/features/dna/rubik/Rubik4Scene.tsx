/**
 * Rubik's Cube 4×4 Complete Scene
 * Wireframe-only rendering, HDRI universe, vanilla bloom, gesture controls
 */

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Cubelet } from './Rubik4Meshes';
import { initializeRubikState, saveRubikState, logMove, debouncedSave } from './state';
import { applyMove, generateScramble, isSolved, undoMove } from './Rubik4Core';
import { usePreferences } from '@/hooks/usePreferences';
import { RubikGestureController } from './controls/RubikGestures';
import { VanillaBloomComposer } from './rendering/VanillaBloom';
import { FPSMonitor } from './rendering/FPSMonitor';
import type { RubikState, Move } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, Shuffle, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const CUBIE_SIZE = 0.24;
const CUBIE_GAP = 0.02;

/**
 * Scene content with HDRI and bloom
 */
const SceneContent: React.FC<{
  state: RubikState;
  lineWidth: number;
  onMove: (move: Move) => void;
  onReset: () => void;
  bloomRef: React.MutableRefObject<VanillaBloomComposer | null>;
  fpsRef: React.MutableRefObject<FPSMonitor | null>;
}> = ({ state, lineWidth, onMove, onReset, bloomRef, fpsRef }) => {
  const { gl, scene, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const gestureRef = useRef<RubikGestureController | null>(null);
  const [hdriLoaded, setHdriLoaded] = useState(false);

  // Load HDRI environment
  useEffect(() => {
    const loader = new RGBELoader();
    loader.load(
      '/hdr/universe.hdr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
        setHdriLoaded(true);
        console.log('[Rubik4] HDRI loaded');
      },
      undefined,
      (error) => {
        console.error('[Rubik4] HDRI load failed:', error);
        // Fallback: dark space gradient
        scene.background = new THREE.Color('#000510');
      }
    );
  }, [scene]);

  // Initialize bloom composer
  useEffect(() => {
    if (!gl || !scene || !camera) return;

    const isMobile = window.innerWidth < 768;
    const composer = new VanillaBloomComposer(gl, scene, camera, {
      strength: isMobile ? 0.4 : 0.6,
      radius: 0.4,
      threshold: 0.85
    });

    bloomRef.current = composer;

    return () => {
      composer.dispose();
      bloomRef.current = null;
    };
  }, [gl, scene, camera, bloomRef]);

  // Initialize FPS monitor
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const monitor = new FPSMonitor({
      targetFPS: isMobile ? 42 : 55,
      sampleDuration: 2,
      onDegrade: () => {
        // Reduce bloom quality
        if (bloomRef.current) {
          bloomRef.current.updateBloom({
            strength: 0.3,
            radius: 0.2
          });
          toast.info('⚡ Qualità ridotta per migliorare le prestazioni');
        }
      }
    });

    fpsRef.current = monitor;

    return () => {
      fpsRef.current = null;
    };
  }, [bloomRef, fpsRef]);

  // Initialize gesture controls
  useEffect(() => {
    if (!gl.domElement || !camera) return;

    const cubies = groupRef.current?.children || [];
    const controller = new RubikGestureController({
      onMove,
      onReset
    });

    controller.attach(gl.domElement, camera, cubies);
    gestureRef.current = controller;

    return () => {
      controller.detach();
      gestureRef.current = null;
    };
  }, [gl.domElement, camera, onMove, onReset]);

  // FPS monitoring + bloom rendering
  useFrame((state, delta) => {
    if (fpsRef.current) {
      fpsRef.current.tick();
    }

    if (bloomRef.current) {
      bloomRef.current.render(delta);
    }
  });

  return (
    <group ref={groupRef}>
      {state.cubies.map((cubie) => (
        <Cubelet
          key={cubie.id}
          cubie={cubie}
          size={CUBIE_SIZE}
          gap={CUBIE_GAP}
          lineWidth={lineWidth}
        />
      ))}
    </group>
  );
};

/**
 * Main Rubik 4x4 Scene Component
 */
export const Rubik4Scene: React.FC = () => {
  const [state, setState] = useState<RubikState | null>(null);
  const [scrambleSeed, setScrambleSeed] = useState('');
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const { reducedMotion } = usePreferences();
  const mountedRef = useRef(true);
  const [showHint, setShowHint] = useState(false);
  const bloomRef = useRef<VanillaBloomComposer | null>(null);
  const fpsRef = useRef<FPSMonitor | null>(null);

  // Load state on mount
  useEffect(() => {
    mountedRef.current = true;

    initializeRubikState()
      .then(({ state: loadedState, scrambleSeed: seed }) => {
        if (mountedRef.current) {
          setState(loadedState);
          setScrambleSeed(seed);
          setLoading(false);

          // Show hint on first visit
          const hintKey = 'rubik4_hint_shown_v2';
          if (!localStorage.getItem(hintKey)) {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 5000);
            localStorage.setItem(hintKey, Date.now().toString());
          }
        }
      })
      .catch((err) => {
        console.error('[Rubik4Scene] Init error:', err);
        setLoading(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-save on state change (including partial progress)
  useEffect(() => {
    if (!state || loading) return;

    const solved = isSolved(state);
    debouncedSave(state, solved, scrambleSeed, 200);

    if (solved) {
      toast.success('🎉 Cubo Risolto!', {
        description: 'Congratulazioni! Hai completato il Rubik 4×4',
        duration: 5000
      });
    }
  }, [state, scrambleSeed, loading]);

  /**
   * Apply a move to the cube
   */
  const handleMove = (move: Move) => {
    if (animating || !state) return;

    setAnimating(true);

    setTimeout(() => {
      const newState = applyMove(state, move);
      setState(newState);
      logMove(move).catch(console.error);
      setAnimating(false);
    }, reducedMotion ? 0 : 220);
  };

  /**
   * Scramble the cube
   */
  const handleScramble = () => {
    if (animating || !state) return;

    setAnimating(true);
    const moves = generateScramble(30);
    const seed = Date.now().toString();

    let newState = state;
    moves.forEach((move) => {
      newState = applyMove(newState, move);
    });

    setTimeout(() => {
      setState(newState);
      setScrambleSeed(seed);
      saveRubikState(newState, false, seed).catch(console.error);
      setAnimating(false);
      toast.info('🔀 Cubo Mescolato', { description: `${moves.length} mosse applicate` });
    }, reducedMotion ? 0 : 300);
  };

  /**
   * Undo last move
   */
  const handleUndo = () => {
    if (animating || !state || state.history.length === 0) return;

    setAnimating(true);
    setTimeout(() => {
      const newState = undoMove(state);
      setState(newState);
      setAnimating(false);
    }, reducedMotion ? 0 : 220);
  };

  /**
   * Reset camera view
   */
  const handleReset = () => {
    toast.info('🔄 Vista resettata');
  };

  // Responsive line width
  const lineWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.2 : 1.6;

  if (loading || !state) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Hint pill */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-full px-4 py-2 text-xs text-cyan-400"
          >
            Trascina faccia per ruotare • Doppio tap reset • Pizzica zoom
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move counter */}
      <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white/80">
        Mosse: {state.history.length}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <motion.button
          onClick={handleUndo}
          disabled={animating || state.history.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-black/80 backdrop-blur-sm border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-cyan-400"
          title="Annulla ultima mossa"
        >
          <Undo2 className="w-5 h-5 text-cyan-400" />
        </motion.button>

        <motion.button
          onClick={handleScramble}
          disabled={animating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-black/80 backdrop-blur-sm border border-purple-500/30 disabled:opacity-30 transition-all hover:border-purple-400"
          title="Mescola cubo"
        >
          <Shuffle className="w-5 h-5 text-purple-400" />
        </motion.button>

        <motion.button
          onClick={handleReset}
          disabled={animating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 disabled:opacity-30 transition-all hover:border-white/40"
          title="Reset vista"
        >
          <RotateCcw className="w-5 h-5 text-white/80" />
        </motion.button>
      </div>

      {/* 3D Canvas with HDRI universe */}
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* Camera with optimal FOV for full cube view */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 6.5]}
          fov={32}
          near={0.1}
          far={1000}
        />

        {/* Orbit controls with limited range */}
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={4}
          maxDistance={12}
          maxPolarAngle={Math.PI * 0.95}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Lighting for wireframe visibility */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#88ffff" />

        {/* Cube with postprocessing */}
        <Suspense fallback={null}>
          <SceneContent
            state={state}
            lineWidth={lineWidth}
            onMove={handleMove}
            onReset={handleReset}
            bloomRef={bloomRef}
            fpsRef={fpsRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
