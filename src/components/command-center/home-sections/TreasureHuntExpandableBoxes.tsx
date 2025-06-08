
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Target, CheckCircle, AlertCircle, Timer } from "lucide-react";

interface TreasureHuntExpandableBoxesProps {
  progress: number;
  activeMission: {
    id: string;
    title: string;
    totalClues: number;
    foundClues: number;
    timeLimit: string;
    startTime: string;
    remainingDays: number;
    totalDays: number;
  };
  purchasedClues: any[];
}

export function TreasureHuntExpandableBoxes({ 
  progress, 
  activeMission, 
  purchasedClues 
}: TreasureHuntExpandableBoxesProps) {
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  const toggleBox = (boxId: string) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  const formatTime = (timeString: string) => {
    return timeString || "48:00:00";
  };

  const getMissionTimeline = () => {
    const startDate = new Date(activeMission.startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return [
      { event: "Missione Iniziata", date: startDate.toLocaleDateString(), status: "completed" },
      { event: "Primo Indizio", date: new Date(startDate.getTime() + 86400000).toLocaleDateString(), status: "completed" },
      { event: "Fase Intermedia", date: new Date().toLocaleDateString(), status: "current" },
      { event: "Deadline Finale", date: new Date(startDate.getTime() + (activeMission.totalDays * 86400000)).toLocaleDateString(), status: "pending" }
    ];
  };

  return (
    <div className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>CACCIA</span>
          <span className="text-white"> AL TESORO URBANO</span>
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* INDIZI TROVATI Box */}
        <motion.div
          className="rounded-xl bg-[#1a1a1a] border border-white/10 cursor-pointer hover:border-[#00D1FF]/30 transition-colors"
          onClick={() => toggleBox("clues")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-[#00D1FF]" />
              <div>
                <h3 className="font-bold text-white">INDIZI TROVATI</h3>
                <p className="text-sm text-white/60">{activeMission.foundClues}/{activeMission.totalClues} scoperti</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expandedBox === "clues" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedBox === "clues" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-white/10">
                  <div className="pt-4 space-y-3">
                    {purchasedClues.length > 0 ? (
                      purchasedClues.map((clue, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                          <div>
                            <p className="text-white font-medium">{clue.title}</p>
                            <p className="text-sm text-white/60">{clue.code}</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-white/50">
                        Nessun indizio acquistato ancora
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TEMPO MISSIONE Box */}
        <motion.div
          className="rounded-xl bg-[#1a1a1a] border border-white/10 cursor-pointer hover:border-[#00D1FF]/30 transition-colors"
          onClick={() => toggleBox("time")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-white">TEMPO MISSIONE</h3>
                <p className="text-sm text-white/60">{activeMission.remainingDays} giorni rimasti</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expandedBox === "time" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Timer className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedBox === "time" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-white/10">
                  <div className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">{formatTime(activeMission.timeLimit)}</p>
                        <p className="text-sm text-white/60">Tempo limite</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#00D1FF]">{activeMission.remainingDays}</p>
                        <p className="text-sm text-white/60">Giorni rimasti</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Timeline Missione</h4>
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
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* STATO MISSIONE Box */}
        <motion.div
          className="rounded-xl bg-[#1a1a1a] border border-white/10 cursor-pointer hover:border-[#00D1FF]/30 transition-colors"
          onClick={() => toggleBox("status")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-bold text-white">STATO MISSIONE</h3>
                <p className="text-sm text-white/60">{progress}% completato</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expandedBox === "status" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="w-5 h-5 text-purple-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedBox === "status" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-white/10">
                  <div className="pt-4 space-y-4">
                    {/* Progress Bar */}
                    <div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-green-400">{activeMission.foundClues}</p>
                        <p className="text-xs text-white/60">Obiettivi Raggiunti</p>
                      </div>
                      <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                        <p className="text-xl font-bold text-red-400">{activeMission.totalClues - activeMission.foundClues}</p>
                        <p className="text-xs text-white/60">Obiettivi Rimanenti</p>
                      </div>
                    </div>

                    {/* Mission Status */}
                    <div className="bg-[#0a0a0a] p-3 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Stato Attuale</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">Missione Attiva</span>
                      </div>
                      <p className="text-white/60 text-xs mt-2">
                        La missione procede regolarmente. Continua a cercare indizi per aumentare il tuo progresso.
                      </p>
                    </div>
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
