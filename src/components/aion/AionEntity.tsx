// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AION Entity - 3D Reactive Blob with Three.js

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';

// Viseme palette (HSL)
const PALETTE: Record<string, { h: number; s: number; l: number }> = {
  A: { h: 350, s: 85, l: 60 }, // Magenta caldo
  E: { h: 280, s: 70, l: 65 }, // Viola
  I: { h: 200, s: 80, l: 60 }, // Ciano
  O: { h: 20, s: 90, l: 65 },  // Arancio
  U: { h: 160, s: 75, l: 60 }, // Verde acqua
  M: { h: 330, s: 60, l: 55 }, // Rosa scuro
  X: { h: 210, s: 25, l: 12 }, // Idle (blu profondo)
};

export type Viseme = { t: number; v: string };

export interface AionEntityHandle {
  play(visemes: Viseme[], opts?: { durationMs?: number }): void;
  stop(): void;
  idle(): void;
}

interface AionEntityProps {
  className?: string;
  intensity?: number;
  idleSpeed?: number;
}

// Simplex noise implementation
const simplex3D = (x: number, y: number, z: number): number => {
  const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  const perm = [...p, ...p];
  
  const F3 = 1.0 / 3.0;
  const G3 = 1.0 / 6.0;
  
  let s = (x + y + z) * F3;
  let i = Math.floor(x + s);
  let j = Math.floor(y + s);
  let k = Math.floor(z + s);
  
  let t = (i + j + k) * G3;
  let X0 = i - t;
  let Y0 = j - t;
  let Z0 = k - t;
  let x0 = x - X0;
  let y0 = y - Y0;
  let z0 = z - Z0;
  
  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
    else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
    else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
  } else {
    if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
    else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
  }
  
  let x1 = x0 - i1 + G3;
  let y1 = y0 - j1 + G3;
  let z1 = z0 - k1 + G3;
  let x2 = x0 - i2 + 2.0 * G3;
  let y2 = y0 - j2 + 2.0 * G3;
  let z2 = z0 - k2 + 2.0 * G3;
  let x3 = x0 - 1.0 + 3.0 * G3;
  let y3 = y0 - 1.0 + 3.0 * G3;
  let z3 = z0 - 1.0 + 3.0 * G3;
  
  let ii = i & 255;
  let jj = j & 255;
  let kk = k & 255;
  
  const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  
  const dot3 = (g: number[], x: number, y: number, z: number) => g[0]*x + g[1]*y + g[2]*z;
  
  let gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
  let gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
  let gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
  let gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;
  
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
  
  let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
  if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot3(grad3[gi0], x0, y0, z0); }
  
  let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
  if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot3(grad3[gi1], x1, y1, z1); }
  
  let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
  if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot3(grad3[gi2], x2, y2, z2); }
  
  let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
  if (t3 >= 0) { t3 *= t3; n3 = t3 * t3 * dot3(grad3[gi3], x3, y3, z3); }
  
  return 32.0 * (n0 + n1 + n2 + n3);
};

const AionEntity = forwardRef<AionEntityHandle, AionEntityProps>(({
  className = '',
  intensity = 1.0,
  idleSpeed = 0.7
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  
  const [currentColor, setCurrentColor] = useState(PALETTE.X);
  const [isPlaying, setIsPlaying] = useState(false);
  const visemeQueueRef = useRef<Viseme[]>([]);
  const playStartTimeRef = useRef(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Geometry - Icosahedron with detail
    const geometry = new THREE.IcosahedronGeometry(1.2, 8);
    
    // Store original positions for noise deformation
    const originalPositions = geometry.attributes.position.array.slice();

    // Material - Custom shader-like effect with MeshStandardMaterial
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`hsl(${PALETTE.X.h}, ${PALETTE.X.s}%, ${PALETTE.X.l}%)`),
      emissive: new THREE.Color(`hsl(${PALETTE.X.h}, ${PALETTE.X.s}%, ${PALETTE.X.l * 0.3}%)`),
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.7,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf213a4, 0.8, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation loop
    const animate = () => {
      timeRef.current += 0.01 * idleSpeed;
      const time = timeRef.current;

      if (meshRef.current) {
        // Rotate mesh
        meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
        meshRef.current.rotation.y += 0.005;

        // Deform geometry with noise
        const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];
          
          const noise = simplex3D(
            ox * 2 + time,
            oy * 2 + time * 0.5,
            oz * 2 + time * 0.3
          ) * 0.15 * intensity;
          
          const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
          const scale = 1 + noise;
          
          positions[i] = (ox / len) * len * scale;
          positions[i + 1] = (oy / len) * len * scale;
          positions[i + 2] = (oz / len) * len * scale;
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;

        // Update material color based on current viseme
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        const targetColor = new THREE.Color(
          `hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%)`
        );
        mat.color.lerp(targetColor, 0.1);
        mat.emissive.lerp(
          new THREE.Color(`hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l * 0.4}%)`),
          0.1
        );
      }

      // Process viseme queue
      if (isPlaying && visemeQueueRef.current.length > 0) {
        const elapsed = Date.now() - playStartTimeRef.current;
        const currentViseme = visemeQueueRef.current.find(v => v.t <= elapsed);
        if (currentViseme) {
          const palette = PALETTE[currentViseme.v.toUpperCase()] || PALETTE.X;
          setCurrentColor(palette);
          visemeQueueRef.current = visemeQueueRef.current.filter(v => v.t > elapsed);
        }
        if (visemeQueueRef.current.length === 0) {
          setIsPlaying(false);
          setCurrentColor(PALETTE.X);
        }
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [intensity, idleSpeed]);

  // Expose API
  useImperativeHandle(ref, () => ({
    play(visemes: Viseme[], opts?: { durationMs?: number }) {
      visemeQueueRef.current = [...visemes].sort((a, b) => a.t - b.t);
      playStartTimeRef.current = Date.now();
      setIsPlaying(true);
    },
    stop() {
      visemeQueueRef.current = [];
      setIsPlaying(false);
      setCurrentColor(PALETTE.X);
    },
    idle() {
      visemeQueueRef.current = [];
      setIsPlaying(false);
      setCurrentColor(PALETTE.X);
    }
  }));

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '280px' }}
    />
  );
});

AionEntity.displayName = 'AionEntity';

export default AionEntity;

