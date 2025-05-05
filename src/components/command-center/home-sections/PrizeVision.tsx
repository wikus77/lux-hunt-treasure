
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress, status }: PrizeVisionProps) {
  const [currentPrize, setCurrentPrize] = useState({
    name: "Ferrari 488 GTB",
    image: "/events/ferrari-488-gtb.jpg"
  });

  // Generate filter settings based on unlock status
  const getImageFilters = () => {
    switch(status) {
      case "locked":
        return "blur(8px) brightness(0.3) grayscale(0.7)";
      case "partial":
        return "blur(5px) brightness(0.5) grayscale(0.5)";
      case "near":
        return "blur(2px) brightness(0.7) grayscale(0.3)";
      case "unlocked":
        return "blur(0px) brightness(1) grayscale(0)";
      default:
        return "blur(8px) brightness(0.3) grayscale(0.7)";
    }
  };

  // Get status text
  const getStatusText = () => {
    switch(status) {
      case "locked":
        return "Premio bloccato";
      case "partial":
        return "Segnale in acquisizione...";
      case "near":
        return "Premio quasi sbloccato";
      case "unlocked":
        return "PREMIO SBLOCCATO!";
      default:
        return "Premio bloccato";
    }
  };

  return (
    <motion.div
      className="glass-card p-4 h-full flex flex-col"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center mb-3">
        <Award className="text-yellow-400 mr-2" size={20} />
        <h2 className="text-lg font-medium text-yellow-400">Visione del Premio</h2>
      </div>

      <div className="horizontal-line mb-4"></div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="relative overflow-hidden rounded-lg w-full aspect-video">
          <motion.img 
            src={currentPrize.image} 
            alt={currentPrize.name}
            className="w-full h-full object-cover"
            style={{ filter: getImageFilters() }}
            animate={{ 
              filter: getImageFilters()
            }}
            transition={{ duration: 1.5 }}
          />
          
          {/* Prize name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-lg font-medium text-white">{currentPrize.name}</h3>
          </div>
          
          {/* Status overlay */}
          <motion.div 
            className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm ${
              status === "unlocked" ? "bg-green-900/30" : "bg-black/40"
            }`}
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: status === "unlocked" ? 0 : 0.7
            }}
            transition={{ duration: 1.5 }}
          >
            <span className={`text-xl font-bold ${
              status === "unlocked" ? "text-green-400" : "text-white"
            }`}>
              {getStatusText()}
            </span>
          </motion.div>
          
          {/* Glowing border for unlocked state */}
          {status === "unlocked" && (
            <motion.div 
              className="absolute inset-0 pointer-events-none border-2 border-yellow-400"
              animate={{ 
                boxShadow: ["0 0 10px rgba(250,204,21,0.5)", "0 0 20px rgba(250,204,21,0.8)", "0 0 10px rgba(250,204,21,0.5)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between mb-1 text-sm">
          <span>Progresso verso il premio</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </motion.div>
  );
}
