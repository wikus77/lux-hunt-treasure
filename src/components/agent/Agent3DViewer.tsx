/**
 * AGENT 3D VIEWER - Full-body 3D model viewer with GLB support
 * Auto-center + Auto-focus + Skin Tone Color Support + Equipped Outfit Overlays
 * Mobile-optimized with touch controls (rotate, zoom)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Move3D, ZoomIn } from 'lucide-react';
import * as THREE from 'three';

interface Agent3DViewerProps {
  model: string;
  skinToneColor?: string; // hex color for skin
  equippedOutfitPaths?: string[]; // Array of outfit GLB paths to overlay
  className?: string;
}

// ============================================
// UTILITY: Fit camera to object
// ============================================
function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: any,
  object: THREE.Object3D
) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = size.length() / 2;
  const fov = camera.fov * (Math.PI / 180);
  let cameraDistance = radius / Math.tan(fov / 2) * 1.8;
  cameraDistance = Math.max(3, Math.min(cameraDistance, 8));
  
  camera.position.set(0, center.y, cameraDistance);
  
  if (controls) {
    controls.target.set(center.x, center.y, center.z);
    controls.update();
  }
  
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  
  return { center, size, radius, distance: cameraDistance };
}

// ============================================
// SKIN DETECTION - More aggressive approach
// ============================================

// Strict exclusions - things that should NEVER be tinted
const STRICT_EXCLUSIONS = [
  'eye', 'hair', 'cloth', 'armor', 'boot', 'shoe', 'pant', 'shirt',
  'jacket', 'helmet', 'glass', 'metal', 'weapon', 'accessory', 'belt',
  'fabric', 'leather', 'rubber', 'plastic', 'visor', 'lens', 'teeth',
  'tongue', 'nail', 'claw', 'horn', 'fur', 'feather', 'scale'
];

// Positive hints for skin materials
const SKIN_HINTS = [
  'skin', 'body', 'face', 'head', 'arm', 'leg', 'hand', 'foot',
  'flesh', 'torso', 'neck', 'chest', 'human', 'character', 'mesh',
  'body_', '_body', 'main', 'base', 'default', 'avatar'
];

function shouldApplySkinTone(meshName: string, materialName: string, material: THREE.Material): boolean {
  const meshLower = meshName.toLowerCase();
  const matLower = materialName.toLowerCase();
  
  // Check strict exclusions first
  if (STRICT_EXCLUSIONS.some(ex => meshLower.includes(ex) || matLower.includes(ex))) {
    return false;
  }
  
  // Check positive hints
  if (SKIN_HINTS.some(hint => meshLower.includes(hint) || matLower.includes(hint))) {
    return true;
  }
  
  // For MeshStandardMaterial, check material properties
  if (material instanceof THREE.MeshStandardMaterial) {
    // Skip highly metallic materials (likely armor/metal)
    if (material.metalness > 0.5) return false;
    
    const color = material.color;
    const r = color.r;
    const g = color.g;
    const b = color.b;
    
    // Detect flesh-like colors
    if (r > 0.4 && r <= 1 && g > 0.2 && g < r && b < g) {
      return true;
    }
    
    // Very light/white materials
    if (r > 0.85 && g > 0.75 && b > 0.65 && r >= g && g >= b) {
      return true;
    }
    
    // Grayish default materials
    if (Math.abs(r - g) < 0.1 && Math.abs(g - b) < 0.1 && r > 0.3 && r < 0.9) {
      return true;
    }
  }
  
  return false;
}

// ============================================
// OUTFIT MODEL COMPONENT (Overlay)
// ============================================
interface OutfitModelProps {
  glbPath: string;
  position: THREE.Vector3;
  scale: number;
}

function OutfitModel({ glbPath, position, scale }: OutfitModelProps) {
  const { scene } = useGLTF(glbPath);
  const outfitRef = useRef<THREE.Group>(null);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);
  
  useEffect(() => {
    if (clonedScene && outfitRef.current) {
      // Reset transforms
      clonedScene.position.set(0, 0, 0);
      clonedScene.scale.setScalar(1);
      clonedScene.rotation.set(0, 0, 0);
      
      // Get bounding box
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Scale to match agent height (target ~2.5 units)
      const targetHeight = 2.5;
      const outfitScale = targetHeight / size.y;
      clonedScene.scale.setScalar(outfitScale);
      
      // Recalculate after scaling
      const newBox = new THREE.Box3().setFromObject(clonedScene);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      
      // Position to align with agent
      clonedScene.position.x = -newCenter.x;
      clonedScene.position.z = -newCenter.z;
      clonedScene.position.y = -newBox.min.y;
    }
  }, [clonedScene]);
  
  // Sync rotation with parent group (will be handled by parent)
  return (
    <group ref={outfitRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ============================================
// AGENT MODEL COMPONENT
// ============================================
interface AgentModelProps {
  modelPath: string;
  skinToneColor?: string;
  equippedOutfitPaths?: string[];
  onLoaded: (object: THREE.Object3D, info: { center: THREE.Vector3; size: THREE.Vector3 }) => void;
}

function AgentModel({ modelPath, skinToneColor, equippedOutfitPaths = [], onLoaded }: AgentModelProps) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);
  const [isReady, setIsReady] = useState(false);
  const [agentPosition, setAgentPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [agentScale, setAgentScale] = useState(1);
  
  // Clone scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        // Clone material to avoid affecting original
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(m => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });
    return clone;
  }, [scene]);
  
  // Apply skin tone color
  useEffect(() => {
    if (!clonedScene || !skinToneColor) return;
    
    const skinColor = new THREE.Color(skinToneColor);
    let appliedCount = 0;
    
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const meshName = mesh.name || '';
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        materials.forEach((material) => {
          if (!material) return;
          
          const matName = material.name || '';
          
          if (shouldApplySkinTone(meshName, matName, material)) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.color.copy(skinColor);
              material.metalness = 0.05;
              material.roughness = 0.75;
              material.needsUpdate = true;
              appliedCount++;
            } else if (material instanceof THREE.MeshBasicMaterial) {
              material.color.copy(skinColor);
              material.needsUpdate = true;
              appliedCount++;
            } else if (material instanceof THREE.MeshPhongMaterial) {
              material.color.copy(skinColor);
              material.needsUpdate = true;
              appliedCount++;
            }
          }
        });
      }
    });
    
    if (appliedCount > 0) {
      console.log(`[Agent3DViewer] Applied skin tone to ${appliedCount} materials`);
    }
  }, [clonedScene, skinToneColor]);
  
  // Center and scale model
  useEffect(() => {
    if (clonedScene && modelRef.current) {
      clonedScene.position.set(0, 0, 0);
      clonedScene.scale.setScalar(1);
      clonedScene.rotation.set(0, 0, 0);
      
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const targetHeight = 2.5;
      const scale = targetHeight / size.y;
      clonedScene.scale.setScalar(scale);
      setAgentScale(scale);
      
      const newBox = new THREE.Box3().setFromObject(clonedScene);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      
      clonedScene.position.x = -newCenter.x;
      clonedScene.position.z = -newCenter.z;
      clonedScene.position.y = -newBox.min.y;
      
      setAgentPosition(new THREE.Vector3(
        clonedScene.position.x,
        clonedScene.position.y,
        clonedScene.position.z
      ));
      
      setIsReady(true);
      
      setTimeout(() => {
        if (modelRef.current) {
          const finalBox = new THREE.Box3().setFromObject(modelRef.current);
          const finalCenter = finalBox.getCenter(new THREE.Vector3());
          const finalSize = finalBox.getSize(new THREE.Vector3());
          onLoaded(modelRef.current, { center: finalCenter, size: finalSize });
        }
      }, 100);
    }
  }, [clonedScene, onLoaded]);

  // Idle rotation
  useFrame((state, delta) => {
    if (modelRef.current && isReady) {
      modelRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={modelRef}>
      {/* Base Agent Model */}
      <primitive object={clonedScene} />
      
      {/* Equipped Outfit Overlays */}
      {isReady && equippedOutfitPaths.map((outfitPath, index) => (
        <Suspense key={`outfit-${index}-${outfitPath}`} fallback={null}>
          <OutfitModel 
            glbPath={outfitPath}
            position={agentPosition}
            scale={agentScale}
          />
        </Suspense>
      ))}
    </group>
  );
}

// ============================================
// SCENE COMPONENT
// ============================================
interface SceneProps {
  modelPath: string;
  modelKey: string;
  skinToneColor?: string;
  equippedOutfitPaths?: string[];
}

function Scene({ modelPath, modelKey, skinToneColor, equippedOutfitPaths }: SceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const handleModelLoaded = useCallback((
    object: THREE.Object3D, 
    info: { center: THREE.Vector3; size: THREE.Vector3 }
  ) => {
    const tryFit = () => {
      if (controlsRef.current) {
        fitCameraToObject(camera as THREE.PerspectiveCamera, controlsRef.current, object);
      } else {
        requestAnimationFrame(tryFit);
      }
    };
    setTimeout(tryFit, 50);
  }, [camera]);
  
  useEffect(() => {
    camera.position.set(0, 1.25, 4.5);
    camera.lookAt(0, 1.25, 0);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 4]} intensity={0.9} castShadow={false} />
      <directionalLight position={[-4, 3, -4]} intensity={0.5} castShadow={false} />
      <pointLight position={[0, 2.5, -2.5]} intensity={0.4} color="#00d4ff" />
      <pointLight position={[-2.5, 1.5, 1.5]} intensity={0.25} color="#ff00ff" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#0a1525" opacity={0.5} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[1.6, 2, 32]} />
        <meshBasicMaterial color="#00ffff" opacity={0.12} transparent />
      </mesh>
      
      {/* Agent Model with Outfits */}
      <Suspense fallback={null}>
        <AgentModel 
          key={modelKey}
          modelPath={modelPath}
          skinToneColor={skinToneColor}
          equippedOutfitPaths={equippedOutfitPaths}
          onLoaded={handleModelLoaded}
        />
      </Suspense>
      
      {/* Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2.5}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 + 0.15}
        autoRotate={false}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        dampingFactor={0.08}
        enableDamping={true}
        target={[0, 1.25, 0]}
      />
    </>
  );
}

// ============================================
// LOADING PLACEHOLDER
// ============================================
function LoadingPlaceholder() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="relative w-20 h-36 mb-3">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent rounded-t-full"
          style={{
            clipPath: 'polygon(35% 0%, 65% 0%, 75% 20%, 80% 50%, 70% 100%, 30% 100%, 20% 50%, 25% 20%)'
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/15 via-purple-500/8 to-transparent blur-lg"
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="text-xs font-orbitron text-white/50">Loading Agent...</span>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN VIEWER COMPONENT
// ============================================
export function Agent3DViewer({ 
  model, 
  skinToneColor, 
  equippedOutfitPaths = [],
  className = '' 
}: Agent3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelKey, setModelKey] = useState(model);
  
  // Create a unique key that includes all relevant props
  const viewerKey = useMemo(() => {
    const outfitKey = equippedOutfitPaths.sort().join('_') || 'none';
    return `${model}_${skinToneColor || 'default'}_${outfitKey}_${Date.now()}`;
  }, [model, skinToneColor, equippedOutfitPaths]);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setModelKey(viewerKey);
    
    fetch(model, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          setError('Model not found');
          setIsLoading(false);
        } else {
          setTimeout(() => setIsLoading(false), 250);
        }
      })
      .catch(() => {
        setError('Failed to load');
        setIsLoading(false);
      });
  }, [model, viewerKey]);

  if (error) {
    return (
      <div className={`relative w-full h-[360px] flex items-center justify-center bg-gradient-to-b from-[#0a0a20] to-[#050510] rounded-2xl border border-red-500/30 ${className}`}>
        <div className="text-center px-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-lg">⚠️</span>
          </div>
          <p className="text-red-400 text-sm mb-1">Unable to load agent</p>
          <p className="text-white/30 text-xs truncate max-w-[180px]">{model.split('/').pop()}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`relative w-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-purple-500/3 to-transparent rounded-2xl blur-xl pointer-events-none" />
      
      <div className="relative w-full h-[360px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0a20] via-[#080815] to-[#050510] border border-white/10">
        <AnimatePresence>
          {isLoading && <LoadingPlaceholder />}
        </AnimatePresence>
        
        {/* Equipped count indicator */}
        {equippedOutfitPaths.length > 0 && !isLoading && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
            <span className="text-[10px] text-purple-400 font-medium">
              {equippedOutfitPaths.length} outfit{equippedOutfitPaths.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        <Canvas
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1}
          gl={{ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ fov: 40, near: 0.1, far: 50, position: [0, 1.25, 4.5] }}
          style={{ 
            touchAction: 'none',
            opacity: isLoading ? 0.2 : 1,
            transition: 'opacity 0.25s ease'
          }}
        >
          <Scene 
            modelPath={model} 
            modelKey={modelKey} 
            skinToneColor={skinToneColor}
            equippedOutfitPaths={equippedOutfitPaths}
          />
        </Canvas>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent pointer-events-none" />
        
        {!isLoading && (
          <motion.div 
            className="absolute bottom-2 left-0 right-0 flex justify-center gap-5 pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.25 }}
          >
            <span className="flex items-center gap-1 text-white/25 text-[10px]">
              <Move3D className="w-3 h-3" /> Drag
            </span>
            <span className="flex items-center gap-1 text-white/25 text-[10px]">
              <ZoomIn className="w-3 h-3" /> Pinch
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

if (typeof window !== 'undefined') {
  useGLTF.preload('/models/agent/agent_male.glb');
  useGLTF.preload('/models/agent/agent_female01.glb');
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
