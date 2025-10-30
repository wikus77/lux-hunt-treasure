/**
 * © 2025 Joseph MULÉ – M1SSION™ – Three.js Helpers for Mind Fractal Lite
 */

import * as THREE from 'three';

export interface SceneSetup {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

export function createSceneSetup(canvas: HTMLCanvasElement): SceneSetup {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x0b1021, 1);

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b1021, 10, 50);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 1.8);
  camera.lookAt(0, 0, 0);

  return { renderer, scene, camera };
}

export function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera
): void {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

export function measureFPS(frameCallback: (fps: number) => void): () => void {
  let frameCount = 0;
  let lastTime = performance.now();
  let rafId: number;

  const tick = () => {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;

    if (elapsed >= 2000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      frameCallback(fps);
      frameCount = 0;
      lastTime = now;
    }

    rafId = requestAnimationFrame(tick);
  };

  tick();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
