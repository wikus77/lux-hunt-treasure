
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Target, CheckCircle, AlertCircle, Timer, ChevronDown } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

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
  
  // 🔥 USA I DATI REALI DALLA MISSIONE - foundClues dal database user_clues
  const realCluesFound = mission.foundClues ?? 0;
  const totalClues = mission.totalClues || 200;

  const { notifications } = useNotifications();
  // 🔄 Fallback: se il DB non è ancora sincronizzato, mostra il conteggio dei nuovi indizi BUZZ in Notice
  const buzzClues = notifications.filter(n => n.type === 'buzz');
  const fallbackFoundFromBuzz = buzzClues?.length || 0;
  const displayCluesFound = realCluesFound > 0 ? realCluesFound : fallbackFoundFromBuzz;

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
        <h3 className="text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]">MISSIONE ID:</span>
          <span className="text-white"> {mission.title}</span>
        </h3>
      </div>

      {/* Three Box Grid - Exact Style from Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* INDIZI TROVATI Box */}
        <motion.div
          className="m1ssion-glass-card rounded-2xl p-4 cursor-pointer hover:border-green-500/30 transition-colors overflow-hidden relative"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
          onClick={() => toggleBox("clues")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-white/80 text-sm">Indizi trovati</span>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-2">
            {displayCluesFound}/{totalClues}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                displayCluesFound === 0 ? 'bg-gray-500' :
                displayCluesFound < 50 ? 'bg-gradient-to-r from-[#22C55E] to-[#10B981]' :
                displayCluesFound < 100 ? 'bg-gradient-to-r from-[#10B981] to-[#00D1FF]' :
                displayCluesFound < 150 ? 'bg-gradient-to-r from-[#00D1FF] to-[#A855F7]' : 
                'bg-gradient-to-r from-[#A855F7] to-[#D946EF]'
              }`}
              style={{ width: `${(displayCluesFound / totalClues) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60">
            {Math.round((displayCluesFound / totalClues) * 100)}% completato
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
                <h4 className="text-white font-medium mb-3">Indizi BUZZ Scoperti ({buzzClues.length})</h4>
                <div className="space-y-2">
                  {buzzClues.length > 0 ? (
                    buzzClues.map((clue, index) => (
                      <motion.div
                        key={clue.id}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-sm font-medium text-white">{clue.title}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/50">
                              {new Date(clue.date).toLocaleDateString('it-IT')}
                            </span>
                            <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                              BUZZ
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed mb-3">
                          {clue.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-400">
                            ✅ Scoperto via BUZZ
                          </span>
                          <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg border border-blue-500/30 transition-colors">
                            📍 Visualizza
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-white/60">
                      <p>Nessun indizio trovato oggi.</p>
                      <p className="text-sm mt-2">Premi BUZZ per scoprire nuovi indizi!</p>
                      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <p className="text-xs text-blue-300">💡 Gli indizi BUZZ verranno visualizzati qui dopo ogni utilizzo</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TEMPO RIMASTO Box */}
        <motion.div
          className="m1ssion-glass-card rounded-2xl p-4 cursor-pointer hover:border-amber-500/30 transition-colors overflow-hidden relative"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
          onClick={() => toggleBox("time")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-white/80 text-sm">Tempo rimasto</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-2">
            {mission.remainingDays} giorni
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                mission.remainingDays <= 0 ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]' :
                mission.remainingDays <= 5 ? 'bg-gradient-to-r from-[#F97316] to-[#EF4444]' :
                mission.remainingDays <= 15 ? 'bg-gradient-to-r from-[#FBBF24] to-[#F97316]' : 
                'bg-gradient-to-r from-[#FDE047] to-[#FBBF24]'
              }`}
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
          className="m1ssion-glass-card rounded-2xl p-4 cursor-pointer hover:border-[#00D1FF]/30 transition-colors overflow-hidden relative"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
          onClick={() => toggleBox("status")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-[#00D1FF] rounded-full" />
            <span className="text-white/80 text-sm">Stato missione</span>
          </div>
          <div className="text-xl font-bold text-[#00D1FF] mb-3">
              {mission.remainingDays > 0 ? 'ATTIVA' : 'SCADUTA'}
            </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                mission.remainingDays <= 0 ? 'bg-red-500' :
                mission.remainingDays <= 5 ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                mission.remainingDays <= 15 ? 'bg-gradient-to-r from-green-400 to-yellow-400' : 'bg-gradient-to-r from-[#00D1FF] to-green-400'
              }`}
              style={{ width: `${((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100}%` }}
            />
          </div>
          <div className="text-xs text-white/60 mb-1">
            Iniziata il {new Date(mission.startTime).toLocaleDateString('it-IT')}
          </div>
          <span className="text-xs text-white/60">
            {Math.round(((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100)}% tempo trascorso ({mission.totalDays - mission.remainingDays}/{mission.totalDays} giorni)
          </span>

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
                    <span className="text-[#00D1FF] text-sm font-bold">{Math.round((realCluesFound / totalClues) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        realCluesFound === 0 ? 'bg-gray-500' :
                        realCluesFound < 50 ? 'bg-gradient-to-r from-[#00D1FF] to-blue-400' :
                        realCluesFound < 150 ? 'bg-gradient-to-r from-green-400 to-[#00D1FF]' : 'bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(realCluesFound / totalClues) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-green-400">{realCluesFound}</p>
                    <p className="text-xs text-white/60">Obiettivi Raggiunti</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-red-400">{totalClues - realCluesFound}</p>
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
