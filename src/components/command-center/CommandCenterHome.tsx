// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Command Center Home Component - RESET COMPLETO 17/07/2025

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
import { useMissionStatus } from "@/hooks/useMissionStatus";
import { useAuth } from "@/hooks/use-auth";
import { InviteFriendButton } from "@/components/xp/InviteFriendButton";

export default function CommandCenterHome() {
  // © 2025 Joseph MULÉ – M1SSION™ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025
  
  // Get real user data from Supabase
  const { user } = useAuth();
  const { userClues, loading: prizeLoading } = usePrizeData();
  const { userCluesCount } = useBuzzPricing(user?.id);
  const { missionStatus, loading: missionLoading } = useMissionStatus();
  
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
    title: "Caccia al Tesoro Urbano",
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

      {/* Invite Friend Button */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <InviteFriendButton />
      </motion.div>

      {/* © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Consolidated Dynamic Clues Container */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <div className="glass-card p-6 rounded-xl">
          {/* Dynamic Progress Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">🧩 Indizi trovati: {userClues?.length || 0}/200</h3>
            <span className="text-sm text-white/60">
              {Math.round(((userClues?.length || 0) / 200) * 100)}% completato
            </span>
          </div>
          
          {/* Dynamic Progress Bar with Color Progression */}
          <div className="mb-6">
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  ((userClues?.length || 0) / 200) * 100 < 30 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                    : ((userClues?.length || 0) / 200) * 100 < 70
                    ? 'bg-gradient-to-r from-blue-400 to-green-400'
                    : 'bg-gradient-to-r from-green-400 to-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((userClues?.length || 0) / 200) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Clues Display */}
          {!userClues || userClues.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <p>Nessun indizio trovato oggi.</p>
              <p className="text-sm mt-2">Premi BUZZ per scoprire nuovi indizi!</p>
              <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <p className="text-xs text-blue-300">💡 Gli indizi BUZZ verranno visualizzati qui dopo ogni utilizzo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userClues.map((clue, index) => (
                <motion.div
                  key={clue.clue_id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{clue.title_it}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        {new Date(clue.created_at).toLocaleDateString('it-IT')}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                        {clue.clue_type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-3">
                    {clue.description_it}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">
                      ✅ Costo: €{(clue.buzz_cost / 100).toFixed(2)}
                    </span>
                    <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg border border-blue-500/30 transition-colors">
                      📍 Visualizza
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
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