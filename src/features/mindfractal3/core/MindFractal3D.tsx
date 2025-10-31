// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildFractalTunnel } from '../geometry/buildFractalTunnel';
import { NodeLayer } from '../nodes/NodeLayer';
import { LinkEngine } from '../nodes/LinkEngine';
import { GridArcPool } from '../fx/GridArcPool';
import { LinkArcPool } from '../fx/LinkArcPool';
import { FieldBreath } from '../fx/FieldBreath';
import { QualityMonitor } from './QualityMonitor';
import { Tooltip } from '../ui/Tooltip';
import { EvolutionOverlay } from '../ui/EvolutionOverlay';

interface MindFractal3DProps {
  userId: string;
  seed?: number;
  reducedAnimations?: boolean;
}

/**
 * Mind Fractal 3D V3 - Complete rebuild
 * Breathing fractal tunnel with grid-based electric arcs and linkable neural nodes
 */
export const MindFractal3D: React.FC<MindFractal3DProps> = ({
  userId,
  seed = 42,
  reducedAnimations = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [milestone, setMilestone] = useState<{ theme: string; level: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 1, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.01,
      1000
    );
    camera.position.set(0, 0, 8);

    // Renderer
    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    canvasRef.current = renderer.domElement;

    // Controls with deep zoom enabled
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;
    controls.target.set(0, 0, 0);

    // Tunnel config
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    let tunnelRings = isIOS ? 48 : 80;
    const tunnelSegments = 32;
    const tunnelDepth = 40;
    const tunnelRadius = 4;
    let baseTwist = 0;

    // Build initial tunnel
    let tunnelData = buildFractalTunnel({
      rings: tunnelRings,
      segments: tunnelSegments,
      radius: tunnelRadius,
      depth: tunnelDepth,
      baseTwist,
      noiseAmp: 0.15
    });

    // Wireframe material
    const tunnelMaterial = new THREE.MeshBasicMaterial({
      color: 0x35E9FF,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    const tunnelMesh = new THREE.Mesh(tunnelData.geometry, tunnelMaterial);
    const tunnelGroup = new THREE.Group();
    tunnelGroup.add(tunnelMesh);
    scene.add(tunnelGroup);

    // Node layer
    const nodeLayer = new NodeLayer(tunnelData.geometry, 48, seed);
    tunnelGroup.add(nodeLayer.root);

    // Link engine
    const linkEngine = new LinkEngine(nodeLayer, userId, seed);

    // FX pools
    const gridArcPool = new GridArcPool(scene, tunnelData.edges);
    const linkArcPool = new LinkArcPool(scene, tunnelData.edges);
    const fieldBreath = new FieldBreath();

    // Quality monitor
    const qualityMonitor = new QualityMonitor();

    // State
    let hoveredNode: number | null = null;
    let lastRaycastTime = 0;
    const RAYCAST_INTERVAL = 33; // 30Hz

    // Target follow
    let lastTargetUpdate = 0;
    const tmpVec = new THREE.Vector3();

    // Rebuild debounce
    let lastRebuild = 0;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse move handler (throttled)
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastRaycastTime < RAYCAST_INTERVAL) return;
      lastRaycastTime = now;

      const rect = canvasRef.current!.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hit = nodeLayer.raycast(raycaster);

      if (hit !== null && hit !== hoveredNode) {
        hoveredNode = hit;
        canvasRef.current!.style.cursor = 'pointer';
        const node = nodeLayer.getNode(hit);
        if (node) {
          setTooltip({
            x: e.clientX,
            y: e.clientY,
            text: `${node.theme} • ${node.name}`
          });
        }
      } else if (hit === null && hoveredNode !== null) {
        hoveredNode = null;
        canvasRef.current!.style.cursor = 'default';
        setTooltip(null);
      }
    };

    // Click handler with drag detection
    let downPos: { x: number; y: number } | null = null;
    const handlePointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!downPos) return;
      const dx = Math.abs(e.clientX - downPos.x);
      const dy = Math.abs(e.clientY - downPos.y);
      const isClick = (dx + dy) < 6;
      downPos = null;

      if (!isClick || hoveredNode === null) return;

      nodeLayer.discover(hoveredNode);
      linkEngine.selectOrLink(hoveredNode);
    };

    // Event listeners
    canvasRef.current.addEventListener('pointermove', handlePointerMove);
    canvasRef.current.addEventListener('pointerdown', handlePointerDown);
    canvasRef.current.addEventListener('pointerup', handlePointerUp);

    // Link created event
    const handleLinkCreated = ((e: CustomEvent) => {
      const { from, to, theme } = e.detail;
      
      // Visual effects
      const fromPos = nodeLayer.getNode(from)?.position || new THREE.Vector3();
      const toPos = nodeLayer.getNode(to)?.position || new THREE.Vector3();
      linkArcPool.spawnLinkArc(fromPos, toPos);
      
      // Breathing boost
      fieldBreath.boostAmplitude(0.02, 600);
      
      // Arc rate boost
      gridArcPool.boostRate(0.4, 1500);

      console.info('[MF3D] link-created:', { from, to, theme });
    }) as EventListener;

    // Evolution event (milestone)
    const handleEvolve = ((e: CustomEvent) => {
      const { theme, level, theme_links } = e.detail;
      
      if (theme_links % 5 === 0 && theme_links > 0) {
        // Increase twist
        baseTwist = Math.min(baseTwist + 0.05, 0.6);
        
        // Increase rings (with cap)
        tunnelRings = Math.min(tunnelRings + 4, isIOS ? 60 : 96);
        
        // Debounced rebuild
        const now = Date.now();
        if (now - lastRebuild > 2000) {
          tunnelData = buildFractalTunnel({
            rings: tunnelRings,
            segments: tunnelSegments,
            radius: tunnelRadius,
            depth: tunnelDepth,
            baseTwist,
            noiseAmp: 0.15
          });
          
          tunnelMesh.geometry.dispose();
          tunnelMesh.geometry = tunnelData.geometry;
          
          nodeLayer.regenerate(tunnelData.geometry, 48, seed);
          gridArcPool.updateEdges(tunnelData.edges);
          linkArcPool.updateEdges(tunnelData.edges);
          
          lastRebuild = now;
        }
        
        // Show overlay
        setMilestone({ theme, level });
        setTimeout(() => setMilestone(null), 3000);
      }

      console.info('[MF3D] evolve:', { theme, level, baseTwist, tunnelRings });
    }) as EventListener;

    // Node regenerated - re-parent
    const handleNodesRegenerated = (() => {
      if (nodeLayer.root.parent !== tunnelGroup) {
        tunnelGroup.add(nodeLayer.root);
      }
    }) as EventListener;

    window.addEventListener('mindfractal:link-created', handleLinkCreated);
    window.addEventListener('mindfractal:evolve', handleEvolve);
    window.addEventListener('mindfractal:nodes-regenerated', handleNodesRegenerated);

    // Controls change - advance target for deep zoom
    const handleControlsChange = () => {
      const now = performance.now();
      if (now - lastTargetUpdate < 100) return;
      lastTargetUpdate = now;

      const dist = camera.position.distanceTo(controls.target);
      const t = THREE.MathUtils.clamp(1 - dist / (1.6 * tunnelDepth), 0, 1);
      const targetZ = -tunnelDepth * (0.05 + 0.95 * t);
      
      tmpVec.set(0, 0, targetZ);
      controls.target.lerp(tmpVec, 0.1);

      // Clamp camera to 99.5%
      const minZ = -tunnelDepth + 0.05;
      if (camera.position.z < minZ) {
        camera.position.z = minZ;
      }

      // Dynamic near
      camera.near = Math.max(0.01, dist * 0.002);
      camera.updateProjectionMatrix();
    };

    controls.addEventListener('change', handleControlsChange);

    // Animation loop
    let lastTime = performance.now();
    const animate = () => {
      requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Quality monitoring
      qualityMonitor.tick();
      const avgFPS = qualityMonitor.getAverage();

      // Update field breath
      fieldBreath.update();
      const breathingScale = reducedAnimations ? 1.0 : fieldBreath.getScale();
      const twistDelta = fieldBreath.getTwistDelta();
      
      // Apply breathing (including Z-axis)
      tunnelGroup.scale.set(
        breathingScale,
        breathingScale,
        0.95 + breathingScale * 0.05
      );
      
      // Apply torsion (amplified for visibility)
      tunnelGroup.rotation.z = baseTwist * 1.2 + twistDelta * 10;

      // Update nodes
      nodeLayer.update(deltaTime, reducedAnimations);

      // Update arcs
      gridArcPool.update(deltaTime, breathingScale, reducedAnimations);
      linkArcPool.update(deltaTime);

      // Update controls
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Diagnostic logging
    const logInterval = setInterval(() => {
      console.info('[MF3D] status:', {
        fps: qualityMonitor.getAverage().toFixed(1),
        rings: tunnelRings,
        twist: baseTwist.toFixed(3),
        breathing: fieldBreath.getScale().toFixed(3),
        reduced: reducedAnimations
      });
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(logInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mindfractal:link-created', handleLinkCreated);
      window.removeEventListener('mindfractal:evolve', handleEvolve);
      window.removeEventListener('mindfractal:nodes-regenerated', handleNodesRegenerated);
      controls.removeEventListener('change', handleControlsChange);
      canvasRef.current?.removeEventListener('pointermove', handlePointerMove);
      canvasRef.current?.removeEventListener('pointerdown', handlePointerDown);
      canvasRef.current?.removeEventListener('pointerup', handlePointerUp);

      nodeLayer.dispose();
      gridArcPool.dispose();
      linkArcPool.dispose();
      tunnelMesh.geometry.dispose();
      (tunnelMesh.material as THREE.Material).dispose();
      renderer.dispose();
      controls.dispose();
      mountRef.current?.removeChild(renderer.domElement);

      console.info('[MF3D] dispose');
    };
  }, [userId, seed, reducedAnimations]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} />}
      {milestone && <EvolutionOverlay theme={milestone.theme} level={milestone.level} />}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
