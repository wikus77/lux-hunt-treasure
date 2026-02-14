// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "@/styles/landing-flip-cards.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getAgentById, getDefaultAgent } from "@/components/agent/agentCatalog";
import { useLongPress } from "@/hooks/useLongPress";
import { LongPressInfoModal } from "@/components/ui/LongPressInfoModal";
import { Gift, Trophy, Car, Diamond, Sparkles, Smartphone } from "lucide-react";

// M1SSION PRIZE - real assets from public/assets/prizes (percorsi reali)
const missionPrizeImages = [
  "/assets/prizes/auto-reali/ AUTO NASCOSTA.png",
  "/assets/prizes/auto-reali/PORSCHE_CAYENNE_COUPE.png",
  "/assets/prizes/99premi/APPLE WATCH_ULTRA.png",
  "/assets/prizes/99premi/IPAD_PRO.png",
  "/assets/prizes/gioielli-reali/collana_pietra.png",
  "/assets/prizes/gioielli-reali/ANELLO_04.png",
  "/assets/prizes/orologi-reali/PANERAI.png",
  "/assets/prizes/orologi-reali/ROLEX SUBMARINER-ORO.png",
  "/assets/prizes/borse-reali/CHANEL.png",
  "/assets/prizes/borse-reali/HERMES_BIRKIN_COCCODRILLO.png"
];

interface PrizeVisionProps {
  progress: number;
  status?: "locked" | "partial" | "near" | "unlocked";
}

// Mini 3D Agent for Decryption Room
function MiniAgentModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Scale to fit in small viewer
    const targetHeight = 2.0;
    const scaleFactor = targetHeight / size.y;
    clone.scale.setScalar(scaleFactor);
    
    // Recalculate after scaling
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    
    // Center model
    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y;
    
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

export function PrizeVision({ progress }: PrizeVisionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const safeProgress = Number.isFinite(progress) && typeof progress === "number" ? progress : 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSwipeTransition, setIsSwipeTransition] = useState(false);
  const [isDecryptionMode, setIsDecryptionMode] = useState(false);
  const [selectedAgentGlb, setSelectedAgentGlb] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [agentCode, setAgentCode] = useState<string>('AG-XXXX');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const longPressTargetRef = useRef<HTMLDivElement>(null);
  
  const longPressHandlers = useLongPress(() => {
    const rect = longPressTargetRef.current?.getBoundingClientRect() ?? null;
    setOriginRect(rect);
    setShowInfoModal(true);
  }, {
    threshold: 500,
    hapticFeedback: true,
  });

  // Load selected agent for Decryption Room
  useEffect(() => {
    const loadAgent = async () => {
      if (!user?.id) {
        // Use default agent
        const defaultAgent = getDefaultAgent();
        setSelectedAgentGlb(defaultAgent.glbPath);
        setAgentName(defaultAgent.name);
        return;
      }

      try {
        // Try localStorage first
        const localData = localStorage.getItem(`agent_customization_v2_${user.id}`);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed.selectedAgentId) {
              const agent = getAgentById(parsed.selectedAgentId);
              if (agent) {
                setSelectedAgentGlb(agent.glbPath);
                setAgentName(agent.name);
              }
            }
          } catch (e) {
            // Fallback to default
            const defaultAgent = getDefaultAgent();
            setSelectedAgentGlb(defaultAgent.glbPath);
            setAgentName(defaultAgent.name);
          }
        } else {
          const defaultAgent = getDefaultAgent();
          setSelectedAgentGlb(defaultAgent.glbPath);
          setAgentName(defaultAgent.name);
        }

        // Try to load agent code from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('agent_code, agent_customization')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.agent_code) {
          setAgentCode(profile.agent_code);
        }

        // Check Supabase for more up-to-date data
        if (profile?.agent_customization) {
          const dbData = profile.agent_customization as { selectedAgentId?: string };
          if (dbData.selectedAgentId) {
            const agent = getAgentById(dbData.selectedAgentId);
            if (agent) {
              setSelectedAgentGlb(agent.glbPath);
              setAgentName(agent.name);
            }
          }
        }
      } catch (err) {
        console.error('[PrizeVision] Error loading agent:', err);
        const defaultAgent = getDefaultAgent();
        setSelectedAgentGlb(defaultAgent.glbPath);
        setAgentName(defaultAgent.name);
      }
    };

    loadAgent();

    // Listen for agent updates
    const handleAgentChange = () => loadAgent();
    window.addEventListener('agent-customization-updated', handleAgentChange);
    return () => window.removeEventListener('agent-customization-updated', handleAgentChange);
  }, [user?.id]);

  // Handle image cycling - preserved behavior
  const handleSwipeLeft = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isSwipeTransition || isDecryptionMode) return;
    setIsSwipeTransition(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % missionPrizeImages.length);
      setIsSwipeTransition(false);
    }, 150);
  };

  // Toggle Decryption Room flip
  const toggleDecryptionMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDecryptionMode(prev => !prev);
  };

  // Card container styles (shared between front and back) — DARK GLASS EFFECT (BLACK OPS)
  const cardContainerStyles: React.CSSProperties = {
    background: 'linear-gradient(160deg, rgba(8, 12, 20, 0.95) 0%, rgba(12, 18, 28, 0.92) 50%, rgba(8, 12, 20, 0.95) 100%)',
    backdropFilter: 'blur(24px) saturate(150%)',
    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
    border: 'none', // Border handled by parent wrapper
    boxShadow: `
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 30px rgba(0, 209, 255, 0.04)
    `
  };

  return (
    <div className="w-full">
      {/* 3D Flip Wrapper with Long Press for Info */}
      <div 
        ref={longPressTargetRef}
        className="m1-prize-flip-wrapper"
        style={{ perspective: '1200px' }}
        {...longPressHandlers}
      >
        <div 
          className={`m1-prize-flip-inner ${isDecryptionMode ? 'is-flipped' : ''}`}
          style={{
            position: 'relative',
            width: '100%',
            height: 'auto',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: isDecryptionMode ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FRONT FACE - Prize Vision (Original Content) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="m1-prize-face m1-prize-front"
            style={{
              width: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              position: 'relative',
              zIndex: isDecryptionMode ? 0 : 1
            }}
          >
            <div 
              className="w-full relative overflow-hidden rounded-[24px]"
              style={cardContainerStyles}
            >
              {/* Animated glow strip */}
              <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-10">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                  style={{
                    animation: 'slideGlow 3s ease-in-out infinite',
                    width: '200%',
                    left: '-100%'
                  }}
                />
              </div>
              <style>{`
                @keyframes slideGlow {
                  0% { transform: translateX(0); }
                  50% { transform: translateX(50%); }
                  100% { transform: translateX(0); }
                }
                @keyframes pulseNeon {
                  0%, 100% { opacity: 0.4; filter: blur(2px); }
                  50% { opacity: 0.8; filter: blur(4px); }
                }
                @keyframes scanLine {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(100%); }
                }
                @keyframes dataStream {
                  0% { transform: translateY(0); opacity: 0.3; }
                  50% { opacity: 0.7; }
                  100% { transform: translateY(-20px); opacity: 0.3; }
                }
                @keyframes cubeRotate {
                  0% { transform: rotateX(0deg) rotateY(0deg); }
                  25% { transform: rotateX(90deg) rotateY(90deg); }
                  50% { transform: rotateX(180deg) rotateY(180deg); }
                  75% { transform: rotateX(270deg) rotateY(270deg); }
                  100% { transform: rotateX(360deg) rotateY(360deg); }
                }
              `}</style>

              {/* Header - Clickable for Flip */}
              <div
                className="p-4 border-b border-cyan-500/20 flex justify-between items-center cursor-pointer select-none"
                onClick={toggleDecryptionMode}
              >
                <h2 className="text-lg md:text-xl font-orbitron font-bold">
                  {/* 🎨 M1 CYAN + SSION BIANCO + PRIZE BIANCO - ALTA VISIBILITÀ */}
                  <span style={{ color: '#00D1FF', textShadow: '0 0 12px rgba(0, 209, 255, 0.7)' }}>M1</span>
                  <span style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(255, 255, 255, 0.4)' }}>SSION<span className="text-xs align-top">™</span> PRIZE</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{t('home_prize_visibility', { progress: safeProgress })}</span>
                  <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>({currentImageIndex + 1}/{missionPrizeImages.length})</span>
                  {/* Flip indicator icon */}
                  <motion.div 
                    className="ml-2 w-6 h-6 rounded-full bg-[#0088AA]/20 border border-[#0088AA]/50 flex items-center justify-center"
                    animate={{ rotateY: [0, 180, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="#0088AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Image Container - Tap cycles images */}
              <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={handleSwipeLeft}
                  onTouchStart={handleSwipeLeft}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <img
                        src={missionPrizeImages[currentImageIndex]}
                        alt={`M1SSION Prize ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Swipe Indicator Arrow */}
                  <motion.div 
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 backdrop-blur-md border border-[#00D1FF]/30 flex items-center justify-center"
                    animate={{ x: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="url(#arrowGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="arrowGradient" x1="5" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#00D1FF" />
                          <stop offset="100%" stopColor="#7B2EFF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  {/* Disclaimer Overlay */}
                  <div 
                    className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[14px] md:text-[18px] font-medium"
                    style={{
                      background: 'linear-gradient(90deg, #FFFFFF 0%, #A0A0A0 50%, #808080 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Image for illustrative purposes only
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                  <div className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF]" style={{ width: `${safeProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* BACK FACE - THE DECRYPTION ROOM™ */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div 
            className="m1-prize-face m1-prize-back"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              zIndex: isDecryptionMode ? 1 : 0
            }}
          >
            <div 
              className="w-full h-full relative overflow-hidden rounded-[24px]"
              style={{
                ...cardContainerStyles,
                background: 'linear-gradient(160deg, rgba(5, 15, 35, 0.98) 0%, rgba(0, 5, 20, 0.99) 50%, rgba(5, 15, 30, 0.98) 100%)'
              }}
            >
              {/* Animated glow strip - green/cyan theme for decryption */}
              <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-10">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70"
                  style={{
                    animation: 'slideGlow 2s ease-in-out infinite',
                    width: '200%',
                    left: '-100%'
                  }}
                />
              </div>

              {/* Scan line effect */}
              <div 
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ opacity: 0.1 }}
              >
                <div 
                  className="w-full h-8 bg-gradient-to-b from-transparent via-emerald-400 to-transparent"
                  style={{ animation: 'scanLine 4s linear infinite' }}
                />
              </div>

              {/* Header - Clickable for Flip Back */}
              <div
                className="p-4 border-b border-emerald-500/20 flex justify-between items-center cursor-pointer select-none"
                onClick={toggleDecryptionMode}
              >
                <h2 className="text-lg md:text-xl font-orbitron font-bold tracking-wider">
                  <span className="text-emerald-400" style={{ textShadow: "0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.3)" }}>DECRYPTION</span>
                  <span className="text-white/90"> ROOM</span>
                  <span className="text-emerald-400 text-xs align-top ml-1">™</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-emerald-400/80 font-mono">STATUS: ACTIVE</span>
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Decryption Content */}
              <div className="p-4 h-[calc(100%-4rem)] flex flex-col justify-between overflow-hidden">
                {/* Subtitle */}
                <div className="text-center mb-2">
                  <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
                    Decryption status for this M1SSION PRIZE
                  </p>
                </div>

                {/* Layout: Agent on left, Holographic Cube on right */}
                <div className="flex-1 flex items-center justify-center gap-4">
                  
                  {/* 3D Agent Viewer - Left side */}
                  {selectedAgentGlb && (
                    <div className="relative flex-shrink-0">
                      <div 
                        className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl border overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 20, 40, 0.9) 100%)',
                          borderColor: 'rgba(16, 185, 129, 0.4)',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 15px rgba(16, 185, 129, 0.1)'
                        }}
                      >
                        <Canvas
                          camera={{ position: [0, 0.5, 3.5], fov: 35 }}
                          gl={{ 
                            antialias: true, 
                            alpha: true,
                            powerPreference: 'low-power',
                            toneMappingExposure: 1.3,
                            toneMapping: THREE.ACESFilmicToneMapping
                          }}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <ambientLight intensity={1.2} color="#ffffff" />
                          <directionalLight position={[2, 3, 2]} intensity={1.5} color="#ffffff" />
                          <directionalLight position={[-2, 1, 2]} intensity={0.8} color="#10B981" />
                          
                          <Suspense fallback={null}>
                            <MiniAgentModel glbPath={selectedAgentGlb} />
                          </Suspense>
                          
                          <OrbitControls
                            enablePan={false}
                            enableZoom={false}
                            autoRotate={true}
                            autoRotateSpeed={1.5}
                            minPolarAngle={Math.PI / 3}
                            maxPolarAngle={Math.PI / 2}
                            target={[0, 0.7, 0]}
                          />
                        </Canvas>
                      </div>
                      {/* Agent Label */}
                      <div className="absolute -bottom-6 left-0 right-0 text-center">
                        <p className="text-[9px] text-emerald-400/80 font-mono truncate">{agentName}</p>
                        <p className="text-[8px] text-cyan-400/60 font-mono">{agentCode}</p>
                      </div>
                    </div>
                  )}

                  {/* Holographic Cube - Right side */}
                  <div className="relative">
                    {/* Outer glow rings */}
                    <motion.div 
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                        width: '140px',
                        height: '140px',
                        marginLeft: '-20px',
                        marginTop: '-20px'
                      }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Holographic Cube */}
                    <div 
                      className="relative w-24 h-24 sm:w-28 sm:h-28"
                      style={{ 
                        perspective: '400px',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <motion.div
                        className="w-full h-full"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: 'rotateX(-20deg) rotateY(-20deg)'
                        }}
                        animate={{
                          rotateY: [0, 360],
                          rotateX: [-20, -20]
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        {/* Cube faces */}
                        <div 
                          className="absolute inset-0 border-2 border-emerald-400/60 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 209, 255, 0.1) 100%)',
                            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.1)'
                          }}
                        >
                          {/* Encrypted symbol inside */}
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-orbitron font-bold text-emerald-400/80" style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.8)' }}>
                              ?
                            </span>
                          </div>
                        </div>

                        {/* Grid overlay */}
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
                            backgroundSize: '12px 12px'
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Floating data particles */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-emerald-400/60 font-mono text-[9px]"
                        style={{
                          left: `${20 + (i * 25)}%`,
                          top: `${15 + (i % 2) * 50}%`
                        }}
                        animate={{
                          y: [-5, 5, -5],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                          duration: 2 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        {['0x7F', 'Ω-4', '◊◊◊', '░▒▓'][i]}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decryption Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/60 font-mono">DECRYPTION PROGRESS</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">{safeProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-emerald-500/30">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #10B981 0%, #00D1FF 50%, #7B2EFF 100%)',
                        width: `${safeProgress}%`,
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
                      }}
                      animate={{
                        boxShadow: ['0 0 10px rgba(16, 185, 129, 0.4)', '0 0 20px rgba(16, 185, 129, 0.8)', '0 0 10px rgba(16, 185, 129, 0.4)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>

                {/* Terminal-style Log Output */}
                <div 
                  className="bg-black/60 rounded-lg p-3 border border-emerald-500/20 font-mono text-xs space-y-1.5 overflow-hidden"
                  style={{ maxHeight: '120px' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{">"}</span>
                    <span className="text-white/80">Encryption level:</span>
                    <span className="text-[#FF6B35] font-bold">OMEGA-4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{">"}</span>
                    <span className="text-white/80">Signal source:</span>
                    <span className="text-cyan-400">UNKNOWN SECTOR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{">"}</span>
                    <span className="text-white/80">Integrity:</span>
                    <motion.span 
                      className="text-emerald-400 font-bold"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      STABLE
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{">"}</span>
                    <span className="text-white/80">Next decryption window:</span>
                    <span className="text-purple-400">TBA</span>
                  </div>
                </div>

                {/* Bottom Label */}
                <div className="mt-3 text-center">
                  <motion.p 
                    className="text-xs text-white/40 font-mono uppercase tracking-wider cursor-pointer"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    onClick={toggleDecryptionMode}
                  >
                    ◄ Tap header to return to prize view ►
                  </motion.p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Long Press Info Modal - NOTE-style, i18n, no brands */}
      <LongPressInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        originRect={originRect}
        title={t('mapLongPress.prize.title')}
        subtitle={t('mapLongPress.prize.subtitle')}
        accentColor="#00D1FF"
        content={
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">{t('mapLongPress.prize.poolTitle')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.poolDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Car className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-semibold text-cyan-400">{t('mapLongPress.prize.categoryPrestige')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.categoryPrestigeDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Diamond className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-purple-400">{t('mapLongPress.prize.categoryRare')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.categoryRareDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-400">{t('mapLongPress.prize.categoryExperiences')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.categoryExperiencesDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-semibold text-blue-400">{t('mapLongPress.prize.categoryTech')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.categoryTechDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Gift className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">{t('mapLongPress.prize.categorySpecial')}</p>
                <p className="text-white/90 text-sm">{t('mapLongPress.prize.categorySpecialDesc')}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <p className="text-sm text-white/90">
                {t('mapLongPress.prize.progress')}: <span className="text-yellow-400 font-bold">{safeProgress}%</span>
              </p>
              <p className="text-xs text-white/70 mt-1">{t('mapLongPress.prize.swipeHint')}</p>
            </div>
          </div>
        }
      />
    </div>
  );
}
