
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingCart } from "lucide-react";

interface ClueData {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  type: "basic" | "premium" | "exclusive";
  progressValue: number;
}

interface MissionConsoleProps {
  credits: number;
  onPurchaseClue: (clue: ClueData) => void;
}

export function MissionConsole({ credits, onPurchaseClue }: MissionConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableClues: ClueData[] = [
    {
      id: "clue_001",
      code: "CLU-001",
      title: "Coordinate Base",
      description: "Rivela la zona generale dell'obiettivo",
      cost: 50,
      type: "basic",
      progressValue: 5
    },
    {
      id: "clue_002", 
      code: "CLU-002",
      title: "Dettaglio Architettonico",
      description: "Informazioni specifiche sull'edificio target",
      cost: 120,
      type: "premium",
      progressValue: 10
    },
    {
      id: "clue_003",
      code: "CLU-003", 
      title: "Intel Esclusivo",
      description: "Accesso a intelligence riservata di alto livello",
      cost: 250,
      type: "exclusive",
      progressValue: 20
    }
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-4 relative"
      style={{
        background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(54, 94, 255, 0.1) 100%)',
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onClick={handleToggle}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
        }}
      />
      
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold text-white">
          MISSION CONSOLE
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/70">Crediti disponibili</span>
            <span className="text-lg font-bold text-white">{credits}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-white/60" />
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <p className="text-white/70 text-sm mb-4">
                Acquista indizi per avvicinarti all'obiettivo principale.
              </p>
              
              <div className="space-y-3">
                {availableClues.map((clue, index) => (
                  <motion.div
                    key={clue.id}
                    className="p-4 bg-[#0a0a0a]/50 rounded-[16px] hover:bg-[#0a0a0a]/70 transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white/80 text-xs font-mono bg-white/10 px-2 py-1 rounded">
                        {clue.code}
                      </span>
                      <span className="text-white font-bold">{clue.cost} crediti</span>
                    </div>
                    
                    <h3 className="text-white font-bold text-sm mb-1 font-orbitron">{clue.title}</h3>
                    <p className="text-white/60 text-xs mb-3">{clue.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 text-xs">+{clue.progressValue}% progresso</span>
                      <button
                        className={`px-4 py-2 rounded-full text-xs transition-all font-orbitron flex items-center space-x-1 ${
                          credits >= clue.cost
                            ? "bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white hover:scale-105 hover:shadow-lg"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={credits < clue.cost}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPurchaseClue(clue);
                        }}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Acquista</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
