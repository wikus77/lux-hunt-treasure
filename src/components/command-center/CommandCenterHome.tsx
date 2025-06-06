
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
  return (
    <motion.div 
      className="space-y-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.section variants={fadeSlideUp}>
        <ActiveMissionBox />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <TreasureHuntPanel />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <PrizeVision />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <BrokerConsole />
      </motion.section>

      <motion.section variants={fadeSlideUp}>
        <AgentDiary />
      </motion.section>
    </motion.div>
  );
};

export default CommandCenterHome;
