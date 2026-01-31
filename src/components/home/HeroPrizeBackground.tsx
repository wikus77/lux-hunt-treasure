// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// HeroPrizeBackground - Full-screen prize images like Revolut purple background
// Tap to change images, gradient fade to white at bottom

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// M1SSION PRIZE - real assets from public/assets/prizes
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

interface HeroPrizeBackgroundProps {
  autoChangeInterval?: number; // milliseconds, default 5000
  height?: string; // CSS height, default "55vh"
}

export function HeroPrizeBackground({ 
  autoChangeInterval = 5000,
  height = "55vh" 
}: HeroPrizeBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-change images
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prev) => (prev + 1) % missionPrizeImages.length);
          setIsTransitioning(false);
        }, 150);
      }
    }, autoChangeInterval);

    return () => clearInterval(interval);
  }, [autoChangeInterval, isTransitioning]);

  // Tap to change image
  const handleTap = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % missionPrizeImages.length);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  return (
    <div 
      className="hero-prize-background"
      onClick={handleTap}
      style={{
        position: 'absolute', // ABSOLUTE - scrolls with page content
        top: 'calc(-1 * env(safe-area-inset-top, 47px))', // Start ABOVE safe area
        left: 0,
        right: 0,
        width: '100%',
        height: `calc(${height} + env(safe-area-inset-top, 47px))`, // Extend height to cover safe area
        overflow: 'hidden',
        zIndex: 1, // Above page background, below content
        cursor: 'pointer',
      }}
    >
      {/* Image Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <img
            src={missionPrizeImages[currentImageIndex]}
            alt={`M1SSION Prize ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center top',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay for text readability on top */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 50%)',
        }}
      />

      {/* Gradient fade to white at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.85) 70%, #FFFFFF 100%)',
        }}
      />

      {/* Image indicator dots */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10"
        style={{ pointerEvents: 'none' }}
      >
        {missionPrizeImages.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white w-3 shadow-lg' 
                : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Tap hint - subtle */}
      <motion.div
        className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export default HeroPrizeBackground;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
