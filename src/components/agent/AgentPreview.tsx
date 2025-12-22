/**
 * AGENT PREVIEW - 3D Agent Preview Tab
 * Enhanced lighting, auto-centering, consistent model sizing
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useMemo, Suspense, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Palette, RotateCcw, Eye } from 'lucide-react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { 
  getAgentById,
  getDefaultAgent,
  RARITY_STYLES,
  CATEGORY_STYLES
} from './agentCatalog';

// Skin tone configuration
const SKIN_TONES = [
  { id: 'skin_light', label: 'Light', color: '#FFE0BD', isSpecial: false },
  { id: 'skin_medium', label: 'Medium', color: '#D4A574', isSpecial: false },
  { id: 'skin_bronze', label: 'Bronze', color: '#B87333', isSpecial: false },
  { id: 'skin_dark', label: 'Dark', color: '#6B4423', isSpecial: false },
  { id: 'skin_cyan_matte', label: 'Cyan Matte', color: '#00CED1', isSpecial: true },
  { id: 'skin_pink_matte', label: 'Pink Matte', color: '#FF69B4', isSpecial: true },
  { id: 'skin_black_matte', label: 'Black Matte', color: '#1a1a1a', isSpecial: true },
  { id: 'skin_green_matte', label: 'Green Matte', color: '#32CD32', isSpecial: true },
  { id: 'skin_red_matte', label: 'Red Matte', color: '#DC143C', isSpecial: true },
];

// Agent model height overrides for special cases
const MODEL_HEIGHT_OVERRIDES: Record<string, number> = {
  'base_wolfman': 1.15, // Wolfman slightly taller
  'base_special': 1.1,  // Special ops slightly taller
};

interface AgentPreviewProps {
  selectedAgentId: string;
  skinToneId: string;
  agentCode: string;
  onSkinToneChange: (skinToneId: string) => void;
  loading: boolean;
}

// Enhanced 3D Agent Model with consistent centering and sizing
function AgentModel({ 
  glbPath, 
  skinToneColor, 
  agentId 
}: { 
  glbPath: string; 
  skinToneColor: string;
  agentId: string;
}) {
  const { scene } = useGLTF(glbPath);
  const modelRef = useRef<THREE.Group>(null);
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Target height for consistency (with overrides for special models)
    const baseTargetHeight = 2.2;
    const heightMultiplier = MODEL_HEIGHT_OVERRIDES[agentId] || 1.0;
    const targetHeight = baseTargetHeight * heightMultiplier;
    
    // Calculate uniform scale to fit target height
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    
    // Recalculate bounding box after scaling
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    
    // Center on X and Z, align feet to ground (Y = 0)
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y; // Align feet to ground
    
    // Apply skin tone to materials (enhanced detection)
    const skinColor = new THREE.Color(skinToneColor);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        materials.forEach((material) => {
          if (material && 'color' in material) {
            const mat = material as THREE.MeshStandardMaterial;
            const name = (mat.name || '').toLowerCase();
            
            // Detect skin materials by name
            if (name.includes('skin') || name.includes('body') || name.includes('face') || 
                name.includes('hand') || name.includes('flesh') || name.includes('arm')) {
              mat.color.set(skinColor);
            }
          }
        });
      }
    });
    
    return clone;
  }, [scene, skinToneColor, agentId]);
  
  return <primitive ref={modelRef} object={clonedScene} />;
}

// Ground plate for visual grounding
function GroundPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[1.2, 64]} />
      <meshStandardMaterial 
        color="#0a1525"
        transparent
        opacity={0.8}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

export function AgentPreview({ 
  selectedAgentId,
  skinToneId,
  agentCode,
  onSkinToneChange,
  loading 
}: AgentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get selected agent
  const selectedAgent = useMemo(() => {
    return getAgentById(selectedAgentId) || getDefaultAgent();
  }, [selectedAgentId]);

  // Get current skin tone
  const currentSkinTone = useMemo(() => {
    return SKIN_TONES.find(t => t.id === skinToneId) || SKIN_TONES[1];
  }, [skinToneId]);

  const categoryStyle = CATEGORY_STYLES[selectedAgent.category];
  const rarityStyle = RARITY_STYLES[selectedAgent.rarity];

  // Split skin tones
  const naturalTones = SKIN_TONES.filter(t => !t.isSpecial);
  const specialTones = SKIN_TONES.filter(t => t.isSpecial);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* 3D Agent Preview - Enhanced Lighting */}
      <div 
        className="relative h-[340px] rounded-2xl overflow-hidden border border-cyan-500/30"
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #061020 40%, #040812 100%)'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-xs text-cyan-400/60">Loading agent...</span>
            </div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [0, 1, 4], fov: 40 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMappingExposure: 1.4, // Brighter overall exposure
            toneMapping: THREE.ACESFilmicToneMapping
          }}
          onCreated={() => setIsLoading(false)}
          style={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.4s' }}
        >
          {/* Enhanced lighting setup for better visibility */}
          <ambientLight intensity={1.2} color="#ffffff" />
          
          {/* Key light - main illumination from front-right */}
          <directionalLight 
            position={[3, 4, 3]} 
            intensity={1.5} 
            color="#ffffff"
            castShadow={false}
          />
          
          {/* Fill light - softer from left to reduce shadows */}
          <directionalLight 
            position={[-3, 2, 2]} 
            intensity={0.8} 
            color="#e0f0ff"
          />
          
          {/* Rim light - from behind to separate from background */}
          <directionalLight 
            position={[0, 3, -4]} 
            intensity={0.6} 
            color="#00d4ff"
          />
          
          {/* Top light for hair/helmet visibility */}
          <pointLight 
            position={[0, 5, 0]} 
            intensity={0.5} 
            color="#ffffff"
            distance={10}
          />
          
          {/* Accent light for M1SSION style cyan glow */}
          <pointLight 
            position={[-2, 0, -2]} 
            intensity={0.4} 
            color="#00d4ff"
            distance={8}
          />
          
          <Suspense fallback={null}>
            <AgentModel 
              glbPath={selectedAgent.glbPath} 
              skinToneColor={currentSkinTone.color}
              agentId={selectedAgentId}
            />
            <GroundPlate />
          </Suspense>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            autoRotate={true}
            autoRotateSpeed={0.8}
            minDistance={2.5}
            maxDistance={7}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0.8, 0]}
          />
        </Canvas>
        
        {/* Agent name overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className={`px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border ${categoryStyle.border}`}>
            <p className={`text-xs font-orbitron font-medium ${categoryStyle.text}`}>
              {selectedAgent.name}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm border ${rarityStyle.border}`}>
            <p className={`text-[10px] font-medium ${rarityStyle.text}`}>
              {selectedAgent.rarity}
            </p>
          </div>
        </div>
        
        {/* Agent code */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-500/40">
          <p className="text-sm font-orbitron font-bold text-cyan-400">
            {agentCode}
          </p>
        </div>
        
        {/* Rotate hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60">
          <RotateCcw className="w-3 h-3 text-white/50" />
          <span className="text-[10px] text-white/50">Drag to rotate</span>
        </div>
      </div>
      
      {/* Selected Agent Info */}
      <div className={`p-4 rounded-2xl border ${categoryStyle.border} bg-gradient-to-r ${categoryStyle.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${categoryStyle.gradient} flex items-center justify-center text-2xl shadow-lg`}>
            {categoryStyle.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-orbitron font-bold text-white">{selectedAgent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyle.text} ${categoryStyle.bg}`}>
                {selectedAgent.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rarityStyle.text} ${rarityStyle.bg}`}>
                {selectedAgent.rarity}
              </span>
              <span className="text-xs text-white/40">
                {selectedAgent.gender}
              </span>
            </div>
          </div>
        </div>
        {selectedAgent.description && (
          <p className="text-xs text-white/60 mt-3">{selectedAgent.description}</p>
        )}
      </div>
      
      {/* Skin Tone Selection */}
      <div>
        <h3 className="text-sm font-orbitron text-white/80 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-400" />
          Skin Tone
        </h3>
        
        {/* Natural Tones */}
        <div className="mb-3">
          <p className="text-[10px] text-white/40 mb-2">Natural</p>
          <div className="flex gap-2 flex-wrap">
            {naturalTones.map((tone) => {
              const isSelected = tone.id === skinToneId;
              return (
                <motion.button
                  key={tone.id}
                  onClick={() => onSkinToneChange(tone.id)}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                    isSelected 
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-110' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: tone.color }}
                  whileTap={{ scale: 0.95 }}
                  title={tone.label}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white drop-shadow-lg" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Special Matte Tones */}
        <div>
          <p className="text-[10px] text-white/40 mb-2">Special</p>
          <div className="flex gap-2 flex-wrap">
            {specialTones.map((tone) => {
              const isSelected = tone.id === skinToneId;
              return (
                <motion.button
                  key={tone.id}
                  onClick={() => onSkinToneChange(tone.id)}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                    isSelected 
                      ? 'border-purple-400 ring-2 ring-purple-400/30 scale-110' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: tone.color }}
                  whileTap={{ scale: 0.95 }}
                  title={tone.label}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className={`w-4 h-4 ${tone.id === 'skin_black_matte' ? 'text-white' : 'text-black'} drop-shadow-lg`} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Info box */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-orbitron text-white/80">Your Active Agent</span>
        </div>
        <p className="text-xs text-white/60">
          Go to the <span className="text-purple-400 font-medium">Agents Shop</span> to unlock Special and Premium agents with M1U!
        </p>
      </div>
    </div>
  );
}
