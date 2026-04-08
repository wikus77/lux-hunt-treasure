// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - Command Center Home Component - RESET COMPLETO 17/07/2025

import React, { useState, useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 CRITICAL FIX: Lazy load PrizeVision to prevent THREE.js hook errors during navigation
const PrizeVision = lazy(() => import("./home-sections/PrizeVision").then(m => ({ default: m.PrizeVision })));

// Fallback component while PrizeVision loads (uses t from parent to avoid hook in static component)
const PrizeVisionFallback = ({ loadingLabel }: { loadingLabel: string }) => (
  <div className="w-full h-48 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl animate-pulse flex items-center justify-center">
    <div className="text-white/40 text-sm">{loadingLabel}</div>
  </div>
);
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
import { useAuthContext } from "@/contexts/auth";
import InviteFloatingButton from "@/components/home/InviteFloatingButton";
// DNAQuickAction RIMOSSO - sostituito con AgentEnergyPill migliorato
import { PULSE_ENABLED } from "@/config/featureFlags";
import { PulseBarPersonal, AgentEnergyPill } from "@/features/pulse";

export interface CommandCenterHomeProps {
  /** AppHome-only: hide in-page “Tempo rimasto” card (ActiveMissionBox); floating Time pill unaffected. */
  hideScrollMissionStatusCard?: boolean;
  /** AppHome-only: hide in-page M1SSION BATTLE card; floating Battle pill + overlays unaffected. */
  hideScrollBattleCard?: boolean;
  /** AppHome-only: hide in-page M1SSION AGENT glass container (`AgentDiary`); floating Agent pill on play surface unaffected. */
  hideScrollAgentContainer?: boolean;
  /** AppHome-only: hide green PE gain chips + stack invite + rank pill above bottom nav */
  hidePeGainBadgeUi?: boolean;
}

export default function CommandCenterHome({
  hideScrollMissionStatusCard = false,
  hideScrollBattleCard = false,
  hideScrollAgentContainer = false,
  hidePeGainBadgeUi = false,
}: CommandCenterHomeProps = {}) {
  // © 2025 Joseph MULÉ – M1SSION™ - SISTEMA 200 INDIZI - RESET COMPLETO 17/07/2025
  
  // Get real user data from Supabase
  const { user } = useAuthContext();
  const { userClues, loading: prizeLoading } = usePrizeData();
  const { userCluesCount } = useBuzzPricing(user?.id);
  const { missionStatus, loading: missionLoading } = useMissionStatus();
  
  // Battle overlay for deep-links
  const { battleId, isOpen, closeBattle } = useBattleOverlay();
  
  // 🚀 PERFORMANCE FIX: Cache clearing DISABLED - was causing slow loads
  // Old code cleared cache on EVERY mount, forcing DB refetch each time
  // Now relies on proper cache invalidation when data actually changes
  
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
    totalClues: 250, // 🔥 FIX: 250 indizi totali
    foundClues: 0,
    timeLimit: "48:00:00",
    startTime: "2025-11-26T00:00:00.000Z", // 🔥 FIX: Data corretta
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

  // 🔧 FIX: Listen for mission reset to clear ALL cached data (NO RELOAD - just clear state)
  useEffect(() => {
    const handleMissionReset = () => {
      console.log('🔄 [CommandCenterHome] Mission reset - clearing local state...');
      // Reset all local state - NO RELOAD
      setProgress(0);
      setPurchasedClues([]);
      setDiaryEntries([]);
      setCredits(1000);
      setPrizeUnlockStatus("locked");
    };

    window.addEventListener('missionLaunched', handleMissionReset);
    window.addEventListener('missionReset', handleMissionReset);
    window.addEventListener('mission:reset', handleMissionReset);

    return () => {
      window.removeEventListener('missionLaunched', handleMissionReset);
      window.removeEventListener('missionReset', handleMissionReset);
      window.removeEventListener('mission:reset', handleMissionReset);
    };
  }, [setProgress, setPurchasedClues, setDiaryEntries, setCredits]);

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
      {/* 🆕 PrizeVision moved to AppHome for Revolut-style layout */}

    {/* THE PULSE™ - Personal Energy Bar (PE per utente) */}
    {PULSE_ENABLED && (
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <PulseBarPersonal variant="inline" hidePeGainBadge={hidePeGainBadgeUi} />
      </motion.div>
    )}

{/* Invite + Rank: stacked above BottomNav — no overlap between invite orb and PE pill */}
<div
  className="fixed z-[70] flex flex-col items-end gap-3 pointer-events-none"
  style={{
    right: 'max(16px, env(safe-area-inset-right, 0px))',
    bottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 10px)',
  }}
>
  <div className="pointer-events-auto">
    <InviteFloatingButton layout="stacked" />
  </div>
  {PULSE_ENABLED && (
    <div data-onboarding="rank-pill" className="pointer-events-auto">
      <AgentEnergyPill hidePeGainBadge={hidePeGainBadgeUi} />
    </div>
  )}
</div>


    {/* ═══════════════════════════════════════════════════════════════ */}
    {/* M1SSION AGENT - BLACK GLASS + WHITE MICRO-ENERGY */}
    {/* ═══════════════════════════════════════════════════════════════ */}
    <div 
      className={`card-glass-white-energy${hideScrollAgentContainer ? ' hidden' : ''}`}
      aria-hidden={hideScrollAgentContainer ? true : undefined}
      data-m1-home-section="scroll-agent-diary"
      style={{
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '16px',
        /* BLACK GLASS background - deeper */
        background: `linear-gradient(160deg, 
          rgba(10, 10, 12, 0.82) 0%, 
          rgba(12, 14, 20, 0.78) 50%, 
          rgba(10, 10, 12, 0.82) 100%
        )`,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        padding: '16px',
        /* WHITE MICRO-ENERGY BORDER */
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
          0 0 20px rgba(255, 255, 255, 0.08),
          0 0 40px rgba(255, 255, 255, 0.04),
          0 4px 28px rgba(0, 0, 0, 0.5),
          inset 0 0 24px rgba(255, 255, 255, 0.03),
          inset 0 1px 0 rgba(255, 255, 255, 0.06)
        `,
      }}
    >
      <motion.div 
        data-section="agent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AgentDiary />
      </motion.div>
    </div>

    {/* ═══════════════════════════════════════════════════════════════ */}
    {/* TEMPO RIMASTO - BLACK GLASS + WHITE MICRO-ENERGY */}
    {/* ═══════════════════════════════════════════════════════════════ */}
    <div 
      className={`card-glass-white-energy${hideScrollMissionStatusCard ? ' hidden' : ''}`}
      aria-hidden={hideScrollMissionStatusCard ? true : undefined}
      style={{
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '16px',
        /* BLACK GLASS background - deeper */
        background: `linear-gradient(160deg, 
          rgba(10, 10, 12, 0.82) 0%, 
          rgba(12, 14, 20, 0.78) 50%, 
          rgba(10, 10, 12, 0.82) 100%
        )`,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        padding: '20px 16px 24px 16px',
        /* WHITE MICRO-ENERGY BORDER */
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
          0 0 20px rgba(255, 255, 255, 0.08),
          0 0 40px rgba(255, 255, 255, 0.04),
          0 4px 28px rgba(0, 0, 0, 0.5),
          inset 0 0 24px rgba(255, 255, 255, 0.03),
          inset 0 1px 0 rgba(255, 255, 255, 0.06)
        `,
      }}
    >
      {/* Active Mission Box (contains Indizi trovati, Tempo rimasto, Stato missione) */}
      <motion.div 
        data-onboarding="mission-card"
        data-section="status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <ActiveMissionBox 
          mission={activeMission} 
          purchasedClues={purchasedClues}
          progress={progress}
        />
      </motion.div>
    </div>

    {/* ═══════════════════════════════════════════════════════════════ */}
    {/* M1SSION BATTLE - BLACK GLASS + WHITE MICRO-ENERGY */}
    {/* ═══════════════════════════════════════════════════════════════ */}
    <div 
      className={`card-glass-white-energy${hideScrollBattleCard ? ' hidden' : ''}`}
      aria-hidden={hideScrollBattleCard ? true : undefined}
      style={{
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '16px',
        /* BLACK GLASS background - deeper */
        background: `linear-gradient(160deg, 
          rgba(10, 10, 12, 0.82) 0%, 
          rgba(12, 14, 20, 0.78) 50%, 
          rgba(10, 10, 12, 0.82) 100%
        )`,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        padding: '20px 16px 24px 16px',
        /* WHITE MICRO-ENERGY BORDER */
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
          0 0 20px rgba(255, 255, 255, 0.08),
          0 0 40px rgba(255, 255, 255, 0.04),
          0 4px 28px rgba(0, 0, 0, 0.5),
          inset 0 0 24px rgba(255, 255, 255, 0.03),
          inset 0 1px 0 rgba(255, 255, 255, 0.06)
        `,
      }}
    >
      {/* M1SSION BATTLE (Battle Console) - Full width below */}
      <motion.div 
        className="m1-card"
        data-onboarding="battle"
        data-section="battle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BattleConsole />
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