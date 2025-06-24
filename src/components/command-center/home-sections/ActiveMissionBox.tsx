
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Target, CheckCircle, AlertCircle, Timer, ChevronDown } from "lucide-react";

interface ActiveMissionBoxProps {
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
  purchasedClues?: any[];
  progress?: number;
}

export function ActiveMissionBox({ mission, purchasedClues = [], progress = 0 }: ActiveMissionBoxProps) {
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  const toggleBox = (boxId: string) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  const getMissionTimeline = () => {
    const startDate = new Date(mission.startTime);
    
    return [
      { event: "Missione Iniziata", date: startDate.toLocaleDateString(), status: "completed" },
      { event: "Primo Indizio", date: new Date(startDate.getTime() + 86400000).toLocaleDateString(), status: "completed" },
      { event: "Fase Intermedia", date: new Date().toLocaleDateString(), status: "current" },
      { event: "Deadline Finale", date: new Date(startDate.getTime() + (mission.totalDays * 86400000)).toLocaleDateString(), status: "pending" }
    ];
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="text-xl font-orbitron font-bold mb-2">
          <span className="text-[#00D1FF]">CACCIA</span>
          <span className="text-white"> AL TESORO URBANO</span>
        </h2>
        <p className="text-white/60 text-sm">Missione ID: {mission.id}</p>
      </div>

      {/* Three Box Grid - Exact Style from Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* INDIZI TROVATI Box */}
        <motion.div
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-green-500/30 transition-colors"
          onClick={() => toggleBox("clues")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-white/80 text-sm">Indizi trovati</span>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-2">
            {mission.foundClues}/{mission.totalClues}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(mission.foundClues / mission.totalClues) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60">
            {Math.round((mission.foundClues / mission.totalClues) * 100)}% completato
          </span>

          <AnimatePresence>
            {expandedBox === "clues" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-4 pt-4 border-t border-white/10"
              >
                <h4 className="text-white font-medium mb-3">Indizi Scoperti</h4>
                <div className="space-y-2">
                  {purchasedClues.length > 0 ? (
                    purchasedClues.map((clue, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg">
                        <div>
                          <p className="text-white font-medium text-sm">{clue.title}</p>
                          <p className="text-xs text-white/60">{clue.code}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/50 text-sm">
                      Nessun indizio acquistato ancora
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TEMPO RIMASTO Box */}
        <motion.div
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-amber-500/30 transition-colors"
          onClick={() => toggleBox("time")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-white/80 text-sm">Tempo rimasto</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-2">
            {mission.remainingDays} giorni
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-amber-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60">
            su {mission.totalDays} giorni totali
          </span>

          <AnimatePresence>
            {expandedBox === "time" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-4 pt-4 border-t border-white/10"
              >
                <h4 className="text-white font-medium mb-3">Timeline Missione</h4>
                <div className="space-y-2">
                  {getMissionTimeline().map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded">
                      <span className="text-white text-sm">{item.event}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/60">{item.date}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-green-400' :
                          item.status === 'current' ? 'bg-amber-400' : 'bg-gray-600'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STATO MISSIONE Box */}
        <motion.div
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#00D1FF]/30 transition-colors"
          onClick={() => toggleBox("status")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-[#00D1FF] rounded-full" />
            <span className="text-white/80 text-sm">Stato missione</span>
          </div>
          <div className="text-xl font-bold text-[#00D1FF] mb-1">
            ATTIVA
          </div>
          <div className="text-xs text-white/60 mb-2">
            Iniziata il 08/06/2025
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <AnimatePresence>
            {expandedBox === "status" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-4 pt-4 border-t border-white/10"
              >
                <h4 className="text-white font-medium mb-3">Dettagli Progresso</h4>
                
                {/* Progress Percentage */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-white text-sm">Progresso Generale</span>
                    <span className="text-[#00D1FF] text-sm font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-green-400">{mission.foundClues}</p>
                    <p className="text-xs text-white/60">Obiettivi Raggiunti</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-red-400">{mission.totalClues - mission.foundClues}</p>
                    <p className="text-xs text-white/60">Obiettivi Rimanenti</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
