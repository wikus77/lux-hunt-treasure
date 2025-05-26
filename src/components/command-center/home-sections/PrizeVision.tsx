
import React from "react";
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress, status }: PrizeVisionProps) {
  // Define blur level based on status
  const getBlurLevel = () => {
    switch (status) {
      case "locked": return "blur(12px)";
      case "partial": return "blur(8px)";
      case "near": return "blur(4px)";
      case "unlocked": return "blur(0px)";
      default: return "blur(12px)";
    }
  };

  return (
    <GradientBox className="w-full">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION™ PRIZE</span>
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70">Visibilità: {progress}%</span>
        </div>
      </div>
      
      <div className="relative h-60 sm:h-72 md:h-80 lg:h-96">
        {/* Prize image - car covered by cloth on red carpet */}
        <div 
          className="w-full h-full bg-center bg-contain bg-no-repeat transition-all duration-700"
          style={{ 
            backgroundImage: "url('/lovable-uploads/4c6e1a87-13cd-49d8-89dc-83704f46ebd5.png')", 
            filter: getBlurLevel(),
            backgroundPosition: "center",
          }}
        ></div>
        
        {/* Status overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {status === "locked" && (
            <motion.div 
              className="p-3 rounded-full bg-black/50 backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
          
          {status !== "locked" && status !== "unlocked" && (
            <div className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-center max-w-xs">
              <p className="text-white font-medium">
                {status === "partial" ? "Visibilità parziale. Acquista più indizi per sbloccare." : "Sei vicino! Ancora qualche indizio per la vittoria."}
              </p>
            </div>
          )}
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
