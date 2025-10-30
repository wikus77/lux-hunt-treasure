/**
 * Rubik's Cube 4×4 Neon Wireframe Scene
 * Main 3D scene with camera, lighting, and cube rendering
 */

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Cubelet } from './Rubik4Meshes';
import { initializeRubikState, saveRubikState, logMove, debouncedSave } from './state';
import { applyMove, generateScramble, isSolved, undoMove } from './Rubik4Core';
import { usePreferences } from '@/hooks/usePreferences';
import type { RubikState, Move } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import * as THREE from 'three';

const CUBIE_SIZE = 0.24;
const CUBIE_GAP = 0.02;

export const Rubik4Scene: React.FC = () => {
  const [state, setState] = useState<RubikState | null>(null);
  const [scrambleSeed, setScrambleSeed] = useState('');
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const { reducedMotion } = usePreferences();
  const mountedRef = useRef(true);
  const [showHint, setShowHint] = useState(false);

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
          const hintKey = 'rubik4_hint_shown';
          if (!localStorage.getItem(hintKey)) {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 6000);
            localStorage.setItem(hintKey, Date.now().toString());
          }
        }
      })
      .catch(err => {
        console.error('[Rubik4Scene] Init error:', err);
        setLoading(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-save on state change
  useEffect(() => {
    if (!state || loading) return;
    
    const solved = isSolved(state);
    debouncedSave(state, solved, scrambleSeed);

    if (solved) {
      toast.success('🎉 Cubo Risolto!', {
        description: 'Congratulazioni! Hai completato il Rubik 4×4'
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
    moves.forEach(move => {
      newState = applyMove(newState, move);
    });

    setTimeout(() => {
      setState(newState);
      setScrambleSeed(seed);
      saveRubikState(newState, false, seed).catch(console.error);
      setAnimating(false);
      toast.info('Cubo Mescolato', { description: `${moves.length} mosse applicate` });
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

  if (loading || !state) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const lineWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.2 : 1.6;

  return (
    <div className="relative w-full h-full">
      {/* Hint pill */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-xs text-muted-foreground"
          >
            Trascina • Pizzica • Doppio tap reset
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <motion.button
          onClick={handleUndo}
          disabled={animating || state.history.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5 text-foreground" />
        </motion.button>

        <motion.button
          onClick={handleScramble}
          disabled={animating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border disabled:opacity-50"
        >
          <Shuffle className="w-5 h-5 text-foreground" />
        </motion.button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)'
        }}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 6]}
          fov={35}
          near={0.1}
          far={100}
        />

        {/* Orbit controls */}
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3}
          maxDistance={12}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6ffcff" />

        {/* Cube */}
        <Suspense fallback={null}>
          <group>
            {state.cubies.map(cubie => (
              <Cubelet
                key={cubie.id}
                cubie={cubie}
                size={CUBIE_SIZE}
                gap={CUBIE_GAP}
                lineWidth={lineWidth}
              />
            ))}
          </group>
        </Suspense>

        {/* HDRI environment would go here */}
      </Canvas>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
