// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Command Center Home Component - RESET COMPLETO 17/07/2025

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BattleConsole } from "./home-sections/BattleConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import { BattleArenaOverlay } from "@/components/battle/BattleArenaOverlay";
import { useBattleOverlay } from "@/hooks/useBattleOverlay";
import { ActiveMissionBox } from "./home-sections/ActiveMissionBox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { getMissionDeadline, getMissionStartDate, calculateRemainingDays } from "@/utils/countdownDate";
import { usePrizeData } from "@/hooks/usePrizeData";
import { useBuzzPricing } from "@/hooks/useBuzzPricing";
import { useMissionStatus } from "@/hooks/useMissionStatus";
import { useAuth } from "@/hooks/use-auth";
import InviteFloatingButton from "@/components/home/InviteFloatingButton";
import DNAQuickAction from "@/components/dna/DNAQuickAction";
import { PULSE_ENABLED } from "@/config/featureFlags";

export default function CommandCenterHome() {
  // © 2025 Joseph MULÉ – M1SSION™ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025
  
  // Get real user data from Supabase
  const { user } = useAuth();
  const { userClues, loading: prizeLoading } = usePrizeData();
  const { userCluesCount } = useBuzzPricing(user?.id);
  const { missionStatus, loading: missionLoading } = useMissionStatus();
  
  // Battle overlay for deep-links
  const { battleId, isOpen, closeBattle } = useBattleOverlay();
  
  // 🧹 FORCE CLEAR ALL CACHE - RESET COMPLETO 17/07/2025
  useEffect(() => {
    // Clear ALL localStorage cache to force fresh data
    localStorage.removeItem("mission-progress");
    localStorage.removeItem("purchased-clues");
    localStorage.removeItem("diary-entries");
    localStorage.removeItem("user-credits");
    localStorage.removeItem("mission-data");
    localStorage.removeItem("clue-data");
    localStorage.removeItem("mission-08-06-2025"); // RIMUOVI MISSIONE PRECEDENTE
    localStorage.removeItem("timeline-08-06");
    localStorage.removeItem("old-mission-data");
    console.log("🧹 FULL CACHE CLEARED - RESET COMPLETO 17/07/2025");
  }, []);
  
  // Track the user's progress (FORCED TO REAL DATA)
  const [progress, setProgress] = useLocalStorage<number>("mission-progress", 0);
  
  // Track user's credits (RESET)
  const [credits, setCredits] = useLocalStorage<number>("user-credits", 1000);
  
  // Track purchased clues (RESET)
  const [purchasedClues, setPurchasedClues] = useLocalStorage<any[]>("purchased-clues", []);
  
  // Track diary entries (RESET)
  const [diaryEntries, setDiaryEntries] = useLocalStorage<any[]>("diary-entries", []);

  // Track prize unlock status
  const [prizeUnlockStatus, setPrizeUnlockStatus] = useState<"locked" | "partial" | "near" | "unlocked">("locked");

  // 🔥 NEW: USE REAL DATABASE MISSION STATUS - SISTEMA 200 INDIZI - RESET COMPLETO 21/07/2025
  const activeMission = missionStatus ? {
    id: missionStatus.id,
    title: missionStatus.title,
    totalClues: missionStatus.totalClues,
    foundClues: missionStatus.cluesFound,
    timeLimit: "48:00:00",
    startTime: missionStatus.startDate.toISOString(),
    remainingDays: missionStatus.daysRemaining,
    totalDays: missionStatus.totalDays,
    dailyLimit: 50 // 🔥 BUZZ GIORNALIERO MASSIMO 50
  } : {
    id: "M001",
    title: "M1SSION ONE",
    totalClues: 200,
    foundClues: 0,
    timeLimit: "48:00:00",
    startTime: "2025-07-17T00:00:00.000Z",
    remainingDays: 30,
    totalDays: 30,
    dailyLimit: 50
  };

  // 🔥 SYNC PROGRESS WITH REAL DATABASE DATA
  useEffect(() => {
    if (missionStatus) {
      const realProgress = missionStatus.progressPercent;
      setProgress(realProgress);
      
      console.log("🔥 MISSION SYNC FROM DATABASE (200 INDIZI - RESET 21/07/2025):", {
        foundClues: missionStatus.cluesFound,
        totalClues: missionStatus.totalClues,
        remainingDays: missionStatus.daysRemaining,
        startDate: missionStatus.startDate.toISOString(),
        progressPercent: missionStatus.progressPercent,
        state: missionStatus.state,
        dailyLimit: 50
      });
    }
  }, [missionStatus, setProgress]);

  // Update prize status based on progress and days remaining
  useEffect(() => {
    // Calculate visibility based on the provided algorithm
    const daysRemaining = activeMission.remainingDays;
    const objectivesPercentage = (activeMission.foundClues / activeMission.totalClues) * 100;
    const userScore = progress;
    
    console.log("🎯 PRIZE STATUS CALCULATION (200 INDIZI - RESET 17/07/2025):", {
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
        className="mb-6 w-full m1-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      <PrizeVision 
        progress={progress} 
        status={prizeUnlockStatus} 
      />
    </motion.div>

    {/* THE PULSE™ - Disabled (see featureFlags.ts) */}

{/* Floating Invite circle button in top-right */}
<InviteFloatingButton />

{/* DNA Quick Action below Invite */}
<DNAQuickAction />

    {/* Active Mission Box below the Prize Vision */}
      <motion.div 
        className="mb-6 m1-panel"
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

{/* Floating button handles invitations; removed inline list button */}


      {/* Two column layout for Battle Console and Agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - M1SSION BATTLE (Battle Console) */}
        <motion.div 
          className="order-2 md:order-1 m1-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BattleConsole />
        </motion.div>

        {/* Right Column - M1SSION AGENT (Agent Diary) */}
        <motion.div 
          className="order-3 md:order-2 m1-card"
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

      {/* Battle Arena Overlay - Opens for deep-links */}
      <BattleArenaOverlay
        battleId={battleId}
        open={isOpen}
        onClose={closeBattle}
      />
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™