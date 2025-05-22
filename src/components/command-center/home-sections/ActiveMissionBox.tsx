
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";

interface MissionProps {
  mission: {
    id: string;
    title: string;
    totalClues: number;
    foundClues: number;
    timeLimit?: string;
    startTime: string;
    remainingDays: number;
    totalDays: number;
  };
}

export function ActiveMissionBox({ mission }: MissionProps) {
  // Calculate progress percentage
  const progressPercent = (mission.foundClues / mission.totalClues) * 100;
  
  // Calculate time progress
  const timeProgressPercent = ((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100;
  
  return (
    <GradientBox>
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-orbitron">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION ACTIVE</span>
          </h2>

          <div className="px-3 py-1 rounded-full bg-[#7B2EFF]/20 border border-[#7B2EFF]/30 text-[#7B2EFF] text-xs font-medium">
            {mission.id}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-2">{mission.title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {/* Clues Progress */}
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/80 text-sm">Indizi trovati</span>
              <span className="text-white text-sm font-medium">{mission.foundClues}/{mission.totalClues}</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Time Remaining */}
          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/80 text-sm">Tempo rimasto</span>
              <span className="text-white text-sm font-medium">{mission.remainingDays} giorni</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00D1FF] to-[#F059FF]"
                initial={{ width: 0 }}
                animate={{ width: `${timeProgressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <motion.button 
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] text-white font-medium hover:shadow-[0_0_15px_rgba(0,209,255,0.5)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Visualizza dettagli
          </motion.button>
        </div>
      </div>
    </GradientBox>
  );
}
