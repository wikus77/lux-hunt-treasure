// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Lazy load postprocessing modules
let EffectComposer: any;
let RenderPass: any;
let EffectPass: any;

const loadPostProcessing = async () => {
  if (EffectComposer) return { EffectComposer, RenderPass, EffectPass };
  
  const pp = await import('postprocessing');
  EffectComposer = pp.EffectComposer;
  RenderPass = pp.RenderPass;
  EffectPass = pp.EffectPass;
  
  return { EffectComposer, RenderPass, EffectPass };
};

interface EffectConfig {
  bloom?: any;
  chroma?: any;
  smaa?: any;
}

/**
 * Stable Composer Hook - manages EffectComposer lifecycle with proper pass separation
 * Rebuilds composer when renderer/scene/camera change or on context restore
 * Ensures no undefined passes reach the composer
 */
export function useStableComposer(
  renderer: THREE.WebGLRenderer | null,
  scene: THREE.Scene | null,
  camera: THREE.Camera | null,
  effects: EffectConfig
) {
  const composerRef = useRef<any>(null);
  const isBuilding = useRef(false);

  // Rebuild composer with all passes
  const rebuild = async () => {
    if (isBuilding.current) return;
    if (!renderer || !scene || !camera) {
      console.warn('⚠️ [DNA Composer] Missing dependencies, skipping build');
      return;
    }

    isBuilding.current = true;

    try {
      // Load postprocessing library
      await loadPostProcessing();

      // Dispose old composer
      if (composerRef.current) {
        try {
          composerRef.current.dispose?.();
        } catch (e) {
          console.warn('⚠️ [DNA Composer] Error disposing old composer:', e);
        }
      }

      // Create new composer
      composerRef.current = new EffectComposer(renderer);

      // CRITICAL: RenderPass MUST be first and have valid scene + camera
      const renderPass = new RenderPass(scene, camera);
      composerRef.current.addPass(renderPass);

      // Add Bloom pass (convolution effect, MUST be separate)
      if (effects.bloom) {
        const bloomPass = new EffectPass(camera, effects.bloom);
        composerRef.current.addPass(bloomPass);
      }

      // Add ChromaticAberration pass (convolution effect, MUST be separate)
      if (effects.chroma) {
        const chromaPass = new EffectPass(camera, effects.chroma);
        composerRef.current.addPass(chromaPass);
      }

      // Add SMAA pass (can be combined with other non-convolution effects)
      if (effects.smaa) {
        const smaaPass = new EffectPass(camera, effects.smaa);
        composerRef.current.addPass(smaaPass);
      }

      console.log('🟢 DNA Composer ready (vanilla) - stable rebuild');
    } catch (error) {
      console.error('🔴 [DNA Composer] Build failed:', error);
      composerRef.current = null;
    } finally {
      isBuilding.current = false;
    }
  };

  // Rebuild when dependencies change
  useEffect(() => {
    rebuild();
  }, [renderer, scene, camera, effects.bloom, effects.chroma, effects.smaa]);

  // Handle resize and context restore
  useEffect(() => {
    if (!renderer) return;

    const handleResize = () => {
      if (!composerRef.current) return;
      
      const canvas = renderer.domElement;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      
      try {
        composerRef.current.setSize(width, height, false);
      } catch (error) {
        console.warn('⚠️ [DNA Composer] Resize failed:', error);
      }
    };

    const handleContextRestore = () => {
      console.log('🔄 [DNA Composer] Context restored, rebuilding...');
      rebuild();
    };

    window.addEventListener('resize', handleResize);
    
    const context = renderer.getContext();
    if (context?.canvas) {
      context.canvas.addEventListener('webglcontextrestored', handleContextRestore);
    }

    // Initial resize
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (context?.canvas) {
        context.canvas.removeEventListener('webglcontextrestored', handleContextRestore);
      }
      
      // Cleanup
      if (composerRef.current) {
        try {
          composerRef.current.dispose?.();
        } catch (e) {
          console.warn('⚠️ [DNA Composer] Cleanup error:', e);
        }
        composerRef.current = null;
      }
    };
  }, [renderer]);

  return composerRef;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
