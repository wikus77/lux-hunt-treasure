
import React from "react";
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";

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
        {/* Premium Porsche video - autoplay, muted, loop */}
        <video
          src="https://vkjrqirvdvjbemsfzxof.supabase.co/storage/v1/object/public/videos//20250612_0824_Rotating%20Porsche%20Showcase_simple_compose_01jxhcza4bfbatqkg8k84g20rj.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ borderRadius: '0' }}
        />
        
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
