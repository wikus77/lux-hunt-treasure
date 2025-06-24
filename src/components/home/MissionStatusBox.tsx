
import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, Zap } from "lucide-react";
import { useMissionManager } from "@/hooks/useMissionManager";
import { getRemainingDays } from "@/utils/countdownDate";

const MissionStatusBox: React.FC = () => {
  const { currentMission } = useMissionManager();
  const remainingDays = getRemainingDays();

  return (
    <motion.div 
      className="bg-gradient-to-br from-[#1C1C1F] to-[#000000] rounded-[24px] border border-white/10 p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-orbitron font-bold text-white">
          {currentMission.name}
        </h2>
        <div className="text-[#00D1FF] text-sm font-mono">
          {currentMission.id}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm">Indizi Trovati</span>
          <span className="text-[#00D1FF] font-bold">
            {currentMission.foundClues}/{currentMission.totalClues}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-2 rounded-full transition-all duration-500"
            style={{ width: `${currentMission.progress}%` }}
          ></div>
        </div>
        <div className="text-right text-[#00D1FF] text-sm mt-1">
          {currentMission.progress}%
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Clock className="w-5 h-5 text-[#FACC15]" />
          </div>
          <div className="text-[#FACC15] font-bold text-lg">{remainingDays}</div>
          <div className="text-white/60 text-xs">Giorni</div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Target className="w-5 h-5 text-[#FC1EFF]" />
          </div>
          <div className="text-[#FC1EFF] font-bold text-lg">ATTIVA</div>
          <div className="text-white/60 text-xs">Stato</div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Zap className="w-5 h-5 text-[#00D1FF]" />
          </div>
          <div className="text-[#00D1FF] font-bold text-lg">12/07</div>
          <div className="text-white/60 text-xs">Inizio</div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-[#00D1FF]/20 rounded-full border border-[#00D1FF]/30">
          <div className="w-2 h-2 bg-[#00D1FF] rounded-full mr-2 animate-pulse"></div>
          <span className="text-[#00D1FF] font-medium text-sm">MISSIONE IN CORSO</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionStatusBox;
