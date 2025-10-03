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

export function PrizeVision({ progress, status }: PrizeVisionProps) {
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
    setFlipped(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  return (
    <>
      {/* COLLAPSED: stesso container M1SSION PRIZE con morph all'espanso */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div
            key="collapsed"
            layoutId="missionPrize"
            className="w-full"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GradientBox className="w-full">
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
                  
                  {/* Swipe Indicator */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                    Tocca per il prossimo →
                  </div>
                  
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
            </GradientBox>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESPANSO: overlay full-screen tra header e bottom, click fuori dalle card per chiudere */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div key="overlay" className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsExpanded(false)} />

            {/* container morphato dal layoutId */}
            <motion.div layoutId="missionPrize" className="relative z-10 mx-4 md:mx-6 mt-4 mb-[calc(env(safe-area-inset-bottom)+72px)]">
              <GradientBox className="w-full">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-orbitron font-bold">
                    <span className="text-[#00D1FF]" style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}>M1</span>
                    <span className="text-white">SSION<span className="text-xs align-top">™</span> PRIZE</span>
                  </h2>
                  <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white text-sm md:text-base">Chiudi</button>
                </div>

                {/* area scrollabile - click su quest'area (spazi vuoti) chiude */}
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-10rem)]" onClick={() => setIsExpanded(false)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onClick={(e) => e.stopPropagation()}>
                    {prizes.map((prize, index) => (
                      <div 
                        key={index} 
                        className="perspective-1000 h-64"
                        onClick={(e) => { e.stopPropagation(); toggleFlip(index); }}
                      >
                        <div 
                          className={`mission-flip-card w-full h-full ${flipped.includes(index) ? 'is-flipped' : ''}`}
                          style={{ transformOrigin: 'center center' }}
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
              </GradientBox>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}