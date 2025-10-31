// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildSpiralTunnel } from './geometry/buildSpiralTunnel';
import { NodeLayer, NodeState } from './nodes/NodeLayer';
import { usePickNode } from './nodes/usePickNode';
import { LinkEngine } from './game/LinkEngine';
import { ElectricArcPool } from './fx/ElectricArcPool';
import { ElectricScheduler } from './fx/ElectricScheduler';
import { FieldSweep } from './effects/FieldSweep';
import { FPSMonitor } from './utils/FPSMonitor';
import { CameraStore } from './utils/CameraStore';
import { useMindFractalPersistence } from './persistence/useMindFractalPersistence';
import { useMindLinkPersistence } from './persistence/useMindLinkPersistence';
import { EvolutionOverlay } from './ui/EvolutionOverlay';

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
    
    // === RENDERER SETUP ===
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    const dpr = Math.min(2, window.devicePixelRatio || 1);
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
    controls.enableDamping = !reduced;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.02 * tunnelDepth; // Can zoom very close
    controls.maxDistance = 1.6 * tunnelDepth;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.95;
    
    if (savedCam?.target) {
      controls.target.copy(savedCam.target);
    }
    
    controls.update();

    // Dynamic near plane for deep zoom
    controls.addEventListener('change', () => {
      const distance = camera.position.length();
      camera.near = Math.max(0.01, distance * 0.002);
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
    let tunnelMesh: THREE.LineSegments | null = null;
    let tunnelTorsion = 0.1;
    let tunnelRings = qualityPresets[qualityLevel].rings;
    
    const buildTunnel = () => {
      if (tunnelMesh) {
        scene.remove(tunnelMesh);
        tunnelMesh.geometry.dispose();
      }

      const { positions, indices } = buildSpiralTunnel({
        rings: tunnelRings,
        segments: qualityPresets[qualityLevel].segments,
        radius: 10,
        depth: -tunnelDepth
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
      scene.add(tunnelMesh);
      
      return geometry;
    };

    let tunnelGeometry = buildTunnel();

    // === NODE LAYER ===
    const nodeLayer = new NodeLayer(scene, tunnelGeometry);
    nodeLayer.initialize(48, seed);
    nodeLayerRef.current = nodeLayer;
    console.info('[MF3D] NodeLayer initialized with 48 nodes');

    // === LINK ENGINE ===
    const linkEngine = new LinkEngine(tunnelDepth);

    // === FX SYSTEMS ===
    const arcPool = new ElectricArcPool(scene);
    const scheduler = new ElectricScheduler(arcPool);
    scheduler.setNodeLayer(nodeLayer);
    scheduler.setTunnelGeometry(tunnelGeometry);
    
    const fieldSweep = new FieldSweep();

    // === FPS MONITOR ===
    const fpsMonitor = new FPSMonitor();
    let frameCount = 0;
    let lastQualityCheck = Date.now();

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

      console.info('[MF3D] Node clicked:', nodeId, node.theme, node.state);

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
        
        // Create visual arc with white spike
        scheduler.spawnLinkArc(nodeA.position, node.position);
        
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
        
        console.info('[MF3D] Link created:', linkResult, 'DB:', dbResult);
        
        // Check for milestone
        if (dbResult?.milestone_added) {
          console.info('[MF3D] ✨ Evolution milestone!', dbResult);
          
          // Increase tunnel complexity
          tunnelTorsion += 0.05;
          tunnelRings = Math.min(tunnelRings + 4, qualityPresets.high.rings);
          tunnelGeometry = buildTunnel();
          nodeLayer.regenerate(tunnelGeometry, 48, seed);
          scheduler.setTunnelGeometry(tunnelGeometry);
          
          // Boost FX frequency
          scheduler.increaseFrequency(0.1);
          
          // Show overlay
          setEvolution({
            visible: true,
            theme: nodeA.theme,
            level: dbResult.milestone_level,
            message: 'Il tuo DNA ha raggiunto una nuova consapevolezza'
          });
          
          window.dispatchEvent(new CustomEvent('mindfractal:evolve', {
            detail: { theme: nodeA.theme, level: dbResult.milestone_level }
          }));
          
          setTimeout(() => {
            setEvolution(prev => ({ ...prev, visible: false }));
          }, 2500);
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

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', onCanvasClick);

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // FPS monitoring
      const currentFPS = fpsMonitor.tick();
      const avgFPS = fpsMonitor.getAverage();
      frameCount++;

      // Quality scaling every 2s
      if (frameCount % 120 === 0 && !reduced) {
        const now = Date.now();
        
        if (avgFPS < 45 && qualityLevel !== 'low' && (now - lastQualityCheck) > 2000) {
          qualityLevel = qualityLevel === 'high' ? 'mobile' : 'low';
          tunnelGeometry = buildTunnel();
          nodeLayer.regenerate(tunnelGeometry, 48, seed);
          scheduler.setTunnelGeometry(tunnelGeometry);
          console.info('[MF3D] Quality downgraded to:', qualityLevel);
          lastQualityCheck = now;
        }
      }

      // Update systems
      controls.update();
      fieldSweep.update();
      const fieldIntensity = fieldSweep.getIntensity();
      arcPool.update(deltaTime, fieldIntensity);
      nodeLayer.update(elapsedTime, hoveredNode);
      scheduler.adjustForFPS(avgFPS, deltaTime);
      scheduler.update(deltaTime, reduced);
      
      // Field sweep effect on tunnel
      if (tunnelMesh) {
        const intensity = fieldSweep.getIntensity();
        const pulse = !reduced ? Math.sin(elapsedTime * 0.6) * 0.02 + 1.0 : 1.0;
        tunnelMesh.scale.set(pulse * intensity, pulse * intensity, 1.0);
        
        if (tunnelMesh.material) {
          (tunnelMesh.material as THREE.LineBasicMaterial).opacity = 0.85 * intensity;
        }
      }

      // Log stats periodically
      if (frameCount === 60) {
        console.info('[MF3D] Stats:', {
          fps: avgFPS.toFixed(1),
          drawCalls: renderer.info.render.calls,
          quality: qualityLevel
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
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', onCanvasClick);
      
      controls.dispose();
      renderer.dispose();
      
      if (tunnelMesh) {
        tunnelMesh.geometry.dispose();
        (tunnelMesh.material as THREE.Material).dispose();
      }
      
      nodeLayer.dispose();
      arcPool.dispose();
      
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
      
      {evolution.visible && (
        <EvolutionOverlay
          theme={evolution.theme}
          level={evolution.level}
          message={evolution.message}
        />
      )}
      
      {/* Tooltip for hovered node */}
      {hoveredNode !== null && nodeLayerRef.current && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm">
          <span className="text-sm text-cyan-400 font-medium">
            {nodeLayerRef.current.getNode(hoveredNode)?.name || 'Nodo'}
          </span>
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
