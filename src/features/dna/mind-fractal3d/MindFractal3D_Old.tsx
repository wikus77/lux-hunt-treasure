// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildSpiralTunnel } from './geometry/buildSpiralTunnel';
import { ElectroArcSystem } from './effects/ElectroArcSystem';
import { NodeSystem, NodeState, type NodeTheme } from './game/NodeSystem';
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
  const [evolution, setEvolution] = useState<EvolutionState>({ visible: false, theme: '', level: 0, message: '' });
  const { trackNodeSeen } = useMindFractalPersistence();
  const { trackLink } = useMindLinkPersistence();

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
      size: { w: rect.width, h: rect.height },
      caps: {
        maxTextures: renderer.capabilities.maxTextures,
        maxVertexUniforms: renderer.capabilities.maxVertexUniforms
      }
    });

    // === SCENE & CAMERA ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 20, 200);

    const camera = new THREE.PerspectiveCamera(
      55,
      rect.width / rect.height,
      0.1,
      2000
    );
    
    // Restore camera from localStorage or set default
    const camStore = new CameraStore('mf_cam_v1');
    const savedCam = camStore.load();
    if (savedCam) {
      camera.position.copy(savedCam.position);
      camera.zoom = savedCam.zoom;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(0, 0, 12);
    }

    // === ORBIT CONTROLS ===
    // Allow deep zoom into tunnel center
    const tunnelDepth = 60;
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !reduced;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.02 * tunnelDepth; // Can zoom very close to center
    controls.maxDistance = 1.6 * tunnelDepth; // Can pull back to see full tunnel
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.95;
    
    if (savedCam?.target) {
      controls.target.copy(savedCam.target);
    }
    
    controls.update();

    // Dynamic near plane adjustment for deep zoom
    controls.addEventListener('change', () => {
      const distance = camera.position.length();
      camera.near = Math.max(0.01, distance * 0.002);
      camera.updateProjectionMatrix();
      
      // Save camera state
      camStore.save({
        position: camera.position,
        target: controls.target,
        zoom: camera.zoom
      });
    });

    // === QUALITY SETTINGS ===
    let qualityLevel: 'high' | 'mobile' | 'low' = reduced ? 'low' : 'mobile';
    const qualityPresets = {
      high: { rings: 96, segments: 64 },
      mobile: { rings: 80, segments: 60 },
      low: { rings: 56, segments: 40 }
    };

    // === TUNNEL GEOMETRY ===
    let tunnelMesh: THREE.LineSegments | null = null;
    const buildTunnel = () => {
      if (tunnelMesh) {
        scene.remove(tunnelMesh);
        tunnelMesh.geometry.dispose();
      }

      const preset = qualityPresets[qualityLevel];
      const { positions, indices } = buildSpiralTunnel({
        rings: preset.rings,
        segments: preset.segments,
        radius: 10,
        depth: -60
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

    const tunnelGeometry = buildTunnel();

    // === NODE SYSTEM ===
    const nodeSystem = new NodeSystem(scene, tunnelGeometry);
    nodeSystem.initialize(48, seed);
    console.info('[MF3D] Node system initialized with themes');

    // === ELECTRO ARC SYSTEM ===
    const electroArcs = new ElectroArcSystem(scene, reduced ? 32 : 64);
    
    // Idle arc spawner (less frequent)
    let lastIdleArcTime = 0;
    const spawnIdleArc = () => {
      if (reduced) return;
      
      const now = performance.now();
      const interval = 2000 + Math.random() * 3000; // 2-5s between arcs
      
      if (now - lastIdleArcTime > interval) {
        const nodeA = nodeSystem.getNode(Math.floor(Math.random() * 48));
        const nodeB = nodeSystem.getNode(Math.floor(Math.random() * 48));
        
        if (nodeA && nodeB && nodeA.id !== nodeB.id) {
          electroArcs.createArc(nodeA.position, nodeB.position);
        }
        
        lastIdleArcTime = now;
      }
    };

    // === RAYCASTER FOR NODE PICKING ===
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastClickTime = 0;
    
    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(pointer, camera);
      const nodeId = nodeSystem.raycast(raycaster);
      setHoveredNode(nodeId);
    };

    const onCanvasClick = async (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastClickTime < 250) return; // Debounce 250ms
      lastClickTime = now;
      
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const nodeId = nodeSystem.raycast(raycaster);

      if (nodeId === null) return;
      
      const node = nodeSystem.getNode(nodeId);
      if (!node) return;

      console.info('[MF3D] Node clicked:', nodeId, node.theme, node.state);

      // First click - select node A
      if (selectedNodeA === null) {
        if (node.state === NodeState.LOCKED) {
          nodeSystem.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        setSelectedNodeA(nodeId);
        console.info('[MF3D] Selected node A:', nodeId);
        
        window.dispatchEvent(new CustomEvent('mindfractal:node-selected', {
          detail: { nodeId, theme: node.theme }
        }));
        return;
      }

      // Second click - create link
      if (nodeId !== selectedNodeA) {
        const nodeA = nodeSystem.getNode(selectedNodeA);
        if (!nodeA) {
          setSelectedNodeA(null);
          return;
        }
        
        // Discover node B if locked
        if (node.state === NodeState.LOCKED) {
          nodeSystem.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        
        // Create electric arc
        electroArcs.createArc(nodeA.position, node.position);
        
        // Mark both as linked
        nodeSystem.setNodeState(selectedNodeA, NodeState.LINKED);
        nodeSystem.setNodeState(nodeId, NodeState.LINKED);
        
        // Track link in database
        const result = await trackLink(selectedNodeA, nodeId, nodeA.theme, seed, 1.0);
        
        console.info('[MF3D] Link created:', {
          from: selectedNodeA,
          to: nodeId,
          theme: nodeA.theme,
          result
        });
        
        window.dispatchEvent(new CustomEvent('mindfractal:link-created', {
          detail: {
            from: selectedNodeA,
            to: nodeId,
            length: nodeA.position.distanceTo(node.position),
            ts: Date.now()
          }
        }));
        
        // Check for evolution milestone
        if (result?.milestone_added) {
          console.info('[MF3D] ✨ Evolution milestone!', result);
          setEvolution({
            visible: true,
            theme: nodeA.theme,
            level: result.milestone_level,
            message: 'Il tuo DNA ha raggiunto una nuova consapevolezza'
          });
          
          window.dispatchEvent(new CustomEvent('mindfractal:evolve', {
            detail: { theme: nodeA.theme, level: result.milestone_level }
          }));
          
          // Hide evolution overlay after 2.5s
          setTimeout(() => {
            setEvolution(prev => ({ ...prev, visible: false }));
          }, 2500);
        }
        
        // Emit progress
        const stats = nodeSystem.getStats();
        onProgress?.({
          discovered: stats.discovered,
          linked: stats.linked,
          ratio: stats.linked / 48
        });
        
        // Reset selection
        setSelectedNodeA(null);
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', onCanvasClick);

    // === FPS MONITOR & QUALITY SCALING ===
    const fpsMonitor = new FPSMonitor();
    let frameCount = 0;
    let lastQualityCheck = Date.now();

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // FPS monitoring
      fpsMonitor.tick();
      frameCount++;

      // Quality scaling every 2 seconds
      if (frameCount % 120 === 0 && !reduced) {
        const avgFps = fpsMonitor.getAverage();
        const now = Date.now();
        
        if (avgFps < 45 && qualityLevel !== 'low' && (now - lastQualityCheck) > 2000) {
          qualityLevel = qualityLevel === 'high' ? 'mobile' : 'low';
          const newGeometry = buildTunnel();
          nodeSystem.regenerate(newGeometry, 48, seed);
          console.info('[MF3D] Quality downgraded to:', qualityLevel);
          lastQualityCheck = now;
        }
      }

      // Update systems
      controls.update();
      electroArcs.update(deltaTime);
      nodeSystem.update(elapsedTime, hoveredNode);
      
      // Spawn idle arcs (less frequently)
      if (!reduced) {
        spawnIdleArc();
      }

      // Pulse effect on tunnel
      if (tunnelMesh && !reduced) {
        const pulse = Math.sin(elapsedTime * 0.6) * 0.02 + 1.0;
        tunnelMesh.scale.set(pulse, pulse, 1.0);
      }

      // Log stats every 60 frames
      if (frameCount === 60) {
        console.info('[MF3D] Stats:', {
          fps: fpsMonitor.getAverage().toFixed(1),
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
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
      
      nodeSystem.dispose();
      electroArcs.dispose();
      
      scene.clear();
    };
  }, [onReady, onProgress, reduced, seed, trackNodeSeen, trackLink, selectedNodeA, hoveredNode]);

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
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
