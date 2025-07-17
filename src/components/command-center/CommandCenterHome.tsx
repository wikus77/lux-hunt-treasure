
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Command Center Home Component

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BrokerConsole } from "./home-sections/BrokerConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import { ActiveMissionBox } from "./home-sections/ActiveMissionBox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { getMissionDeadline, getMissionStartDate, calculateRemainingDays } from "@/utils/countdownDate";
import { usePrizeData } from "@/hooks/usePrizeData";
import { useBuzzPricing } from "@/hooks/useBuzzPricing";
import { useAuth } from "@/hooks/use-auth";

export default function CommandCenterHome() {
  // 🔐 FIXED: REAL DATABASE SYNC - Joseph MULÉ CEO NIYVORA KFT™
  
  // Get real user data from Supabase
  const { user } = useAuth();
  const { userClues, loading: prizeLoading } = usePrizeData();
  const { userCluesCount } = useBuzzPricing(user?.id);
  
  // 🧹 CLEAR CACHE ON COMPONENT MOUNT - Force fresh data
  useEffect(() => {
    // Clear localStorage cache to force fresh data after reset
    localStorage.removeItem("mission-progress");
    localStorage.removeItem("purchased-clues");
    localStorage.removeItem("diary-entries");
    console.log("🧹 Cache cleared - forcing database sync");
  }, []);
  
  // Track the user's progress (from 0 to 100)
  const [progress, setProgress] = useLocalStorage<number>("mission-progress", 0);
  
  // Track user's credits
  const [credits, setCredits] = useLocalStorage<number>("user-credits", 1000);
  
  // Track purchased clues
  const [purchasedClues, setPurchasedClues] = useLocalStorage<any[]>("purchased-clues", []);
  
  // Track diary entries
  const [diaryEntries, setDiaryEntries] = useLocalStorage<any[]>("diary-entries", []);

  // Track prize unlock status
  const [prizeUnlockStatus, setPrizeUnlockStatus] = useState<"locked" | "partial" | "near" | "unlocked">("locked");

  // 🔥 REAL DATABASE MISSION DATA - CORRECTED TODAY 17/07/2025
  const [activeMission, setActiveMission] = useState({
    id: "M001",
    title: "Caccia al Tesoro Urbano",
    totalClues: 12,
    foundClues: userCluesCount || 0, // 🔥 REAL DATA FROM SUPABASE
    timeLimit: "48:00:00",
    startTime: "2025-07-17T00:00:00.000Z", // 🔥 MISSION START DATE CORRECTED
    remainingDays: calculateRemainingDays(), // 🔥 REAL CALCULATION
    totalDays: 30
  });

  // 🔥 REAL-TIME DATABASE SYNC - Update mission data when userClues changes
  useEffect(() => {
    const currentRemainingDays = calculateRemainingDays();
    console.log("🔥 MISSION SYNC - Updating mission data:", {
      foundClues: userCluesCount || 0,
      remainingDays: currentRemainingDays,
      startDate: "2025-07-17T00:00:00.000Z"
    });
    
    setActiveMission(prev => ({
      ...prev,
      foundClues: userCluesCount || 0, // 🔥 SYNC FROM SUPABASE
      remainingDays: currentRemainingDays, // 🔥 REAL CALCULATION
      startTime: "2025-07-17T00:00:00.000Z" // 🔥 FORCE CORRECT DATE
    }));
  }, [userCluesCount]);

  // Update prize status based on progress and days remaining
  useEffect(() => {
    // Calculate visibility based on the provided algorithm
    const daysRemaining = activeMission.remainingDays;
    const objectivesPercentage = (activeMission.foundClues / activeMission.totalClues) * 100;
    const userScore = progress;
    
    console.log("🎯 PRIZE STATUS CALCULATION:", {
      daysRemaining,
      objectivesPercentage,
      userScore,
      foundClues: activeMission.foundClues,
      totalClues: activeMission.totalClues
    });
    
    if (daysRemaining <= 3) {
      // Last 3 days - full visibility
      setPrizeUnlockStatus("unlocked");
    } else {
      // Calculate partial visibility
      const partialVisibility = (objectivesPercentage * 0.4) + (userScore * 0.05);
      
      // Apply temporal limit for first 27 days
      if (partialVisibility < 20) {
        setPrizeUnlockStatus("locked");
      } else if (partialVisibility < 35) {
        setPrizeUnlockStatus("partial");
      } else {
        setPrizeUnlockStatus("near");
      }
    }
  }, [progress, activeMission.foundClues, activeMission.totalClues, activeMission.remainingDays]);

  // Handle clue purchase
  const handlePurchaseClue = (clue) => {
    if (credits >= clue.cost) {
      // Deduct credits
      setCredits(prev => prev - clue.cost);
      
      // Add to purchased clues
      setPurchasedClues(prev => [...prev, clue]);
      
      // Add purchase to diary
      addDiaryEntry({
        type: "purchase",
        content: `Hai acquistato l'indizio ${clue.code}: "${clue.title}"`,
        timestamp: new Date().toISOString()
      });
      
      // Increase progress
      setProgress(prev => Math.min(100, prev + clue.progressValue));
      
      // Show toast notification
      toast.success("Indizio acquistato con successo!");
    } else {
      toast.error("Crediti insufficienti per acquistare questo indizio.");
    }
  };

  // Add diary entry
  const addDiaryEntry = (entry) => {
    setDiaryEntries(prev => [entry, ...prev]);
  };

  // Add personal note
  const addPersonalNote = (note) => {
    addDiaryEntry({
      type: "note",
      content: note,
      timestamp: new Date().toISOString()
    });
    toast.success("Nota aggiunta al diario");
  };

  return (
    <div className="w-full">
      {/* Full-width Prize Vision at the top */}
      <motion.div 
        className="mb-6 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PrizeVision 
          progress={progress} 
          status={prizeUnlockStatus} 
        />
      </motion.div>

      {/* Active Mission Box below the Prize Vision */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ActiveMissionBox 
          mission={activeMission} 
          purchasedClues={purchasedClues}
          progress={progress}
        />
      </motion.div>

      {/* Two column layout for Console and Agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - M1SSION CONSOLE (Broker Console) */}
        <motion.div 
          className="order-2 md:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BrokerConsole 
            credits={credits}
            onPurchaseClue={handlePurchaseClue} 
          />
        </motion.div>

        {/* Right Column - M1SSION AGENT (Agent Diary) */}
        <motion.div 
          className="order-3 md:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AgentDiary 
            entries={diaryEntries}
            onAddNote={addPersonalNote}
            purchasedClues={purchasedClues}
          />
        </motion.div>
      </div>
    </div>
  );
}
