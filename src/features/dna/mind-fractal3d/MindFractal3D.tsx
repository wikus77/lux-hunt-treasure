// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildSpiralTunnel } from './geometry/buildSpiralTunnel';
import { ElectroArcSystem } from './effects/ElectroArcSystem';
import { NodeSystem, NodeState } from './game/NodeSystem';
import { FPSMonitor } from './utils/FPSMonitor';
import { CameraStore } from './utils/CameraStore';
import { useMindFractalPersistence } from './persistence/useMindFractalPersistence';

export interface MindFractal3DProps {
  className?: string;
  onReady?: () => void;
  onProgress?: (progress: { discovered: number; linked: number; ratio: number }) => void;
  reduced?: boolean;
  seed?: number;
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
  const { trackNodeSeen, trackLinkCreated } = useMindFractalPersistence();

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

    // Save camera state on change
    controls.addEventListener('change', () => {
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
    };

    buildTunnel();

    // === NODE SYSTEM ===
    const nodeSystem = new NodeSystem(scene, tunnelMesh!.geometry as THREE.BufferGeometry);
    nodeSystem.initialize(48);

    // === ELECTRO ARC SYSTEM ===
    const electroArcs = new ElectroArcSystem(scene, reduced ? 32 : 64);
    
    // Idle arc spawner (Poisson process)
    let lastIdleArcTime = 0;
    const spawnIdleArc = () => {
      if (reduced) return; // Skip idle arcs in reduced mode
      
      const now = performance.now();
      const interval = 800 + Math.random() * 1200; // ~0.8-2s between arcs
      
      if (now - lastIdleArcTime > interval) {
        // Pick two random points on tunnel surface
        const rings = qualityPresets[qualityLevel].rings;
        const segments = qualityPresets[qualityLevel].segments;
        
        const ring1 = Math.floor(Math.random() * rings);
        const ring2 = Math.floor(Math.random() * rings);
        const seg1 = Math.floor(Math.random() * segments);
        const seg2 = Math.floor(Math.random() * segments);
        
        const pos = tunnelMesh?.geometry.attributes.position;
        if (pos) {
          const idx1 = ring1 * (segments + 1) + seg1;
          const idx2 = ring2 * (segments + 1) + seg2;
          
          const p1 = new THREE.Vector3(
            pos.getX(idx1),
            pos.getY(idx1),
            pos.getZ(idx1)
          );
          const p2 = new THREE.Vector3(
            pos.getX(idx2),
            pos.getY(idx2),
            pos.getZ(idx2)
          );
          
          // Only create arc if points are reasonably far
          if (p1.distanceTo(p2) > 5) {
            electroArcs.createArc(p1, p2);
          }
        }
        
        lastIdleArcTime = now;
      }
    };

    // === RAYCASTER FOR NODE PICKING ===
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastClickedNode: number | null = null;
    let lastClickTime = 0;

    const onCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const nodeId = nodeSystem.raycast(raycaster);

      if (nodeId !== null) {
        const state = nodeSystem.getNodeState(nodeId);
        
        if (state === NodeState.LOCKED) {
          nodeSystem.setNodeState(nodeId, NodeState.DISCOVERED);
          
          // Track in database
          trackNodeSeen(`node_${nodeId}`, seed);
          
          window.dispatchEvent(new CustomEvent('mf:node-click', {
            detail: { id: nodeId, state: NodeState.DISCOVERED }
          }));
        } else if (state === NodeState.DISCOVERED) {
          const now = Date.now();
          if (lastClickedNode !== null && lastClickedNode !== nodeId && (now - lastClickTime) < 8000) {
            // Link two discovered nodes
            const pos1 = nodeSystem.getNodePosition(lastClickedNode);
            const pos2 = nodeSystem.getNodePosition(nodeId);
            
            if (pos1 && pos2) {
              electroArcs.createArc(pos1, pos2);
              nodeSystem.setNodeState(lastClickedNode, NodeState.LINKED);
              nodeSystem.setNodeState(nodeId, NodeState.LINKED);
              
              // Track link in database
              const linkLength = pos1.distanceTo(pos2);
              trackLinkCreated(`node_${lastClickedNode}`, `node_${nodeId}`, linkLength, seed);
              
              window.dispatchEvent(new CustomEvent('mf:node-click', {
                detail: { id: nodeId, state: NodeState.LINKED, linkedWith: lastClickedNode }
              }));
            }
            
            lastClickedNode = null;
          } else {
            lastClickedNode = nodeId;
            lastClickTime = now;
          }
        }

        // Emit progress
        const stats = nodeSystem.getStats();
        onProgress?.({
          discovered: stats.discovered,
          linked: stats.linked,
          ratio: stats.linked / 48
        });
      }
    };

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
          buildTunnel();
          nodeSystem.regenerate(tunnelMesh!.geometry as THREE.BufferGeometry, 48);
          console.info('[MF3D] Quality downgraded to:', qualityLevel);
          lastQualityCheck = now;
        }
      }

      // Update systems
      controls.update();
      electroArcs.update(deltaTime);
      nodeSystem.update(elapsedTime);
      
      // Spawn idle arcs
      spawnIdleArc();

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
  }, [onReady, onProgress, reduced, seed, trackNodeSeen, trackLinkCreated]);

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
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
