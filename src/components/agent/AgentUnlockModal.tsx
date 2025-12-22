/**
 * AGENT UNLOCK MODAL - Cinematic Full-Screen Reveal
 * Pixel-perfect recreation matching the original design
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AgentDefinition, 
  RARITY_STYLES
} from './agentCatalog';

interface AgentUnlockModalProps {
  isOpen: boolean;
  agent: AgentDefinition | null;
  agentCode: string;
  onClose: () => void;
  onConfirmSetActive: () => void;
}

// 3D Agent Model for unlock modal - Centered and scaled
function UnlockAgentModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Target height for cinematic display
    const targetHeight = 2.8;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    
    // Recalculate after scaling
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    
    // Center model perfectly
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y - 0.2; // Slight offset to center visually
    
    // Disable shadows for performance
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    
    return clone;
  }, [scene]);
  
  return <primitive object={clonedScene} />;
}

export function AgentUnlockModal({ 
  isOpen, 
  agent, 
  agentCode, 
  onClose, 
  onConfirmSetActive 
}: AgentUnlockModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  if (!agent) return null;
  
  const rarityStyle = RARITY_STYLES[agent.rarity];
  
  // Handle close and set active
  const handleClose = () => {
    onConfirmSetActive(); // Auto-set as active on close
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Full screen dark backdrop */}
          <div className="absolute inset-0 bg-[#0a0c14]" />
          
          {/* Close button - Fixed position, always accessible */}
          <motion.button
            onClick={handleClose}
            className="fixed z-[10010] p-3 rounded-full bg-black/60 border border-white/20 hover:bg-white/10 active:scale-95 transition-all"
            style={{ 
              top: 'max(16px, env(safe-area-inset-top))',
              right: '16px',
              minWidth: '48px', 
              minHeight: '48px',
              touchAction: 'manipulation'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
          
          {/* Main content container */}
          <div 
            className="relative w-full h-full flex flex-col"
            style={{
              paddingTop: 'max(16px, env(safe-area-inset-top))',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
            }}
          >
            {/* ═══════════════════════════════════════════════════════ */}
            {/* TOP SECTION - Code Label + Operator Code */}
            {/* ═══════════════════════════════════════════════════════ */}
            <motion.div 
              className="w-full px-4 pt-2 pb-3"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div 
                className="w-full rounded-2xl py-3 px-4 text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(30, 40, 60, 0.9) 0%, rgba(20, 30, 50, 0.95) 100%)',
                  border: '1px solid rgba(100, 120, 150, 0.3)'
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white/60 font-medium tracking-widest uppercase">CODE</span>
                </div>
                <p className="text-xl font-orbitron font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 200, 255, 0.5)' }}>
                  {agentCode}
                </p>
              </div>
            </motion.div>
            
            {/* ═══════════════════════════════════════════════════════ */}
            {/* CENTER - 3D Agent Viewer with Gold Border */}
            {/* ═══════════════════════════════════════════════════════ */}
            <motion.div 
              className="flex-1 px-4 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 20 }}
            >
              <div 
                className="w-full h-full max-h-[60vh] rounded-3xl overflow-hidden relative"
                style={{
                  background: 'linear-gradient(180deg, #0d1525 0%, #080d18 50%, #050810 100%)',
                  border: '3px solid',
                  borderImage: 'linear-gradient(180deg, rgba(234, 179, 8, 0.8) 0%, rgba(234, 179, 8, 0.4) 50%, rgba(234, 179, 8, 0.6) 100%) 1',
                  boxShadow: '0 0 40px rgba(234, 179, 8, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                  </div>
                )}
                
                {/* 3D Canvas */}
                <Canvas
                  camera={{ position: [0, 1, 5], fov: 32 }}
                  gl={{ 
                    antialias: true, 
                    alpha: true,
                    toneMappingExposure: 1.6,
                    toneMapping: THREE.ACESFilmicToneMapping
                  }}
                  onCreated={() => setIsLoading(false)}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    opacity: isLoading ? 0.2 : 1, 
                    transition: 'opacity 0.5s' 
                  }}
                >
                  {/* Cinematic lighting setup */}
                  <ambientLight intensity={1.5} color="#ffffff" />
                  <directionalLight position={[4, 5, 4]} intensity={2.0} color="#ffffff" />
                  <directionalLight position={[-4, 3, 3]} intensity={1.2} color="#e8e8ff" />
                  <directionalLight position={[0, 4, -5]} intensity={1.0} color="#eab308" />
                  <pointLight position={[0, 6, 0]} intensity={0.8} color="#ffffff" distance={12} />
                  <pointLight position={[0, -2, 3]} intensity={0.4} color="#eab308" distance={8} />
                  
                  <Suspense fallback={null}>
                    <UnlockAgentModel glbPath={agent.glbPath} />
                  </Suspense>
                  
                  <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    autoRotate={true}
                    autoRotateSpeed={1.8}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.2}
                    target={[0, 1, 0]}
                  />
                </Canvas>
                
                {/* Corner decorations */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-yellow-500/60" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-yellow-500/60" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-yellow-500/60" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-500/60" />
              </div>
            </motion.div>
            
            {/* ═══════════════════════════════════════════════════════ */}
            {/* BOTTOM - Agent Name + Rarity + Operator Code */}
            {/* ═══════════════════════════════════════════════════════ */}
            <motion.div 
              className="w-full px-4 pt-4 pb-2 text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {/* Agent Name */}
              <h1 
                className="text-2xl md:text-3xl font-orbitron font-bold text-yellow-400 mb-3"
                style={{ textShadow: '0 0 30px rgba(234, 179, 8, 0.6)' }}
              >
                {agent.name}
              </h1>
              
              {/* Rarity + Gender Tags */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span 
                  className={`text-sm px-4 py-1.5 rounded-full font-medium ${rarityStyle.text}`}
                  style={{ 
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)'
                  }}
                >
                  {agent.rarity}
                </span>
                <span 
                  className="text-sm px-4 py-1.5 rounded-full font-medium text-white/60"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {agent.gender}
                </span>
              </div>
              
              {/* Operator Code - Bottom */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/40 mb-1 tracking-wider">Operator Code</p>
                <p 
                  className="text-xl font-orbitron font-bold text-yellow-400"
                  style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}
                >
                  {agentCode}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
