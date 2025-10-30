// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'postprocessing';
import { RenderPass } from 'postprocessing';
import { EffectPass } from 'postprocessing';
import { BloomEffect } from 'postprocessing';
import { VignetteEffect } from 'postprocessing';

interface DNAComposerVanillaProps {
  enabled?: boolean;
  bloom?: number;
  vignette?: number;
}

export function DNAComposerVanilla({ 
  enabled = true, 
  bloom = 0.8, 
  vignette = 0.2 
}: DNAComposerVanillaProps) {
  const composerRef = useRef<EffectComposer | null>(null);
  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    if (!enabled) {
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      return;
    }

    const composer = new EffectComposer(gl);
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const effects = [
      new BloomEffect({ 
        intensity: bloom,
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.9
      }),
      new VignetteEffect({ 
        eskil: false, 
        offset: 0.35, 
        darkness: vignette 
      })
    ].filter(Boolean);

    if (effects.length > 0) {
      composer.addPass(new EffectPass(camera, ...effects));
    }

    composer.setSize(size.width, size.height);

    return () => {
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
    };
  }, [gl, scene, camera, size.width, size.height, enabled, bloom, vignette]);

  useFrame((_, delta) => {
    if (composerRef.current && enabled) {
      composerRef.current.render(delta);
    }
  }, 1);

  return null;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
