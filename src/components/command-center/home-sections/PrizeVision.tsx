// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";
import "@/styles/landing-flip-cards.css";
import huracanImg from "@/assets/prizes/lamborghini-huracan.png";
import rolexImg from "@/assets/prizes/rolex-submariner.png";
import birkinImg from "@/assets/prizes/hermes-birkin.png";
import iphoneImg from "@/assets/prizes/iphone-16-pro-max.png";
import airpodsImg from "@/assets/prizes/airpods-max.png";

// M1SSION PRIZE - real assets from public/assets/m1ssion-prize
const missionPrizeImages = [
  "/assets/m1ssion-prize/hero-forest-watch.png",
  "/assets/m1ssion-prize/hero-forest-lambo.png",
  "/assets/m1ssion-prize/hero-forest-lambo-porsche.png",
  "/assets/m1ssion-prize/treasure-forest-car.png"
];

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress }: PrizeVisionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSwipeTransition, setIsSwipeTransition] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [flipped, setFlipped] = useState<number[]>([]);

  const handleSwipeLeft = () => {
    if (isSwipeTransition) return;
    setIsSwipeTransition(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % missionPrizeImages.length);
      setIsSwipeTransition(false);
    }, 150);
  };

  const prizes = [
    { name: "Lamborghini Huracán Experience", image: huracanImg, description: "🏎️ Lamborghini Huracán Experience — Un weekend adrenalina pura." },
    { name: "Rolex Submariner", image: rolexImg, description: "⌚ Rolex Submariner — Precisione e stile intramontabile." },
    { name: "Hermès Birkin", image: birkinImg, description: "👜 Hermès Birkin — Eleganza senza compromessi." },
    { name: "iPhone 16 Pro Max", image: iphoneImg, description: "📱 iPhone 16 Pro Max — Tecnologia all’avanguardia." },
    { name: "AirPods Max", image: airpodsImg, description: "🎧 AirPods Max — Immersivo, ovunque." }
  ];

  const toggleFlip = (index: number) => {
    setFlipped((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const layoutSpring = { layout: { type: "spring", stiffness: 160, damping: 22 } } as const;

  return (
    <LayoutGroup id="mission-prize-group">
      {/* COLLASSATO: il container RESTA lo stesso, con stripe e titolo */}
      <motion.div
        layoutId="missionPrize"
        className="w-full"
        style={{ visibility: isExpanded ? "hidden" : "visible" }}
        transition={layoutSpring}
      >
        <div 
          className="w-full relative overflow-hidden rounded-[24px]"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Animated glow strip like header */}
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
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
          `}</style>

          <div
            className="p-4 border-b border-white/10 flex justify-between items-center cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <h2 className="text-lg md:text-xl font-orbitron font-bold">
              <span className="text-[#00D1FF]" style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}>M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span> PRIZE</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70">Visibilità: {progress}%</span>
              <span className="text-xs text-white/50">({currentImageIndex + 1}/{missionPrizeImages.length})</span>
            </div>
          </div>

          <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
            {/* Swipeable Image Container */}
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
              {/* Swipe Indicator - M1SSION Style Arrow */}
              <motion.div 
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 backdrop-blur-md border border-[#00D1FF]/30 flex items-center justify-center"
                animate={{ 
                  x: [0, 8, 0],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]"
                >
                  <path 
                    d="M5 12H19M19 12L12 5M19 12L12 19" 
                    stroke="url(#arrowGradient)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="arrowGradient" x1="5" y1="12" x2="19" y2="12" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#00D1FF" />
                      <stop offset="100%" stopColor="#7B2EFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              {/* Disclaimer Overlay */}
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-[14px] md:text-[18px] font-medium">
                Image for illustrative purposes only
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ESPANSO: lo STESSO container si espande tra header (72px) e bottom nav (88px) dal CENTRO */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Container morphato: mantiene stripe e titolo; espansione dal centro */}
            <motion.div
              layoutId="missionPrize"
              className="fixed left-0 right-0 z-[101] prize-modal-container"
              style={{ top: 72, bottom: 88, transformOrigin: "center center" }}
              transition={layoutSpring}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 md:px-6 h-full max-w-screen-xl mx-auto">
                <div 
                  className="w-full h-full flex flex-col relative overflow-hidden rounded-[24px]"
                  style={{
                    background: 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Animated glow strip like header */}
                  <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                      style={{
                        animation: 'slideGlow 3s ease-in-out infinite',
                        width: '200%',
                        left: '-100%'
                      }}
                    />
                  </div>

                  {/* Header identico */}
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-orbitron font-bold">
                      <span className="text-[#00D1FF]" style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}>M1</span>
                      <span className="text-white">SSION<span className="text-xs align-top">™</span> PRIZE</span>
                    </h2>
                    <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white text-sm md:text-base">Chiudi</button>
                  </div>

                  {/* Contenuto scrollabile; click sugli spazi vuoti chiude (evento gestito dal parent overlay) */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="perspective-1000 h-64"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(index);
                          }}
                        >
                          <div
                            className={`mission-flip-card w-full h-full ${flipped.includes(index) ? "is-flipped" : ""}`}
                            style={{ transformOrigin: "center center" }}
                          >
                            {/* Front */}
                            <div className="mission-card-front absolute inset-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                              <img src={prize.image} alt={prize.name} className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <h3 className="font-orbitron text-base md:text-lg font-bold text-cyan-400">{prize.name}</h3>
                              </div>
                            </div>
                            {/* Back */}
                            <div className="mission-card-back absolute inset-0 rounded-xl p-6 bg-white/5 border border-white/10 flex items-center justify-center text-center">
                              <p className="text-white text-sm md:text-base leading-relaxed">{prize.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
