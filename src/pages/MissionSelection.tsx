
import React from "react";
import MissionSelector from "@/components/missions/MissionSelector";
import { motion } from "framer-motion";

export default function MissionSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[10%] left-[5%] w-2 h-2 rounded-full bg-[#00D1FF] opacity-70 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-3 h-3 rounded-full bg-[#F059FF] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[15%] w-2 h-2 rounded-full bg-[#7B2EFF] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </motion.div>
      
      <MissionSelector />
    </div>
  );
}
