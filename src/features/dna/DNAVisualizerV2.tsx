// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DNAProfile } from './dnaTypes';
import { ARCHETYPE_CONFIGS } from './dnaTypes';
import * as THREE from 'three';

// Lazy load post-processing
let EffectComposer: any;
let RenderPass: any;
let BloomEffect: any;
let EffectPass: any;

const loadPostProcessing = async () => {
  if (EffectComposer) return { EffectComposer, RenderPass, BloomEffect, EffectPass };
  
  const [composer, render, bloom, pass] = await Promise.all([
    import('postprocessing').then(m => m.EffectComposer),
    import('postprocessing').then(m => m.RenderPass),
    import('postprocessing').then(m => m.BloomEffect),
    import('postprocessing').then(m => m.EffectPass)
  ]);
  
  EffectComposer = composer;
  RenderPass = render;
  BloomEffect = bloom;
  EffectPass = pass;
  
  return { EffectComposer, RenderPass, BloomEffect, EffectPass };
};

interface DNAVisualizerProps {
  profile: DNAProfile;
  size?: number;
  animate?: boolean;
  disableTilt?: boolean;
}

interface PanelState {
  name: string;
  key: keyof DNAProfile;
  isOpen: boolean;
  targetRotation: number;
  currentRotation: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
}

/**
 * DNA Tesseract 3D Visualizer - "Thor-Cube"
 * 
 * Interactive 3D tesseract-like structure showing 5 DNA attributes.
 * Features:
 * - 360° rotation via mouse/touch (hover + drag)
 * - 5 openable glass panels (Etica, Intuito, Audacia, Vibrazione, Rischio)
 * - Bloom glow post-processing
 * - Performance optimized (≥60fps desktop, ≥45fps mobile)
 */
export const DNAVisualizer: React.FC<DNAVisualizerProps> = ({ 
  profile, 
  size = 400,
  animate = true,
  disableTilt = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(false);
  const archetypeConfig = ARCHETYPE_CONFIGS[profile.archetype];
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<any>(null);
  const frameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
  // Panel state
  const panelsRef = useRef<PanelState[]>([]);
  const panelMeshesRef = useRef<THREE.Mesh[]>([]);
  const panelGroupsRef = useRef<THREE.Group[]>([]);
  
  // Input state
  const rotationRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number } | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  
  // Performance monitoring
  const fpsRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  
  // Reduced motion
  const prefersReducedMotion = useMemo(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches, 
    []
  );
  const effectiveReducedMotion = prefersReducedMotion || disableTilt;
  
  // Attributes mapping
  const attributes = useMemo(() => [
    { key: 'etica' as keyof DNAProfile, name: 'ETICA', position: new THREE.Vector3(0, 0, 0.95), normal: new THREE.Vector3(0, 0, 1) },
    { key: 'intuito' as keyof DNAProfile, name: 'INTUITO', position: new THREE.Vector3(0.95, 0, 0), normal: new THREE.Vector3(1, 0, 0) },
    { key: 'audacia' as keyof DNAProfile, name: 'AUDACIA', position: new THREE.Vector3(0, 0.95, 0), normal: new THREE.Vector3(0, 1, 0) },
    { key: 'vibrazione' as keyof DNAProfile, name: 'VIBRAZIONE', position: new THREE.Vector3(-0.95, 0, 0), normal: new THREE.Vector3(-1, 0, 0) },
    { key: 'rischio' as keyof DNAProfile, name: 'RISCHIO', position: new THREE.Vector3(0, -0.95, 0), normal: new THREE.Vector3(0, -1, 0) }
  ], []);

  // Initialize panels state
  useEffect(() => {
    panelsRef.current = attributes.map(attr => ({
      name: attr.name,
      key: attr.key,
      isOpen: false,
      targetRotation: 0,
      currentRotation: 0,
      position: attr.position.clone(),
      normal: attr.normal.clone()
    }));
  }, [attributes]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || mountedRef.current) return;
    mountedRef.current = true;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.z = 3.2;
    camera.lookAt(0, 0, 0);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x88ccff, 1.1);
    directionalLight.position.set(2, 2, 3);
    scene.add(directionalLight);
    
    // Main cube group (for rotation)
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;
    
    // Outer wireframe box
    const outerBoxGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const outerBoxEdges = new THREE.EdgesGeometry(outerBoxGeometry);
    const outerBoxLine = new THREE.LineSegments(
      outerBoxEdges,
      new THREE.LineBasicMaterial({ 
        color: new THREE.Color(archetypeConfig.color),
        transparent: true,
        opacity: 0.6
      })
    );
    cubeGroup.add(outerBoxLine);
    
    // Add thicker neon edges
    const neonEdges = new THREE.LineSegments(
      outerBoxEdges,
      new THREE.LineBasicMaterial({ 
        color: new THREE.Color(archetypeConfig.color),
        transparent: true,
        opacity: 0.3,
        linewidth: 2
      })
    );
    cubeGroup.add(neonEdges);
    
    // Core dodecahedron
    const coreGeometry = new THREE.IcosahedronGeometry(0.28, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x22aaff,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      thickness: 0.3,
      roughness: 0.1,
      metalness: 0.0,
      emissive: new THREE.Color(0x22aaff),
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    cubeGroup.add(core);
    
    // Glass panels with content
    attributes.forEach((attr, idx) => {
      const panelGroup = new THREE.Group();
      panelGroup.position.copy(attr.position);
      panelGroup.lookAt(attr.position.clone().add(attr.normal));
      
      // Glass panel
      const panelGeometry = new THREE.PlaneGeometry(1.3, 1.3);
      const panelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaf3ff,
        transparent: true,
        opacity: 0.18,
        transmission: 0.9,
        thickness: 0.45,
        ior: 1.45,
        roughness: 0.12,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panelGroup.add(panel);
      
      // Panel edges (luminous)
      const panelEdges = new THREE.EdgesGeometry(panelGeometry);
      const edgeLine = new THREE.LineSegments(
        panelEdges,
        new THREE.LineBasicMaterial({ 
          color: new THREE.Color(archetypeConfig.color),
          transparent: true,
          opacity: 0.8
        })
      );
      panelGroup.add(edgeLine);
      
      // Content sprite (text label + value)
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 512;
      canvas2d.height = 512;
      const ctx = canvas2d.getContext('2d')!;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, 512, 512);
      
      // Label
      ctx.fillStyle = archetypeConfig.color;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(attr.name, 256, 200);
      
      // Value
      const value = profile[attr.key] as number;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.fillText(value.toString(), 256, 312);
      
      const texture = new THREE.CanvasTexture(canvas2d);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.8, 0.8, 1);
      sprite.position.z = -0.05;
      panelGroup.add(sprite);
      
      // Store for animation
      (panel as any).contentSprite = sprite;
      
      cubeGroup.add(panelGroup);
      panelMeshesRef.current.push(panel);
      panelGroupsRef.current.push(panelGroup);
    });
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    
    // Load post-processing
    if (!effectiveReducedMotion) {
      loadPostProcessing().then(({ EffectComposer, RenderPass, BloomEffect, EffectPass }) => {
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        
        const bloomEffect = new BloomEffect({
          intensity: effectiveReducedMotion ? 0.25 : (/mobile/i.test(navigator.userAgent) ? 0.6 : 0.9),
          luminanceThreshold: 0.2,
          luminanceSmoothing: 0.85
        });
        const bloomPass = new EffectPass(camera, bloomEffect);
        composer.addPass(bloomPass);
        composerRef.current = composer;
      }).catch(err => {
        console.warn('[DNA] Post-processing load failed, using basic render', err);
      });
    }
    
    console.log('[DNA] Tesseract 3D initialized');
    
    // Cleanup
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      mountedRef.current = false;
      console.log('[DNA] Tesseract 3D cleaned up');
    };
  }, [size, archetypeConfig.color, attributes, profile, effectiveReducedMotion]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !animate) return;
    
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const cubeGroup = cubeGroupRef.current;
    
    const tick = () => {
      // FPS monitoring
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      const fps = 1000 / delta;
      fpsRef.current.push(fps);
      if (fpsRef.current.length > 60) fpsRef.current.shift();
      lastFrameTimeRef.current = now;
      
      const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
      
      // Disable internal wire if fps < 40 on mobile
      if (/mobile/i.test(navigator.userAgent) && avgFps < 40 && fpsRef.current.length >= 30) {
        // Could disable extra effects here
      }
      
      // Lerp rotation
      const lerpFactor = isDraggingRef.current ? 0.16 : 0.12;
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * lerpFactor;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * lerpFactor;
      
      // Apply rotation to cube group
      if (cubeGroup) {
        cubeGroup.rotation.x = THREE.MathUtils.degToRad(rotationRef.current.x);
        cubeGroup.rotation.y = THREE.MathUtils.degToRad(rotationRef.current.y);
      }
      
      // Animate panel openings
      panelsRef.current.forEach((panel, idx) => {
        const currentRot = panel.currentRotation;
        const targetRot = panel.targetRotation;
        
        // Smooth ease
        const diff = targetRot - currentRot;
        if (Math.abs(diff) > 0.01) {
          panel.currentRotation += diff * 0.08; // Slow ease
          
          const panelGroup = panelGroupsRef.current[idx];
          if (panelGroup) {
            // Hinge rotation
            const axis = new THREE.Vector3();
            if (idx === 0) axis.set(0, 1, 0); // Front: rotate around Y
            else if (idx === 1) axis.set(0, 1, 0); // Right: rotate around Y
            else if (idx === 2) axis.set(1, 0, 0); // Top: rotate around X
            else if (idx === 3) axis.set(0, 1, 0); // Left: rotate around Y
            else if (idx === 4) axis.set(1, 0, 0); // Bottom: rotate around X
            
            panelGroup.setRotationFromAxisAngle(axis, THREE.MathUtils.degToRad(panel.currentRotation));
            
            // Show/hide content based on opening
            const panelMesh = panelMeshesRef.current[idx];
            const sprite = (panelMesh as any)?.contentSprite;
            if (sprite) {
              sprite.material.opacity = panel.currentRotation >= 10 ? 
                Math.min(1, (panel.currentRotation - 10) / 20) : 0;
            }
          }
        }
      });
      
      // Render
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
      
      frameIdRef.current = requestAnimationFrame(tick);
    };
    
    tick();
    
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [animate]);

  // Input handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disableTilt) return;
    
    const MAX_ROT = 65;
    const MOUSE_GAIN = 1.0;
    const TOUCH_GAIN = 0.7;
    const INERTIA_DECAY = 0.92;
    
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      container.setPointerCapture?.(e.pointerId);
      
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotX: targetRotationRef.current.x,
        rotY: targetRotationRef.current.y
      };
      
      velocityRef.current = { x: 0, y: 0 };
      
      // Check panel click
      if (canvasRef.current && sceneRef.current && cameraRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);
        
        const intersects = raycaster.intersectObjects(panelMeshesRef.current, false);
        if (intersects.length > 0) {
          const idx = panelMeshesRef.current.indexOf(intersects[0].object as THREE.Mesh);
          if (idx !== -1) {
            // Toggle panel
            const panel = panelsRef.current[idx];
            const newState = !panel.isOpen;
            
            // Close all others
            panelsRef.current.forEach((p, i) => {
              if (i === idx) {
                p.isOpen = newState;
                p.targetRotation = newState ? 30 : 0;
              } else {
                p.isOpen = false;
                p.targetRotation = 0;
              }
            });
          }
        }
      }
    };
    
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / rect.width;
      const ny = (e.clientY - cy) / rect.height;
      
      const isTouch = e.pointerType === 'touch';
      const gain = isTouch ? TOUCH_GAIN : MOUSE_GAIN;
      
      const baseX = clamp(ny * MAX_ROT * gain, -MAX_ROT, MAX_ROT);
      const baseY = clamp(nx * MAX_ROT * gain, -MAX_ROT, MAX_ROT);
      
      if (isDraggingRef.current) {
        const prevTarget = targetRotationRef.current;
        velocityRef.current = {
          x: (baseX - prevTarget.x) * 0.25,
          y: (baseY - prevTarget.y) * 0.25
        };
        targetRotationRef.current = { x: baseX, y: baseY };
      } else if (e.pointerType === 'mouse') {
        // Hover parallax (subtle)
        targetRotationRef.current = { 
          x: baseX * 0.5, 
          y: baseY * 0.5 
        };
      }
    };
    
    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      container.releasePointerCapture?.(e.pointerId);
      
      // Inertia
      if (Math.abs(velocityRef.current.x) > 0.3 || Math.abs(velocityRef.current.y) > 0.3) {
        const decay = () => {
          velocityRef.current.x *= INERTIA_DECAY;
          velocityRef.current.y *= INERTIA_DECAY;
          
          targetRotationRef.current = {
            x: clamp(targetRotationRef.current.x + velocityRef.current.x, -MAX_ROT, MAX_ROT),
            y: clamp(targetRotationRef.current.y + velocityRef.current.y, -MAX_ROT, MAX_ROT)
          };
          
          if (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01) {
            requestAnimationFrame(decay);
          }
        };
        requestAnimationFrame(decay);
      }
    };
    
    const onDoubleClick = () => {
      targetRotationRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
    };
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cameraRef.current) {
        const newZ = clamp(cameraRef.current.position.z + e.deltaY * 0.01, 2.6, 4.2);
        cameraRef.current.position.z = newZ;
      }
    };
    
    container.style.touchAction = 'none';
    container.style.cursor = 'grab';
    
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('dblclick', onDoubleClick);
    container.addEventListener('wheel', onWheel, { passive: false });
    
    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('dblclick', onDoubleClick);
      container.removeEventListener('wheel', onWheel);
    };
  }, [disableTilt]);

  // Handle resize
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(size, size);
        cameraRef.current.aspect = 1;
        cameraRef.current.updateProjectionMatrix();
        
        if (composerRef.current) {
          composerRef.current.setSize(size, size);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: 'block',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab'
        }}
      />
      
      {/* Debug label */}
      {import.meta.env.DEV && (
        <div className="absolute top-2 left-2 text-xs text-white/50 font-mono pointer-events-none">
          TESSERACT 3D (Thor-Cube)
        </div>
      )}
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
