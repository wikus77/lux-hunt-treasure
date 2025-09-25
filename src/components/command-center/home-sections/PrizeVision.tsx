
import React from "react";
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";
// Original M1SSION Prize Image - DO NOT REPLACE OR MODIFY
const missionPrizeImage = "/src/assets/placeholder-image.png";

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress, status }: PrizeVisionProps) {
  return (
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
        </div>
      </div>
      
      <div className="relative h-60 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
        {/* Luxury Forest Background Image */}
        <div className="relative w-full h-full">
          <img 
            src={missionPrizeImage}
            alt="M1SSION Lusso Foresta"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
          
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
  );
}
