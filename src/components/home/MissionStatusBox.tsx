
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Target, Clock, CheckCircle } from "lucide-react";

interface MissionStatusBoxProps {
  mission: {
    id: string;
    title: string;
    totalClues: number;
    foundClues: number;
    timeLimit: string;
    startTime: string;
    remainingDays: number;
    totalDays: number;
  };
  progress: number;
}

export function MissionStatusBox({ mission, progress }: MissionStatusBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-6 relative"
      style={{
        background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(0, 209, 255, 0.1) 100%)',
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      onClick={handleToggle}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #00D1FF 0%, #365EFF 50%, #FACC15 100%)'
        }}
      />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-orbitron font-bold mb-2">
              <span className="text-[#00D1FF]">CACCIA</span>
              <span className="text-white"> AL TESORO URBANO</span>
            </h2>
            <p className="text-white/60 text-sm">Missione ID: {mission.id}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/60" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a]/50 p-4 rounded-[16px]">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-white/80 text-sm">Indizi trovati</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {mission.foundClues}/{mission.totalClues}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(mission.foundClues / mission.totalClues) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-[#0a0a0a]/50 p-4 rounded-[16px]">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-white/80 text-sm">Tempo rimasto</span>
            </div>
            <div className="text-2xl font-bold text-amber-400 mb-2">
              {mission.remainingDays} giorni
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-[#0a0a0a]/50 p-4 rounded-[16px]">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-[#00D1FF]" />
              <span className="text-white/80 text-sm">Stato missione</span>
            </div>
            <div className="text-xl font-bold text-[#00D1FF] mb-1">
              ATTIVA
            </div>
            <div className="text-xs text-white/60">
              Iniziata il 08/06/2025
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a]/30 p-3 rounded-lg">
                  <p className="text-sm text-white/70 mb-1">Progresso Generale</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#00D1FF] font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-[#0a0a0a]/30 p-3 rounded-lg">
                  <p className="text-sm text-white/70 mb-2">Dettagli Missione</p>
                  <div className="space-y-1 text-xs text-white/60">
                    <p>Tipo: Caccia al Tesoro</p>
                    <p>Difficoltà: Medio</p>
                    <p>Partecipanti: 1,247</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
