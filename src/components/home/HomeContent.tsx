
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CommandCenter } from "@/components/command-center/CommandCenter";
import useIntroStep from "./useIntroStep";
import useModulesUnlock from "./useModulesUnlock";
import HomeIntroSection from "./HomeIntroSection";
import DarkZoneTitle from "./DarkZoneTitle";
import CommandModulesSection from "./CommandModulesSection";
import CommandCenterWrapper from "./CommandCenterWrapper";
import LuxuryCarsSection from "./LuxuryCarsSection";
import ExclusivePrizesSection from "./ExclusivePrizesSection";
import MissionGamesSection from "./MissionGamesSection";

export default function HomeContent() {
  console.log("[HomeContent] COMPONENT MOUNTED!");
  
  const { step, handleIntroEnd } = useIntroStep();
  const { unlockedModules, handleModuleClick, areAllModulesUnlocked } = useModulesUnlock();

  return (
    <div className="relative">
      <HomeIntroSection onIntroEnd={handleIntroEnd} step={step} />
      
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 pb-20" // Increased padding at bottom to account for navigation
        >
          {/* Dark Zone Title */}
          <DarkZoneTitle />

          {/* Command Modules Section with Dark Zone concept */}
          <CommandModulesSection 
            unlockedModules={unlockedModules}
            handleModuleClick={handleModuleClick}
          />

          {/* Display actual CommandCenter once all modules are unlocked */}
          <CommandCenterWrapper allModulesUnlocked={areAllModulesUnlocked()} />
          
          {/* New Exclusive Prizes Section */}
          <ExclusivePrizesSection />
          
          {/* Luxury Cars Section */}
          <LuxuryCarsSection />
          
          {/* M1SSION GAMES Section */}
          <MissionGamesSection />
        </motion.div>
      )}
    </div>
  );
}
