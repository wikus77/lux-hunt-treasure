// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildFractalTunnel } from './geometry/buildFractalTunnel';
import { NodeLayer, NodeState } from './nodes/NodeLayer';
import { usePickNode } from './nodes/usePickNode';
import { LinkEngine } from './game/LinkEngine';
import { GridArcPool } from './fx/GridArcPool';
import { FieldBreath } from './fx/FieldBreath';
import { FPSMonitor } from './utils/FPSMonitor';
import { CameraStore } from './utils/CameraStore';
import { useMindFractalPersistence } from './persistence/useMindFractalPersistence';
import { useMindLinkPersistence } from './persistence/useMindLinkPersistence';
import { EvolutionOverlay } from './ui/EvolutionOverlay';
import { ProgressHUD } from './ui/ProgressHUD';
import type { DNAScores } from '../dnaTypes';

export interface MindFractal3DProps {
  className?: string;
  onReady?: () => void;
  onProgress?: (progress: { discovered: number; linked: number; ratio: number }) => void;
  reduced?: boolean;
  seed?: number;
}

interface EvolutionState {
  visible: boolean;
  theme: string;
  level: number;
  message: string;
}

export const MindFractal3D: React.FC<MindFractal3DProps> = ({
  className = '',
  onReady,
  onProgress,
  reduced = false,
  seed = 42
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedNodeA, setSelectedNodeA] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [evolution, setEvolution] = useState<EvolutionState>({ 
    visible: false, theme: '', level: 0, message: '' 
  });
  const [linkOverlay, setLinkOverlay] = useState({ visible: false, theme: '', message: '' });
  
  // Progress tracking for HUD
  const [totalLinks, setTotalLinks] = useState(0);
  const [linksByTheme, setLinksByTheme] = useState<Record<string, number>>({});
  const [milestones, setMilestones] = useState(0);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  
  const { trackNodeSeen } = useMindFractalPersistence();
  const { trackLink, loadLinks } = useMindLinkPersistence();
  
  // Refs for Three.js instances
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodeLayerRef = useRef<NodeLayer | null>(null);

  const { pickNode } = usePickNode(
    nodeLayerRef.current,
    cameraRef.current,
    canvasRef.current
  );

  useEffect(() => {
    if (!canvasRef.current || mountedRef.current) return;
    mountedRef.current = true;

    const canvas = canvasRef.current;
    let animationId: number;
    
    // === RENDERER SETUP === [MF3D] Optimized for 60fps
    const isMobile = /iPad|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // Disabled for performance
      alpha: true,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
      preserveDrawingBuffer: false
    });
    
    const dpr = Math.min(1.5, window.devicePixelRatio || 1); // Cap at 1.5 for performance
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);

    console.info('[MF3D] Renderer initialized:', {
      dpr,
      size: { w: rect.width, h: rect.height }
    });

    // === SCENE & CAMERA ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 20, 200);

    const tunnelDepth = 60;
    const camera = new THREE.PerspectiveCamera(
      55,
      rect.width / rect.height,
      0.1,
      2000
    );
    cameraRef.current = camera;
    
    // Restore camera from localStorage
    const camStore = new CameraStore('mf_cam_v2');
    const savedCam = camStore.load();
    if (savedCam) {
      camera.position.copy(savedCam.position);
      camera.zoom = savedCam.zoom;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(0, 0, 12);
    }

    // === ORBIT CONTROLS (DEEP ZOOM) ===
    const controls = new OrbitControls(camera, canvas);
    // === MANUAL CONTROLS - STATIC TUNNEL === [MF3D]
    controls.enableRotate = true; // Manual rotation enabled
    controls.enableZoom = true; // Manual zoom enabled
    controls.enablePan = true; // Manual pan enabled
    controls.enableDamping = false; // NO DAMPING = no drift/movement when idle
    controls.dampingFactor = 0;
    controls.autoRotate = false; // HARD OFF: no auto rotation
    controls.autoRotateSpeed = 0; // ensure no drift
    controls.minDistance = 0.001 * tunnelDepth; // DEEP ZOOM: Can reach 99.9% of tunnel depth
    controls.maxDistance = 1.6 * tunnelDepth;
    controls.maxPolarAngle = Math.PI * 0.95;
    
    if (savedCam?.target) {
      controls.target.copy(savedCam.target);
    }
    
    controls.update();

    // Dynamic near plane for deep zoom
    controls.addEventListener('change', () => {
      const distance = camera.position.distanceTo(controls.target);
      camera.near = Math.max(0.005, distance * 0.0015);
      camera.updateProjectionMatrix();
      
      camStore.save({
        position: camera.position,
        target: controls.target,
        zoom: camera.zoom
      });
    });

    // === QUALITY SETTINGS ===
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let qualityLevel: 'high' | 'mobile' | 'low' = reduced ? 'low' : 'mobile';
    const qualityPresets = {
      high: { rings: isIOS ? 60 : 96, segments: 64 },
      mobile: { rings: isIOS ? 60 : 80, segments: 60 },
      low: { rings: 56, segments: 40 }
    };

    // === TUNNEL GEOMETRY ===
    const tunnelGroup = new THREE.Group(); // Container for tunnel + nodes (breathing together)
    scene.add(tunnelGroup);
    
    let tunnelMesh: THREE.LineSegments | null = null;
    let tunnelTwist = 0.1; // Parametric twist in radians
    let tunnelRings = qualityPresets[qualityLevel].rings;
    
    const buildTunnel = () => {
      if (tunnelMesh) {
        tunnelGroup.remove(tunnelMesh);
        tunnelMesh.geometry.dispose();
      }

      const { positions, indices } = buildFractalTunnel({
        rings: tunnelRings,
        segments: qualityPresets[qualityLevel].segments,
        radius: 10,
        depth: -tunnelDepth,
        twist: tunnelTwist
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();

      const edges = new THREE.EdgesGeometry(geometry, 5);
      const material = new THREE.LineBasicMaterial({
        color: 0xdddddd,
        transparent: true,
        opacity: 0.85
      });

      tunnelMesh = new THREE.LineSegments(edges, material);
      tunnelGroup.add(tunnelMesh); // Add to group instead of scene
      
      return geometry;
    };

    let tunnelGeometry = buildTunnel();

    // === NODE LAYER ===
    const nodeLayer = new NodeLayer(tunnelGroup, tunnelGeometry); // Parent to tunnelGroup
    nodeLayer.initialize(48, seed);
    nodeLayerRef.current = nodeLayer;
    console.info('[MF3D] NodeLayer initialized with 48 nodes, parented to tunnelGroup');

    // === LINK ENGINE ===
    const linkEngine = new LinkEngine(tunnelDepth);

    // === FX SYSTEMS ===
    const gridArcPool = new GridArcPool(scene);
    gridArcPool.setParent(tunnelGroup); // [MF3D] Attach arcs to tunnelGroup for alignment
    gridArcPool.bindGeometry(tunnelGeometry);
    gridArcPool.setFPSTarget(isMobile ? 45 : 60); // Dynamic budgeter
    
    console.info('[MF3D] GridArcPool initialized with budgeter target:', isMobile ? 45 : 60, 'fps');
    
    const fieldBreath = new FieldBreath({ periodMs: 12000, amp: 0.30 });
    
    // Track surge events for logging
    let lastSurgeLog = { rings: 0, duration: 0 };
    window.addEventListener('mindfractal:surge', ((e: CustomEvent) => {
      lastSurgeLog = e.detail;
      console.info('[MF3D] 🌊 Surge detected:', e.detail);
    }) as EventListener);

    // === FPS MONITOR ===
    const fpsMonitor = new FPSMonitor();
    let frameCount = 0;
    let lastQualityCheck = Date.now();
    let isPaused = false;
    
    // Pause rendering when tab hidden
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!document.hidden) {
        console.info('[MF3D] Tab visible, resuming rendering');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // === RESUME USER LINKS ===
    const resumeLinks = async () => {
      try {
        const links = await loadLinks(seed);
        if (links && Array.isArray(links) && links.length > 0) {
          console.info('[MF3D] Resuming', links.length, 'links');
          for (const link of links.slice(-50)) {
            if (link && typeof link.node_a === 'number' && typeof link.node_b === 'number') {
              nodeLayer.setNodeState(link.node_a, NodeState.LINKED);
              nodeLayer.setNodeState(link.node_b, NodeState.LINKED);
            }
          }
          
          // Emit progress
          const stats = nodeLayer.getStats();
          onProgress?.({
            discovered: stats.discovered,
            linked: stats.linked,
            ratio: stats.linked / 48
          });
        }
      } catch (err) {
        console.warn('[MF3D] Resume failed:', err);
      }
    };
    
    resumeLinks();

    // === INTERACTION HANDLERS ===
    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const nodeId = nodeLayer.raycast(raycaster);
      setHoveredNode(nodeId);
      
      // Update cursor
      canvas.style.cursor = nodeId !== null ? 'pointer' : 'default';
    };

    let lastClickTime = 0;
    const onCanvasClick = async (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastClickTime < 250) return; // Debounce
      lastClickTime = now;
      
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const nodeId = nodeLayer.raycast(raycaster);

      if (nodeId === null) return;
      
      const node = nodeLayer.getNode(nodeId);
      if (!node) return;

      console.info('[MF3D] node-click', { nodeId, theme: node.theme, stateBefore: node.state });

      // First click - discover or select
      if (selectedNodeA === null) {
        if (node.state === NodeState.LOCKED) {
          nodeLayer.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        setSelectedNodeA(nodeId);
        console.info('[MF3D] Selected node A:', nodeId, node.name);
        
        window.dispatchEvent(new CustomEvent('mindfractal:node-selected', {
          detail: { nodeId, theme: node.theme, worldPos: node.position.clone() }
        }));
        return;
      }

      // Second click - create link
      if (nodeId !== selectedNodeA) {
        const nodeA = nodeLayer.getNode(selectedNodeA);
        if (!nodeA) {
          setSelectedNodeA(null);
          return;
        }
        
        // Check link validity
        const linkResult = linkEngine.createLink(nodeA, node);
        if (!linkResult) {
          console.warn('[MF3D] Link rejected');
          setSelectedNodeA(null);
          return;
        }
        
        // Discover node B if locked
        if (node.state === NodeState.LOCKED) {
          nodeLayer.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        
        // Create ULTRA BRIGHT visual arc connecting the nodes
        console.info('[MF3D] 🔗 Creating link arc:', {
          from: selectedNodeA,
          to: nodeId,
          posA: nodeA.position.toArray().map(v => v.toFixed(2)),
          posB: node.position.toArray().map(v => v.toFixed(2))
        });
        gridArcPool.spawnLinkArc(nodeA.position, node.position);
        
        // Boost breathing intensity
        fieldBreath.boost(2, 0.10);
        
        // Play short link sound
        try {
          const audio = new Audio('/sounds/chime.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
        
        // Mark both as linked
        nodeLayer.setNodeState(selectedNodeA, NodeState.LINKED);
        nodeLayer.setNodeState(nodeId, NodeState.LINKED);
        
        // Track in DB
        const dbResult = await trackLink(selectedNodeA, nodeId, nodeA.theme, seed, 1.0);
        
        // Update progress tracking
        setTotalLinks(prev => prev + 1);
        setLinksByTheme(prev => ({ ...prev, [nodeA.theme]: (prev[nodeA.theme] || 0) + 1 }));
        setActiveTheme(nodeA.theme);
        
        // Connection overlay with progress
        const themeCount = (linksByTheme[nodeA.theme] || 0) + 1;
        setLinkOverlay({ 
          visible: true, 
          theme: nodeA.theme, 
          message: `Connessione riuscita: ${nodeA.theme} +1 • ${themeCount}/12` 
        });
        setTimeout(() => setLinkOverlay(prev => ({ ...prev, visible: false })), 1200);
        
        // Play link sound
        const linkAudio = new Audio('/sounds/link-success.mp3');
        linkAudio.volume = 0.3;
        linkAudio.play().catch(() => {}); // Silent fail if audio unavailable
        
        console.info('[MF3D] link-created', { from: selectedNodeA, to: nodeId, length: linkResult.length.toFixed(2), theme: nodeA.theme, dbTracked: !!dbResult });
        
        // Check for milestone
        if (dbResult?.milestone_added) {
          const level = dbResult.milestone_level || 1;
          console.info('[MF3D] ✨ Evolution milestone!', { theme: nodeA.theme, level, twist: tunnelTwist });
          
          // Update milestones count
          setMilestones(prev => prev + 1);
          
          // Increase tunnel complexity
          tunnelTwist = Math.min(tunnelTwist + 0.12, 0.8);
          tunnelRings = Math.min(tunnelRings + 4, qualityPresets.high.rings);
          
          // Show evolution overlay
          setEvolution({
            visible: true,
            theme: nodeA.theme,
            level,
            message: `Milestone raggiunta: ${nodeA.theme} L${level}`
          });
          
          setTimeout(() => setEvolution(prev => ({ ...prev, visible: false })), 2500);
          
          // Play milestone sound
          const milestoneAudio = new Audio('/sounds/milestone.mp3');
          milestoneAudio.volume = 0.4;
          milestoneAudio.play().catch(() => {});
          
          // Rebuild with debounce
          setTimeout(() => {
            tunnelGeometry = buildTunnel();
            nodeLayer.regenerate(tunnelGeometry, 48, seed);
            gridArcPool.bindGeometry(tunnelGeometry);
            // Apply twist rotation on rebuild
            tunnelGroup.rotation.z = tunnelTwist * 1.4; // Amplified for visibility
          }, 2000);
          
          window.dispatchEvent(new CustomEvent('mindfractal:evolve', {
            detail: { theme: nodeA.theme, level }
          }));
        }
        
        // Emit progress
        const stats = nodeLayer.getStats();
        onProgress?.({
          discovered: stats.discovered,
          linked: stats.linked,
          ratio: stats.linked / 48
        });
        
        setSelectedNodeA(null);
      }
    };

    // === DRAG DETECTION ===
    let pointerDownPos: { x: number; y: number; ts: number } | null = null;
    
    const handlePointerDown = (event: PointerEvent) => {
      pointerDownPos = {
        x: event.clientX,
        y: event.clientY,
        ts: performance.now()
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerDownPos) return;
      
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      const dt = performance.now() - pointerDownPos.ts;
      
      pointerDownPos = null;
      
      // Only trigger click if minimal drag and quick
      if (dx < 6 && dy < 6 && dt < 180) {
        onCanvasClick(event);
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // === ANIMATION LOOP ===
      if (isPaused) return; // Skip rendering when tab hidden
      
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // FPS monitoring
      const currentFPS = fpsMonitor.tick();
      const avgFPS = fpsMonitor.getAverage();
      frameCount++;
      
      // Pass FPS to arc pool for dynamic budgeting
      gridArcPool.setCurrentFPS(avgFPS);

      // Quality scaling every 2s
      if (frameCount % 120 === 0 && !reduced) {
        const now = Date.now();
        
        if (avgFPS < 45 && qualityLevel !== 'low' && (now - lastQualityCheck) > 2000) {
          qualityLevel = qualityLevel === 'high' ? 'mobile' : 'low';
          tunnelGeometry = buildTunnel();
          nodeLayer.regenerate(tunnelGeometry, 48, seed);
          gridArcPool.bindGeometry(tunnelGeometry);
          console.info('[MF3D] Quality downgraded to:', qualityLevel);
          lastQualityCheck = now;
        }
      }

      // [BREATHING DISABLED BY DEFAULT] User must enable via reduced=false
      // Apply ZERO breathing initially - completely static
      const nowMs = performance.now();
      const intensity = reduced ? 1.0 : fieldBreath.tick(nowMs);
      const breathScale = 1.0; // HARD STATIC: no breathing at all
      
      // Apply scale to group - but it's 1.0 (no change)
      tunnelGroup.scale.set(breathScale, breathScale, breathScale);
      // NEVER touch rotation or position
      // tunnelGroup.rotation = NEVER MODIFIED
      // tunnelGroup.position = NEVER MODIFIED
      
      if (tunnelMesh?.material) {
        (tunnelMesh.material as THREE.LineBasicMaterial).opacity = 0.85 * intensity;
      }
      
      // Update FX and nodes
      gridArcPool.update(deltaTime, { reduced });
      nodeLayer.update(elapsedTime, hoveredNode);
      
      // [STATIC CAMERA] Disable automatic target follow to keep tunnel perfectly still
      // const camDist = camera.position.length();
      // const targetProgress = THREE.MathUtils.clamp(1 - camDist / (1.6 * tunnelDepth), 0, 1);
      // const targetZ = -tunnelDepth * (0.05 + 0.95 * targetProgress);
      // controls.target.lerp(new THREE.Vector3(0, 0, targetZ), 0.08);
      
      // DEEP ZOOM: Clamp camera to reach 99.9% of tunnel depth
      const minZ = -tunnelDepth + (0.001 * tunnelDepth); // 99.9% reach
      if (camera.position.z < minZ) {
        camera.position.z = minZ;
      }

      // Log stats periodically (rate-limited to 1/s max)
      if (frameCount % 60 === 0) {
        const stats = nodeLayer.getStats();
        const arcStats = gridArcPool.getStats();
        console.info('[MF3D] Stats', {
          fps: avgFPS.toFixed(1),
          draw: renderer.info.render.calls,
          arcs: arcStats.active,
          pr: renderer.getPixelRatio().toFixed(1),
          quality: qualityLevel,
          breathIntensity: intensity.toFixed(2),
          twist: tunnelTwist.toFixed(2),
          nodes: { discovered: stats.discovered, linked: stats.linked },
          camera: { z: camera.position.z.toFixed(1), targetZ: controls.target.z.toFixed(1), near: camera.near.toFixed(3) }
        });
      }

      renderer.render(scene, camera);

      // Call onReady after first frame
      if (frameCount === 1 && !isReady) {
        setIsReady(true);
        onReady?.();
      }
    };

    animate();

    // === RESIZE HANDLER ===
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // === CLEANUP ===
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      
      controls.dispose();
      renderer.dispose();
      
      if (tunnelMesh) {
        tunnelMesh.geometry.dispose();
        (tunnelMesh.material as THREE.Material).dispose();
      }
      
      nodeLayer.dispose();
      gridArcPool.dispose();
      
      scene.clear();
    };
  }, [onReady, onProgress, reduced, seed, trackNodeSeen, trackLink, loadLinks, selectedNodeA, hoveredNode]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black"
        style={{ display: 'block' }}
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-sm text-white/60">Inizializzazione Mind Fractal...</span>
          </div>
        </div>
      )}
      
      {/* Progress HUD */}
      <ProgressHUD
        totalLinks={totalLinks}
        linksByTheme={linksByTheme}
        milestones={milestones}
        maxMilestones={12}
        activeTheme={activeTheme}
      />
      
      {/* Evolution overlay */}
      {evolution.visible && (
        <EvolutionOverlay
          theme={evolution.theme}
          level={evolution.level}
          message={evolution.message}
        />
      )}
      
      {/* Link success overlay */}
      {linkOverlay.visible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm z-50">
          <span className="text-sm text-cyan-400 font-medium">{linkOverlay.message}</span>
        </div>
      )}
      
      {/* Tooltip for hovered node */}
      {hoveredNode !== null && nodeLayerRef.current && (() => {
        const node = nodeLayerRef.current.getNode(hoveredNode);
        if (!node) return null;
        // Format: "Theme • Name"
        const parts = node.name.split(' ');
        const theme = parts[0];
        const name = parts.slice(1).join(' ');
        return (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm">
            <span className="text-sm text-cyan-400 font-medium">
              {theme} <span className="text-cyan-300">•</span> {name}
            </span>
          </div>
        );
      })()}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
