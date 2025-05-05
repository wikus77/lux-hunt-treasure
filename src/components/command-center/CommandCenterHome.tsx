
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BrokerConsole } from "./home-sections/BrokerConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import { ActiveMissionBox } from "./home-sections/ActiveMissionBox";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function CommandCenterHome() {
  // Track the user's progress (from 0 to 100)
  const [progress, setProgress] = useLocalStorage("mission-progress", 0);
  
  // Track user's credits
  const [credits, setCredits] = useLocalStorage("user-credits", 1000);
  
  // Track purchased clues
  const [purchasedClues, setPurchasedClues] = useLocalStorage("purchased-clues", []);
  
  // Track diary entries
  const [diaryEntries, setDiaryEntries] = useLocalStorage("diary-entries", []);

  // Track prize unlock status
  const [prizeUnlockStatus, setPrizeUnlockStatus] = useState("locked");

  // Active mission data
  const [activeMission, setActiveMission] = useState({
    id: "M001",
    title: "Caccia al Tesoro Urbano",
    totalClues: 12,
    foundClues: 3,
    timeLimit: "48:00:00", // In HH:MM:SS format
    startTime: new Date().toISOString(),
  });

  // Update prize status based on progress
  useEffect(() => {
    if (progress < 30) {
      setPrizeUnlockStatus("locked");
    } else if (progress < 60) {
      setPrizeUnlockStatus("partial");
    } else if (progress < 100) {
      setPrizeUnlockStatus("near");
    } else {
      setPrizeUnlockStatus("unlocked");
    }
  }, [progress]);

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
  };

  return (
    <div className="w-full">
      {/* Active Mission Box - Always visible */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ActiveMissionBox mission={activeMission} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column - Broker Console */}
        <motion.div 
          className="md:col-span-4 order-2 md:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BrokerConsole 
            credits={credits}
            onPurchaseClue={handlePurchaseClue} 
          />
        </motion.div>

        {/* Center Column - Prize Vision */}
        <motion.div 
          className="md:col-span-4 order-1 md:order-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PrizeVision 
            progress={progress} 
            status={prizeUnlockStatus} 
          />
        </motion.div>

        {/* Right Column - Agent Diary */}
        <motion.div 
          className="md:col-span-4 order-3"
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
