
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMissionDeadline } from "@/utils/countdownDate";

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
}

export function PrizeVision({ progress, status }: PrizeVisionProps) {
  const [currentPrize] = useState({
    image: "/lovable-uploads/f7ebe6cb-8248-4002-bb84-b0e40781e72e.png" // Keep the Ferrari image but remove name
  });
  
  const [lastUnlockEvent, setLastUnlockEvent] = useLocalStorage<string | null>("last-unlock-event", null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  
  // Calculate days remaining until mission deadline
  const getDaysRemaining = () => {
    const deadline = getMissionDeadline();
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const daysRemaining = getDaysRemaining();
  const totalDays = 30; // Assuming 30 days total mission duration
  
  // Calculate visibility percentage based on algorithm in prompt
  const calculateVisibilityPercentage = () => {
    const objectivesPercentage = progress; // Using progress as objective completion
    const userScore = progress; // Using same value for simplicity
    
    if (daysRemaining <= 3) {
      // Last 3 days - full visibility (100%)
      return 100;
    } else {
      // Calculate partial visibility
      const partialVisibility = (objectivesPercentage * 0.4) + (userScore * 0.05);
      
      // Apply temporal limit for first 27 days (max 35%)
      return Math.min(partialVisibility, 35);
    }
  };
  
  // Visibility percentage from 0 to 100
  const visibilityPercentage = calculateVisibilityPercentage();
  
  // Generate filter settings based on visibility percentage
  const getImageFilters = () => {
    if (visibilityPercentage >= 100) {
      return "blur(0px) brightness(1) grayscale(0)";
    } else if (visibilityPercentage >= 35) {
      return "blur(2px) brightness(0.7) grayscale(0.3)";
    } else if (visibilityPercentage >= 20) {
      return "blur(5px) brightness(0.5) grayscale(0.5)";
    } else {
      return "blur(8px) brightness(0.3) grayscale(0.7)";
    }
  };
  
  // Generate radial revealing mask
  const getMaskGradient = () => {
    if (visibilityPercentage >= 100) return "none";
    
    const edgeVisibility = Math.min(100, visibilityPercentage * 1.5);
    const centerVisibility = Math.max(0, visibilityPercentage - 10);
    
    return `radial-gradient(
      circle at center, 
      rgba(0,0,0,${1 - centerVisibility/100}) ${visibilityPercentage}%, 
      rgba(0,0,0,${1 - edgeVisibility/100}) ${visibilityPercentage + 15}%, 
      rgba(0,0,0,0.9) 100%
    )`;
  };

  // Get status text
  const getStatusText = () => {
    if (daysRemaining <= 3) {
      return "PREMIO SBLOCCATO!";
    } else {
      return "PREMIO BLOCCATO";
    }
  };

  // Get help text below status
  const getHelpText = () => {
    if (daysRemaining <= 3) {
      return "Completa la missione per reclamarlo";
    } else {
      return "Completa gli obiettivi per sbloccare l'immagine";
    }
  };
  
  // Check for unlock level changes to trigger animations
  useEffect(() => {
    const currentUnlockLevel = 
      visibilityPercentage >= 100 ? "unlocked" :
      visibilityPercentage >= 35 ? "near" :
      visibilityPercentage >= 20 ? "partial" : "locked";
    
    const currentEvent = `${currentUnlockLevel}-${new Date().toDateString()}`;
    
    if (lastUnlockEvent !== currentEvent && currentUnlockLevel !== "locked") {
      setShowUnlockAnimation(true);
      setTimeout(() => setShowUnlockAnimation(false), 2000);
      setLastUnlockEvent(currentEvent);
    }
  }, [visibilityPercentage, lastUnlockEvent, setLastUnlockEvent]);

  return (
    <motion.div
      className="glass-card p-4 flex flex-col"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative aspect-[21/9] md:aspect-[16/5] w-full overflow-hidden rounded-lg">
        {/* Static base image - always visible but filtered */}
        <motion.img 
          src={currentPrize.image} 
          alt="Premio misterioso"
          className="w-full h-full object-cover"
          style={{ filter: getImageFilters() }}
          animate={{ 
            filter: getImageFilters()
          }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Revealing mask overlay */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: getMaskGradient(),
            opacity: visibilityPercentage >= 100 ? 0 : 1
          }}
          animate={{ 
            background: getMaskGradient(),
            opacity: visibilityPercentage >= 100 ? 0 : 1
          }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Edge glow effect for partial reveal */}
        {visibilityPercentage > 5 && visibilityPercentage < 100 && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{ 
              boxShadow: ["0 0 10px rgba(0,229,255,0.2) inset", "0 0 15px rgba(0,229,255,0.3) inset", "0 0 10px rgba(0,229,255,0.2) inset"]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        
        {/* Status overlay - center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center bg-black/50 px-8 py-4 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {getStatusText()}
            </h2>
            <p className="text-sm md:text-base text-gray-300">
              {getHelpText()}
            </p>
          </div>
        </div>
        
        {/* Countdown overlay for temporal limit */}
        {daysRemaining > 3 && (
          <div className="absolute top-3 right-3 bg-black/60 rounded-full px-3 py-1 text-xs text-white">
            Sblocco completo in: <span className="text-yellow-400 font-mono">{daysRemaining} giorni</span>
          </div>
        )}
        
        {/* Glowing border for unlocked state */}
        {visibilityPercentage >= 100 && (
          <motion.div 
            className="absolute inset-0 pointer-events-none border-2 border-yellow-400"
            animate={{ 
              boxShadow: ["0 0 10px rgba(250,204,21,0.5)", "0 0 20px rgba(250,204,21,0.8)", "0 0 10px rgba(250,204,21,0.5)"]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        
        {/* Unlock animation */}
        {showUnlockAnimation && (
          <motion.div 
            className="absolute inset-0 bg-yellow-400"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between mb-1 text-sm">
          <span>Progresso sblocco premio</span>
          <span className="font-bold">{Math.min(100, Math.round(visibilityPercentage))}%</span>
        </div>
        <Progress value={Math.min(100, visibilityPercentage)} className="h-2" />
      </div>
    </motion.div>
  );
}
