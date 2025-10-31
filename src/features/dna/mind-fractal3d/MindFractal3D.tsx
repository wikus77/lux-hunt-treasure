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
import './ui/Tooltip.css';

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

    console.info('[MF3D] init');

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
    controls.minDistance = 0.02 * tunnelDepth; // Ultra-close zoom
    controls.maxDistance = 1.8 * tunnelDepth; // Extended far range
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI * 0.95;
    
    if (savedCam?.target) {
      controls.target.copy(savedCam.target);
    }
    
    controls.update();

    // REAL deep-zoom: target follows camera to 95% tunnel depth
    const tmpVec = new THREE.Vector3();
    controls.addEventListener('change', () => {
      const v = camera.position.clone().sub(controls.target);
      const dist = v.length();
      
      // Progressive target advance: 5% → 95% tunnel depth (more aggressive)
      const t = THREE.MathUtils.clamp(1 - dist / (1.6 * tunnelDepth), 0, 1);
      const targetZ = -tunnelDepth * (0.05 + 0.95 * t); // 5% → 95% depth
      tmpVec.set(0, 0, targetZ);
      controls.target.lerp(tmpVec, 0.1); // More responsive follow (was 0.08)
      
      // Hard clamp: allow 99.9% tunnel penetration (was 99.67%)
      const minZ = -tunnelDepth + 0.05;
      if (camera.position.z < minZ) {
        camera.position.z = minZ;
      }
      
      // Dynamic near plane: prevents Z-fighting at extreme close-up
      camera.near = Math.max(0.01, dist * 0.002);
      camera.updateProjectionMatrix();
      
      // Diagnostic log (every 120 frames)
      if (Math.random() < 0.01) {
        console.info('[MF3D] Deep-zoom:', {
          cameraZ: camera.position.z.toFixed(2),
          targetZ: controls.target.z.toFixed(2),
          dist: dist.toFixed(2),
          near: camera.near.toFixed(4)
        });
      }
      
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

    // === TUNNEL GROUP (Contains tunnel + nodes for unified transforms) ===
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    // === TUNNEL GEOMETRY ===
    let tunnelMesh: THREE.LineSegments | null = null;
    let tunnelTorsion = 0.1;
    let tunnelRings = qualityPresets[qualityLevel].rings;
    let lastRebuildTime = 0;
    
    const buildTunnel = (additionalTwist: number = 0) => {
      if (tunnelMesh) {
        tunnelGroup.remove(tunnelMesh);
        tunnelMesh.geometry.dispose();
      }

      const { positions, indices } = buildSpiralTunnel({
        rings: tunnelRings,
        segments: qualityPresets[qualityLevel].segments,
        radius: 10,
        depth: -tunnelDepth,
        twist: tunnelTorsion + additionalTwist
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
      tunnelGroup.add(tunnelMesh);
      
      return geometry;
    };

    let tunnelGeometry = buildTunnel();
    console.info('[MF3D] buildTunnel OK');

    // === NODE LAYER ===
    const nodeLayer = new NodeLayer(scene, tunnelGeometry);
    nodeLayer.initialize(48, seed);
    nodeLayerRef.current = nodeLayer;
    
    // CRITICAL: Add nodes to tunnel group for unified transforms (breathing, torsion)
    // NodeLayer no longer adds mesh to scene, we parent it to tunnelGroup
    tunnelGroup.add(nodeLayer.mesh);
    nodeLayer.mesh.matrixAutoUpdate = true;
    
    // Diagnostic: log parenting structure
    console.info('[MF3D] Parenting check:', {
      tunnelGroupChildren: tunnelGroup.children.length,
      nodeLayerParent: nodeLayer.mesh.parent?.type,
      nodeLayerMatrixAutoUpdate: nodeLayer.mesh.matrixAutoUpdate
    });
    
    // Assert: nodeLayer.mesh MUST be child of tunnelGroup for sync transforms
    console.assert(
      nodeLayer.mesh.parent === tunnelGroup,
      '[MF3D] ❌ ASSERT FAILED: nodeLayer.mesh.parent !== tunnelGroup → nodes will desync!'
    );
    console.assert(
      tunnelGroup.children.includes(tunnelMesh!),
      '[MF3D] ❌ ASSERT FAILED: tunnelGroup missing tunnelMesh'
    );
    

    // === LINK ENGINE ===
    const linkEngine = new LinkEngine(tunnelDepth);

    // === FX SYSTEMS ===
    const arcPool = new ElectricArcPool(scene);
    const scheduler = new ElectricScheduler(arcPool);
    scheduler.setNodeLayer(nodeLayer);
    scheduler.setTunnelGeometry(tunnelGeometry);
    
    const fieldSweep = new FieldSweep();
    console.info('[MF3D] FieldSweep init OK');

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
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    
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
      
      // Change cursor: pointer on node, default otherwise
      canvas.style.cursor = nodeId !== null ? 'pointer' : 'default';
      
      // Diagnostic: log raycast hits occasionally
      if (nodeId !== null && Math.random() < 0.05) {
        const node = nodeLayer.getNode(nodeId);
        console.info('[MF3D] Raycast hit:', {
          nodeId,
          state: node?.state,
          theme: node?.theme,
          mouseNDC: `(${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)})`
        });
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
      pointerDownTime = Date.now();
    };

    const handlePointerCancel = () => {
      linkEngine.resetPending();
      setSelectedNodeA(null);
    };

    let lastClickTime = 0;
    const onCanvasClick = async (event: PointerEvent) => {
      // Check if this is a real click (not drag)
      const deltaX = Math.abs(event.clientX - pointerDownPos.x);
      const deltaY = Math.abs(event.clientY - pointerDownPos.y);
      const deltaTime = Date.now() - pointerDownTime;
      
      if (deltaX > 6 || deltaY > 6 || deltaTime > 500) {
        return; // Was a drag, not a click
      }
      
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

      console.info('[MF3D] node-click:', { id: nodeId, state: node.state });

      // First click - discover or select
      if (selectedNodeA === null) {
        if (node.state === NodeState.LOCKED) {
          nodeLayer.setNodeState(nodeId, NodeState.DISCOVERED);
          trackNodeSeen(`node_${nodeId}`, seed);
        }
        setSelectedNodeA(nodeId);
        linkEngine.addPendingNode(nodeId);
        
        // Assert: pending node must match
        console.assert(
          linkEngine.getPendingNode() === nodeId,
          '[MF3D] ASSERT FAILED: linkEngine.pendingNodeId !== nodeId'
        );
        
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
        
        // Check for milestone
        if (dbResult?.milestone_added) {
          console.info('[MF3D] ✨ Evolution milestone!', dbResult);
          
          // Debounce rebuild (max 1 every 2s to avoid flicker)
          const now = Date.now();
          if (now - lastRebuildTime > 2000) {
            // Progressive evolution: increase tunnel complexity + torsion
            tunnelTorsion = Math.min(tunnelTorsion + 0.05, 0.6); // Cap at 0.6 rad/unit
            tunnelRings = Math.min(tunnelRings + 4, qualityPresets.high.rings);
            
            // Rebuild tunnel with ACCUMULATED torsion baked into geometry
            tunnelGeometry = buildTunnel(tunnelTorsion); // Pass total torsion
            
            // Regenerate nodes on new tunnel geometry
            nodeLayer.regenerate(tunnelGeometry, 48, seed);
            
            // Re-parent nodes to tunnelGroup after regenerate
            if (nodeLayer.mesh.parent !== tunnelGroup) {
              tunnelGroup.add(nodeLayer.mesh);
            }
            nodeLayer.mesh.instanceMatrix.needsUpdate = true;
            
            scheduler.setTunnelGeometry(tunnelGeometry);
            lastRebuildTime = now;
            
            console.info('[MF3D] 🔄 Rebuild: milestone', {
              torsion: tunnelTorsion.toFixed(3),
              rings: tunnelRings,
              nodesParented: nodeLayer.mesh.parent === tunnelGroup
            });
            
            // Assert: after rebuild, instanceMatrix must need update
            console.assert(
              nodeLayer.mesh.instanceMatrix.needsUpdate === true,
              '[MF3D] ❌ ASSERT: nodeLayer.mesh.instanceMatrix.needsUpdate !== true after rebuild'
            );
          }
          
          // Boost FX frequency
          scheduler.increaseFrequency(0.1);
          
          // Show overlay
          setEvolution({
            visible: true,
            theme: nodeA.theme,
            level: dbResult.milestone_level,
            message: 'Il tuo DNA ha raggiunto una nuova consapevolezza'
          });
          
          console.info('[MF3D] evolve:', { theme: nodeA.theme, level: dbResult.milestone_level });
          
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
        linkEngine.resetPending();
        
        // Assert: after successful link, pending must be null
        console.assert(
          linkEngine.getPendingNode() === null,
          '[MF3D] ASSERT FAILED: linkEngine.pendingNodeId !== null after link'
        );
      }
    };

    // Listen for node regeneration event to auto-reparent
    const handleNodesRegenerated = () => {
      if (nodeLayer.mesh.parent !== tunnelGroup) {
        tunnelGroup.add(nodeLayer.mesh);
        nodeLayer.mesh.instanceMatrix.needsUpdate = true;
        console.info('[MF3D] 🔄 Auto-reparented nodes after regeneration');
      }
    };
    
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('mindfractal:nodes-regenerated', handleNodesRegenerated as EventListener);

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

      // Quality scaling every 2s if FPS drops
      if (frameCount % 120 === 0 && !reduced) {
        const now = Date.now();
        
        if (avgFPS < 45 && qualityLevel !== 'low' && (now - lastQualityCheck) > 2000) {
          qualityLevel = qualityLevel === 'high' ? 'mobile' : 'low';
          tunnelGeometry = buildTunnel(0);
          nodeLayer.regenerate(tunnelGeometry, 48, seed);
          
          // Re-parent nodes to tunnelGroup after quality rebuild
          if (nodeLayer.mesh.parent !== tunnelGroup) {
            tunnelGroup.add(nodeLayer.mesh);
          }
          nodeLayer.mesh.instanceMatrix.needsUpdate = true;
          
          scheduler.setTunnelGeometry(tunnelGeometry);
          console.info('[MF3D] 🔄 Rebuild: quality degraded to', qualityLevel);
          lastQualityCheck = now;
        }
      }

      // Update systems
      controls.update();
      fieldSweep.update();
      let fieldIntensity = fieldSweep.getIntensity();
      
      // If reduced animations, halve intensity (not disable completely)
      const effectiveIntensity = reduced ? 0.5 * fieldIntensity : fieldIntensity;
      
      arcPool.update(deltaTime, effectiveIntensity);
      nodeLayer.update(elapsedTime, hoveredNode);
      scheduler.adjustForFPS(avgFPS, deltaTime);
      scheduler.update(deltaTime, reduced); // Scheduler now handles reduced internally
      
      // LUNG BREATHING: apply intensity to tunnelGroup (includes nodes via parenting)
      // Z-axis also breathes for 3D organic effect
      const breathingScale = reduced ? 1.0 : fieldIntensity;
      tunnelGroup.scale.set(
        breathingScale, 
        breathingScale, 
        0.95 + breathingScale * 0.05 // Z: 0.95 → 1.0 range
      );
      
      // PERCEPTIBLE TORSION: apply strong rotation with sweep micro-twists
      if (!reduced) {
        const twistDelta = fieldSweep.getTwistDelta();
        // Base torsion (1.2x stronger) + sweep micro-torsion (10x amplified)
        tunnelGroup.rotation.z = tunnelTorsion * 1.2 + twistDelta * 10;
      } else {
        // Static torsion when reduced (still visible)
        tunnelGroup.rotation.z = tunnelTorsion * 1.2;
      }
      
      // Update tunnel opacity
      if (tunnelMesh && tunnelMesh.material) {
        (tunnelMesh.material as THREE.LineBasicMaterial).opacity = 0.85 * fieldIntensity;
      }
      
      // Assert: scale must be consistent
      if (frameCount % 60 === 0) {
        console.assert(
          Math.abs(tunnelGroup.scale.x - tunnelGroup.scale.y) < 0.001,
          '[MF3D] ASSERT FAILED: tunnelGroup.scale.x !== tunnelGroup.scale.y'
        );
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
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      canvas.removeEventListener('click', onCanvasClick);
      window.removeEventListener('mindfractal:nodes-regenerated', handleNodesRegenerated as EventListener);
      
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
      
      {/* Tooltip for hovered node - positioned high to avoid blocking canvas */}
      {hoveredNode !== null && nodeLayerRef.current && (
        <div className="mf-tooltip absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-sm">
          <span className="text-sm text-cyan-400 font-medium">
            {nodeLayerRef.current.getNode(hoveredNode)?.name || 'Nodo'}
          </span>
        </div>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
