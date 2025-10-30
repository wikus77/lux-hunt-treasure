/**
 * Vanilla Three.js Postprocessing - Bloom Effect
 * No @react-three/postprocessing dependency
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export interface BloomConfig {
  strength: number;
  radius: number;
  threshold: number;
}

export class VanillaBloomComposer {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: BloomConfig = { strength: 0.6, radius: 0.4, threshold: 0.85 }
  ) {
    // Create composer
    this.composer = new EffectComposer(renderer);
    
    // Render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom pass
    const size = new THREE.Vector2();
    renderer.getSize(size);
    this.bloomPass = new UnrealBloomPass(size, config.strength, config.radius, config.threshold);
    this.composer.addPass(this.bloomPass);
  }

  /**
   * Render the composed scene
   */
  render(delta?: number) {
    this.composer.render(delta);
  }

  /**
   * Update size on window resize
   */
  setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  /**
   * Update bloom parameters
   */
  updateBloom(config: Partial<BloomConfig>) {
    if (config.strength !== undefined) this.bloomPass.strength = config.strength;
    if (config.radius !== undefined) this.bloomPass.radius = config.radius;
    if (config.threshold !== undefined) this.bloomPass.threshold = config.threshold;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.composer.dispose();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
