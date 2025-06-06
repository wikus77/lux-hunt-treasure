
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BrokerConsole } from "./home-sections/BrokerConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import TreasureHuntPanel from "../home/TreasureHuntPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { getMissionDeadline } from "@/utils/countdownDate";

export default function CommandCenterHome() {
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

  // Calculate remaining days for mission
  const calculateRemainingDays = () => {
    const deadline = getMissionDeadline();
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Update prize status based on progress and days remaining
  useEffect(() => {
    const daysRemaining = calculateRemainingDays();
    const objectivesPercentage = (3 / 12) * 100; // Default clues found
    const userScore = progress;
    
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
  }, [progress]);

  // Handle clue purchase
  const handlePurchaseClue = (clue: any) => {
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
  const addDiaryEntry = (entry: any) => {
    setDiaryEntries(prev => [entry, ...prev]);
  };

  // Add personal note
  const addPersonalNote = (note: string) => {
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

      {/* Treasure Hunt Panel with interactive flip boxes */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TreasureHuntPanel />
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
