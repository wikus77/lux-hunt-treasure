
import React from "react";
import { motion } from "framer-motion";
import { ActiveMissionBox } from "./home-sections/ActiveMissionBox";
import { PrizeVision } from "./home-sections/PrizeVision";
import { BrokerConsole } from "./home-sections/BrokerConsole";
import { AgentDiary } from "./home-sections/AgentDiary";
import { TreasureHuntPanel } from "@/components/home/treasure-hunt/TreasureHuntPanel";

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CommandCenterHome = () => {
  // Default mission data
  const defaultMission = {
    id: "default-mission-001",
    title: "Caccia al Tesoro Urbano",
    totalClues: 15,
    foundClues: 3,
    timeLimit: "30 giorni",
    startTime: new Date().toISOString(),
    remainingDays: 27,
    totalDays: 30
  };

  // Default handlers
  const handlePurchaseClue = (clue: any) => {
    console.log('Clue purchased:', clue);
  };

  const handleAddNote = (note: string) => {
    console.log('Note added:', note);
  };

  // Default data
  const defaultEntries = [
    {
      type: "note" as const,
      content: "Iniziata la missione di caccia al tesoro",
      timestamp: new Date().toISOString()
    }
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.section variants={fadeSlideUp}>
        <ActiveMissionBox mission={defaultMission} />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <TreasureHuntPanel />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <PrizeVision progress={45} status="partial" />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <BrokerConsole credits={150} onPurchaseClue={handlePurchaseClue} />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <AgentDiary 
          entries={defaultEntries} 
          onAddNote={handleAddNote}
          purchasedClues={[]}
        />
      </motion.section>
    </motion.div>
  );
};

export default CommandCenterHome;
