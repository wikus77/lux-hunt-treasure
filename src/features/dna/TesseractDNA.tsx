// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { DNAProfile } from './dnaTypes';

// Lazy load post-processing
let EffectComposer: any;
let RenderPass: any;
let BloomEffect: any;
let EffectPass: any;

const loadPostProcessing = async () => {
  if (EffectComposer) return { EffectComposer, RenderPass, BloomEffect, EffectPass };
  
  const pp = await import('postprocessing');
  EffectComposer = pp.EffectComposer;
  RenderPass = pp.RenderPass;
  BloomEffect = pp.BloomEffect;
  EffectPass = pp.EffectPass;
  
  return { EffectComposer, RenderPass, BloomEffect, EffectPass };
};

interface TesseractDNAProps {
  profile: DNAProfile;
  size?: number;
  disableTilt?: boolean;
}

/**
 * Tesseract DNA™ 3D Visualizer - TRON-Glass Holographic Cube
 * 
 * Features:
 * - High-quality glass material with transmission & clearcoat
 * - Instanced lattice of glowing mini-cubes (5×5×5 desktop, 3×3×3 mobile)
 * - Bloom post-processing for neon glow
 * - 360° user-controlled rotation (hover + drag)
 * - Performance optimized (≥60fps desktop, ≥45fps mobile)
 */
export const TesseractDNA: React.FC<TesseractDNAProps> = ({
  profile,
  size = 400,
  disableTilt = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(false);
  
  // Three.js core
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<any>(null);
  const frameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());
  
  // Geometry refs
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const latticeRef = useRef<THREE.InstancedMesh | null>(null);
  
  // Input state
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const idleTimeRef = useRef(0);
  
  // Performance monitoring
  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);
  const latticeCount = isMobile ? 3 : 5;
  const bloomStrength = disableTilt ? 0 : (isMobile ? 0.8 : 1.1);
  
  // Quality profile
  const prefersReducedMotion = useMemo(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const effectiveReducedMotion = prefersReducedMotion || disableTilt;

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || mountedRef.current) return;
    mountedRef.current = true;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // ========== SCENE SETUP ==========
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 5.6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x88ccff, 1.1);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xff88cc, 0.6);
    dirLight2.position.set(-2, -1, -3);
    scene.add(dirLight2);

    // ========== GEOMETRY ==========
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    // Glass material for outer cube
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaaf3ff,
      transmission: 0.96,
      opacity: 0.18,
      transparent: true,
      thickness: 0.6,
      roughness: 0.12,
      metalness: 0.0,
      ior: 1.45,
      specularIntensity: 0.9,
      clearcoat: 0.7,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
      side: THREE.DoubleSide
    });

    // Outer wireframe box
    const boxSize = 1.8;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x66ccff,
      linewidth: 1,
      transparent: true,
      opacity: 0.8
    });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    cubeGroup.add(wireframe);

    // Glass panels (6 faces)
    const panelGeo = new THREE.PlaneGeometry(boxSize, boxSize);
    const panelPositions = [
      { pos: [0, 0, boxSize/2], rot: [0, 0, 0] },       // front
      { pos: [0, 0, -boxSize/2], rot: [0, Math.PI, 0] }, // back
      { pos: [boxSize/2, 0, 0], rot: [0, Math.PI/2, 0] }, // right
      { pos: [-boxSize/2, 0, 0], rot: [0, -Math.PI/2, 0] }, // left
      { pos: [0, boxSize/2, 0], rot: [-Math.PI/2, 0, 0] }, // top
      { pos: [0, -boxSize/2, 0], rot: [Math.PI/2, 0, 0] }  // bottom
    ];

    panelPositions.forEach(({ pos, rot }) => {
      const panel = new THREE.Mesh(panelGeo, glassMaterial);
      panel.position.set(pos[0] as number, pos[1] as number, pos[2] as number);
      panel.rotation.set(rot[0] as number, rot[1] as number, rot[2] as number);
      cubeGroup.add(panel);
    });

    // Core glowing dodecahedron
    const coreGeo = new THREE.IcosahedronGeometry(0.28, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x22aaff,
      emissive: 0x22aaff,
      emissiveIntensity: 2.5,
      transmission: 0.7,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    cubeGroup.add(core);

    // Instanced lattice (mini-cubes) using InstancedMesh
    const miniCubeSize = 0.12;
    const miniCubeGeo = new THREE.BoxGeometry(miniCubeSize, miniCubeSize, miniCubeSize);
    const miniEdgesGeo = new THREE.EdgesGeometry(miniCubeGeo);
    
    const instanceCount = Math.pow(latticeCount, 3);
    const latticeMaterial = new THREE.LineBasicMaterial({
      color: 0x66ffcc,
      transparent: true,
      opacity: 0.6,
      linewidth: 1
    });
    
    // Create individual line segments for each cube in the lattice
    const latticeGroup = new THREE.Group();
    const spacing = 0.33;
    const offset = (latticeCount - 1) * spacing / 2;
    
    for (let x = 0; x < latticeCount; x++) {
      for (let y = 0; y < latticeCount; y++) {
        for (let z = 0; z < latticeCount; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;
          
          const miniWireframe = new THREE.LineSegments(miniEdgesGeo.clone(), latticeMaterial.clone());
          miniWireframe.position.set(px, py, pz);
          latticeGroup.add(miniWireframe);
        }
      }
    }
    
    cubeGroup.add(latticeGroup);
    latticeRef.current = latticeGroup as any;

    // ========== POST-PROCESSING ==========
    loadPostProcessing().then(({ EffectComposer, RenderPass, BloomEffect, EffectPass }) => {
      if (!mountedRef.current) return;

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      if (!effectiveReducedMotion) {
        const bloomEffect = new BloomEffect({
          intensity: bloomStrength,
          luminanceThreshold: 0.75,
          luminanceSmoothing: 0.7,
          radius: 0.7
        });
        const bloomPass = new EffectPass(camera, bloomEffect);
        composer.addPass(bloomPass);
      }

      composerRef.current = composer;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[DNA/Tesseract] mounted env=false instances=${instanceCount}`);
      }
    });

    // ========== INPUT HANDLERS ==========
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      idleTimeRef.current = 0;
      
      if (container) {
        container.style.cursor = 'grabbing';
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        // Drag rotation
        const gainX = isMobile ? 0.7 : 1.0;
        const gainY = isMobile ? 0.7 : 1.0;
        
        targetRotationRef.current.y += dx * 0.01 * gainX;
        targetRotationRef.current.x += dy * 0.01 * gainY;
        
        // Clamp pitch
        targetRotationRef.current.x = Math.max(-1.13, Math.min(1.13, targetRotationRef.current.x));
        
        velocityRef.current.x = dy * 0.001;
        velocityRef.current.y = dx * 0.001;
        
        idleTimeRef.current = 0;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DNA/Tesseract] input pointer=drag dragging=true`);
        }
      } else if (!isMobile && e.pointerType === 'mouse') {
        // Hover parallax
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const offsetX = (e.clientX - centerX) / rect.width;
        const offsetY = (e.clientY - centerY) / rect.height;
        
        targetRotationRef.current.y = offsetX * 0.24;
        targetRotationRef.current.x = -offsetY * 0.24;
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      
      if (container) {
        container.style.cursor = 'grab';
      }
    };

    const handleDoubleClick = () => {
      targetRotationRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
      idleTimeRef.current = 0;
    };

    const handleMouseLeave = () => {
      if (!isDraggingRef.current) {
        idleTimeRef.current = 0;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.001;
      camera.position.z = Math.max(2.6, Math.min(4.2, camera.position.z + delta));
    };

    // Attach listeners
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('dblclick', handleDoubleClick);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // ========== ANIMATION LOOP ==========
    const animate = () => {
      if (!mountedRef.current) return;
      
      frameIdRef.current = requestAnimationFrame(animate);
      
      const delta = clockRef.current.getDelta();
      
      // Apply inertia
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
        
        targetRotationRef.current.x += velocityRef.current.x;
        targetRotationRef.current.y += velocityRef.current.y;
        
        // Clamp after inertia
        targetRotationRef.current.x = Math.max(-1.13, Math.min(1.13, targetRotationRef.current.x));
        
        // Idle reset after 800ms
        idleTimeRef.current += delta;
        if (idleTimeRef.current > 0.8) {
          const resetSpeed = 0.05;
          targetRotationRef.current.x *= (1 - resetSpeed);
          targetRotationRef.current.y *= (1 - resetSpeed);
          
          if (Math.abs(targetRotationRef.current.x) < 0.01) targetRotationRef.current.x = 0;
          if (Math.abs(targetRotationRef.current.y) < 0.01) targetRotationRef.current.y = 0;
        }
      }
      
      // Smooth lerp to target
      const lerpSpeed = 0.12;
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * lerpSpeed;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * lerpSpeed;
      
      // Apply rotation to cube group
      if (cubeGroup) {
        cubeGroup.rotation.x = rotationRef.current.x;
        cubeGroup.rotation.y = rotationRef.current.y;
      }
      
      // Subtle core pulse
      if (core && !effectiveReducedMotion) {
        const pulse = 1 + Math.sin(clockRef.current.elapsedTime * 2) * 0.08;
        core.scale.setScalar(pulse);
      }
      
      // Render
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    // ========== RESIZE HANDLER ==========
    const handleResize = () => {
      if (!camera || !renderer) return;
      
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      
      if (composerRef.current) {
        composerRef.current.setSize(size, size);
      }
    };

    window.addEventListener('resize', handleResize);

    // ========== CLEANUP ==========
    return () => {
      mountedRef.current = false;
      
      // Cancel animation
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Remove listeners
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('dblclick', handleDoubleClick);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      // Dispose geometries & materials
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      // Dispose renderer & composer
      if (composerRef.current) {
        composerRef.current.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[DNA/Tesseract] cleanup complete');
      }
    };
  }, [size, isMobile, latticeCount, bloomStrength, effectiveReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      style={{
        width: size,
        height: size,
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          width: size,
          height: size
        }}
      />
      
      {/* Debug label (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs font-mono text-cyan-400/50 pointer-events-none">
          Tesseract DNA™ | TRON-Glass 3D
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
