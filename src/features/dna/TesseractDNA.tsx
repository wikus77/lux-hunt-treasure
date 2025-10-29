// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { DNAProfile } from './dnaTypes';

// Lazy load post-processing
let EffectComposer: any;
let RenderPass: any;
let BloomEffect: any;
let ChromaticAberrationEffect: any;
let EffectPass: any;

const loadPostProcessing = async () => {
  if (EffectComposer) return { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass };
  
  const pp = await import('postprocessing');
  EffectComposer = pp.EffectComposer;
  RenderPass = pp.RenderPass;
  BloomEffect = pp.BloomEffect;
  ChromaticAberrationEffect = pp.ChromaticAberrationEffect;
  EffectPass = pp.EffectPass;
  
  return { EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass };
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
  const latticeCount = isMobile ? 4 : 6; // Dense lattice for "infinite cube" effect
  const bloomStrength = disableTilt ? 0 : (isMobile ? 0.9 : 1.2);
  
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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false; // Optimize
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

    // Premium glass material matching reference images
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd0f4ff,
      transmission: 1.0,
      opacity: 0.08,
      transparent: true,
      thickness: 0.5,
      roughness: 0.05,
      metalness: 0.0,
      ior: 1.52,
      specularIntensity: 1.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.8,
      attenuationColor: new THREE.Color(0x6ffcff),
      attenuationDistance: 1.4,
      side: THREE.DoubleSide,
      reflectivity: 0.95
    });

    // Iridescent wireframe edges (gradient colors for prismatic effect)
    const boxSize = 1.85;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    
    // Create gradient color array for iridescence (cyan→lime→magenta→violet)
    const iridColors = [
      new THREE.Color(0x00ffff), // cyan
      new THREE.Color(0x66ff66), // lime
      new THREE.Color(0xff66ff), // magenta
      new THREE.Color(0xaa66ff)  // violet
    ];
    
    // Multi-layer edges for glow effect
    [1.0, 0.7, 0.4].forEach((opacity, layer) => {
      const edgesMat = new THREE.LineBasicMaterial({
        color: iridColors[layer % iridColors.length],
        linewidth: 1 + layer,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending
      });
      const wireframe = new THREE.LineSegments(edgesGeo.clone(), edgesMat);
      cubeGroup.add(wireframe);
    });

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

    // Glowing prismatic core with rainbow effect
    const coreGeo = new THREE.IcosahedronGeometry(0.32, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xff88ff,
      emissiveIntensity: 3.2,
      transmission: 0.6,
      opacity: 0.95,
      transparent: true,
      roughness: 0.05,
      metalness: 0.15,
      clearcoat: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    cubeGroup.add(core);

    // Dense instanced lattice (mini-cubes) - "infinite cube" effect from reference
    const miniCubeSize = 0.14;
    const miniCubeGeo = new THREE.BoxGeometry(miniCubeSize, miniCubeSize, miniCubeSize);
    const miniEdgesGeo = new THREE.EdgesGeometry(miniCubeGeo);
    
    const instanceCount = Math.pow(latticeCount, 3);
    
    // Create iridescent gradient colors for lattice depth
    const getDepthColor = (x: number, y: number, z: number) => {
      const dist = Math.sqrt(x*x + y*y + z*z) / (latticeCount * 0.5);
      const hue = (dist * 0.3 + clockRef.current.getElapsedTime() * 0.05) % 1.0;
      return new THREE.Color().setHSL(hue * 0.2 + 0.45, 0.8, 0.6);
    };
    
    // Create lattice grid with gradient colors
    const latticeGroup = new THREE.Group();
    const spacing = 0.28;
    const offset = (latticeCount - 1) * spacing / 2;
    
    for (let x = 0; x < latticeCount; x++) {
      for (let y = 0; y < latticeCount; y++) {
        for (let z = 0; z < latticeCount; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;
          
          // Determine color based on position
          const color = getDepthColor(px, py, pz);
          
          // Calculate distance from center for opacity
          const distFromCenter = Math.sqrt(px*px + py*py + pz*pz);
          const maxDist = Math.sqrt(3 * Math.pow(offset, 2));
          const opacity = 0.4 + (1 - distFromCenter / maxDist) * 0.5;
          
          const latticeMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            linewidth: 1,
            blending: THREE.AdditiveBlending
          });
          
          const miniWireframe = new THREE.LineSegments(miniEdgesGeo.clone(), latticeMaterial);
          miniWireframe.position.set(px, py, pz);
          
          // Add micro-jitter for shimmer
          miniWireframe.rotation.x = Math.random() * 0.01;
          miniWireframe.rotation.y = Math.random() * 0.01;
          miniWireframe.rotation.z = Math.random() * 0.01;
          
          latticeGroup.add(miniWireframe);
        }
      }
    }
    
    cubeGroup.add(latticeGroup);
    latticeRef.current = latticeGroup as any;

    // ========== POST-PROCESSING (Bloom + Chromatic Aberration) ==========
    loadPostProcessing().then(({ EffectComposer, RenderPass, BloomEffect, ChromaticAberrationEffect, EffectPass }) => {
      if (!mountedRef.current) return;

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      if (!effectiveReducedMotion) {
        // High-quality bloom for neon glow
        const bloomEffect = new BloomEffect({
          intensity: bloomStrength,
          luminanceThreshold: 0.2,
          luminanceSmoothing: 0.85,
          radius: 0.75,
          mipmapBlur: true
        });
        
        // Subtle chromatic aberration for glass optical effect
        const chromaticEffect = new ChromaticAberrationEffect({
          offset: new THREE.Vector2(0.0025, 0.0025)
        });
        
        const effectPass = new EffectPass(camera, bloomEffect, chromaticEffect);
        composer.addPass(effectPass);
      }

      composerRef.current = composer;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[DNA/Tesseract] mounted env=false instances=${instanceCount} lattice=${latticeCount}³`);
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
      
      // Prismatic core pulse with color shift
      if (core && !effectiveReducedMotion) {
        const pulse = 1 + Math.sin(clockRef.current.elapsedTime * 2.2) * 0.12;
        core.scale.setScalar(pulse);
        
        // Rainbow color shift on core
        const hue = (clockRef.current.elapsedTime * 0.15) % 1.0;
        coreMat.emissive.setHSL(hue * 0.3 + 0.7, 0.9, 0.5);
      }
      
      // Subtle lattice shimmer
      if (latticeGroup && !effectiveReducedMotion) {
        latticeGroup.children.forEach((child: any, i) => {
          if (child.material && child.material.opacity) {
            const shimmer = Math.sin(clockRef.current.elapsedTime * 3 + i * 0.1) * 0.08;
            child.material.opacity = Math.max(0.3, Math.min(0.9, child.material.opacity + shimmer * 0.01));
          }
        });
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
          Tesseract DNA™ | TRON-Glass PRO | {latticeCount}³ lattice
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
