// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";
import MonthlyPrizesModal from "./MonthlyPrizesModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSwipeLeft = () => {
    if (isSwipeTransition) return;
    setIsSwipeTransition(true);
    
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % missionPrizeImages.length);
      setIsSwipeTransition(false);
    }, 150);
  };

  return (
    <>
      <div className="w-full cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <GradientBox className="w-full">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
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
      </div>

      <MonthlyPrizesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}