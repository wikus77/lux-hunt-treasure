
import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress, status }: PrizeVisionProps) {
  // Calculate blurring based on status
  const getBlurValue = () => {
    switch (status) {
      case "locked":
        return "blur-xl";
      case "partial":
        return "blur-lg";
      case "near":
        return "blur-sm";
      case "unlocked":
        return "";
      default:
        return "blur-xl";
    }
  };

  // Get the appropriate message based on status
  const getMessage = () => {
    switch (status) {
      case "locked":
        return "Premio bloccato";
      case "partial":
        return "Visione parziale";
      case "near":
        return "Quasi sbloccato";
      case "unlocked":
        return "Premio sbloccato";
      default:
        return "Premio bloccato";
    }
  };

  return (
    <div className="w-full bg-black/50 rounded-xl sm:rounded-2xl border border-projectx-deep-blue/50 overflow-hidden shadow-xl">
      {/* Progress indicator */}
      <div className="w-full h-1 bg-gray-900">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Countdown text - Positioned ABOVE the prize box */}
      <div className="pt-3 pb-1 px-4 text-center">
        <span className="text-white/70 text-sm font-medium">
          Sblocco completo in: <span className="text-cyan-400">45 giorni</span>
        </span>
      </div>

      <div className="relative overflow-hidden">
        {/* Prize image - blurred based on status */}
        <div className={`relative w-full h-36 sm:h-48 ${getBlurValue()} transition-all duration-500`}>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/lovable-uploads/ef3cb1c4-5fb4-4291-8191-720d84a8e7f3.png')", 
            }}
          />
        </div>

        {/* Overlay with status info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            className="bg-black/40 rounded-full p-4 backdrop-blur-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
          >
            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white/80" />
          </motion.div>
          
          <span className="mt-3 font-bold text-xl sm:text-2xl text-white text-center backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
            {getMessage()}
          </span>
        </div>
      </div>
    </div>
  );
}
