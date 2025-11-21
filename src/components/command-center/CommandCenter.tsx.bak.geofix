
import React, { useState, useEffect } from "react";
import { MissionPanel } from "./MissionPanel";
import { IntelFeed } from "./IntelFeed";
import { AnalysisBoard } from "./AnalysisBoard";
import { ContextualShortcuts } from "./ContextualShortcuts";
import { activeMission, intelFeed, analysisItems } from "@/data/commandCenterData";
import { motion } from "framer-motion";

export const CommandCenter: React.FC = () => {
  const [buzzActive, setBuzzActive] = useState(false);
  const [mapActivity, setMapActivity] = useState(false);
  const [leaderboardChange, setLeaderboardChange] = useState(false);
  
  useEffect(() => {
    // Simulate random activity in the system
    const mapInterval = setInterval(() => {
      setMapActivity(Math.random() > 0.7);
    }, 15000);
    
    const buzzInterval = setInterval(() => {
      setBuzzActive(Math.random() > 0.6);
    }, 20000);
    
    const leaderboardInterval = setInterval(() => {
      setLeaderboardChange(Math.random() > 0.8);
    }, 30000);
    
    return () => {
      clearInterval(mapInterval);
      clearInterval(buzzInterval);
      clearInterval(leaderboardInterval);
    };
  }, []);

  return (
    <motion.div
      className="w-full max-w-screen-xl mx-auto px-4 py-2 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Section Title */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white">
          <span className="text-cyan-400">Sala di Comando</span> M1SSION
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Centro Operativo {activeMission?.name || "Missione Corrente"}
        </p>
      </motion.div>

      {/* Command Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mission Panel - Takes up 2 columns on md+ screens */}
        <div className="md:col-span-2">
          <MissionPanel mission={activeMission} />
        </div>
        
        {/* Intel Feed - Takes up 1 column */}
        <div>
          <IntelFeed intel={intelFeed} />
        </div>
        
        {/* Analysis Board - Full width */}
        <div className="md:col-span-3">
          <AnalysisBoard items={analysisItems} />
        </div>
        
        {/* Contextual Shortcuts - Full width */}
        <div className="md:col-span-3">
          <ContextualShortcuts 
            buzzActive={buzzActive} 
            mapActivity={mapActivity}
            leaderboardChange={leaderboardChange} 
          />
        </div>
      </div>
    </motion.div>
  );
};
