
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BrokerConsole } from "./home-sections/BrokerConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import { ActiveMissionBox } from "./home-sections/ActiveMissionBox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import { getMissionDeadline } from "@/utils/countdownDate";

export default function CommandCenterHome() {
  const [progress, setProgress] = useLocalStorage<number>("mission-progress", 0);
  const [credits, setCredits] = useLocalStorage<number>("user-credits", 1000);
  const [purchasedClues, setPurchasedClues] = useLocalStorage<any[]>("purchased-clues", []);
  const [diaryEntries, setDiaryEntries] = useLocalStorage<any[]>("diary-entries", []);
  const [prizeUnlockStatus, setPrizeUnlockStatus] = useState<"locked" | "partial" | "near" | "unlocked">("locked");

  const calculateRemainingDays = () => {
    const deadline = getMissionDeadline();
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const [activeMission, setActiveMission] = useState({
    id: "M001",
    title: "Caccia al Tesoro Urbano",
    totalClues: 12,
    foundClues: 3,
    timeLimit: "48:00:00",
    startTime: new Date().toISOString(),
    remainingDays: calculateRemainingDays(),
    totalDays: 30
  });

  useEffect(() => {
    setActiveMission(prev => ({
      ...prev,
      remainingDays: calculateRemainingDays()
    }));
    
    const daysRemaining = activeMission.remainingDays;
    const objectivesPercentage = (activeMission.foundClues / activeMission.totalClues) * 100;
    const userScore = progress;
    
    if (daysRemaining <= 3) {
      setPrizeUnlockStatus("unlocked");
    } else {
      const partialVisibility = (objectivesPercentage * 0.4) + (userScore * 0.05);
      
      if (partialVisibility < 20) {
        setPrizeUnlockStatus("locked");
      } else if (partialVisibility < 35) {
        setPrizeUnlockStatus("partial");
      } else {
        setPrizeUnlockStatus("near");
      }
    }
  }, [progress, activeMission.foundClues, activeMission.totalClues]);

  const handlePurchaseClue = (clue) => {
    if (credits >= clue.cost) {
      setCredits(prev => prev - clue.cost);
      setPurchasedClues(prev => [...prev, clue]);
      addDiaryEntry({
        type: "purchase",
        content: `Hai acquistato l'indizio ${clue.code}: "${clue.title}"`,
        timestamp: new Date().toISOString()
      });
      setProgress(prev => Math.min(100, prev + clue.progressValue));
      toast.success("Indizio acquistato con successo!");
    } else {
      toast.error("Crediti insufficienti per acquistare questo indizio.");
    }
  };

  const addDiaryEntry = (entry) => {
    setDiaryEntries(prev => [entry, ...prev]);
  };

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
      <motion.div 
        className="mb-6 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PrizeVision 
          progress={progress} 
          status={prizeUnlockStatus}
          daysRemaining={activeMission.remainingDays}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ActiveMissionBox 
            mission={activeMission}
            progress={progress}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BrokerConsole 
            credits={credits}
            purchasedClues={purchasedClues}
            onPurchaseClue={handlePurchaseClue}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full"
      >
        <AgentDiary 
          entries={diaryEntries}
          onAddNote={addPersonalNote}
        />
      </motion.div>
    </div>
  );
}
