
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useLongPress } from "@/hooks/useLongPress";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClueData {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  type: "basic" | "premium" | "exclusive";
  progressValue: number;
}

interface BrokerConsoleProps {
  credits: number;
  onPurchaseClue: (clue: ClueData) => void;
}

export function BrokerConsole({ credits, onPurchaseClue }: BrokerConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  // Long press functionality for mobile fullscreen
  const longPressProps = useLongPress(
    () => {
      if (isMobile) {
        setIsFullscreen(true);
      }
    },
    {
      threshold: 800, // 800ms for long press
    }
  );

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

  const getClueStyle = (type: string) => {
    switch (type) {
      case "basic":
        return "bg-[#1C1C1F]/80";
      case "premium":
        return "bg-[#1C1C1F]/90";
      case "exclusive":
        return "bg-[#1C1C1F]";
      default:
        return "bg-[#1C1C1F]/80";
    }
  };

  // Handle click for desktop or toggle expansion
  const handleClick = () => {
    if (!isMobile) {
      setIsFullscreen(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle header click for expansion toggle
  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
  };

  // Fullscreen component
  const FullscreenView = () => (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsFullscreen(false)}
    >
      <div className="h-full w-full p-6 overflow-y-auto">
        <div className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(54, 94, 255, 0.1) 100%)',
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-[1px]"
            style={{
              background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
            }}
          />
          
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-orbitron font-bold text-white">
              M1SSION CONSOLE
            </h2>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70">Crediti disponibili</span>
              <span className="text-lg font-bold text-white">{credits}</span>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-white/70 text-sm mb-4">
              Acquista indizi per avvicinarti all'obiettivo principale.
            </p>
            
            <div className="space-y-3">
              {availableClues.map((clue, index) => (
                <motion.div
                  key={clue.id}
                  className={`p-4 rounded-[16px] ${getClueStyle(clue.type)} hover:scale-105 transition-all duration-200 shadow-md`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/80 text-xs font-mono">{clue.code}</span>
                    <span className="text-white font-bold">{clue.cost} crediti</span>
                  </div>
                  
                  <h3 className="text-white font-bold text-sm mb-1 font-orbitron">{clue.title}</h3>
                  <p className="text-white/60 text-xs mb-3">{clue.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-xs">+{clue.progressValue}% progresso</span>
                    <button
                      className={`px-3 py-1 rounded-full text-xs transition-all font-orbitron ${
                        credits >= clue.cost
                          ? "bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white hover:scale-105 hover:shadow-lg"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={credits < clue.cost}
                      onClick={() => onPurchaseClue(clue)}
                    >
                      Acquista
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div 
        className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-4 relative"
        style={{
          background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(54, 94, 255, 0.1) 100%)',
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-[1px]"
          style={{
            background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
          }}
        />
        
        <div 
          className="p-6 border-b border-white/10 flex justify-between items-center"
          onClick={handleHeaderClick}
          {...(isMobile ? longPressProps : {})}
        >
          <h2 className="text-lg md:text-xl font-orbitron font-bold text-white">
            M1SSION CONSOLE
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/70">Crediti disponibili</span>
            <span className="text-lg font-bold text-white">{credits}</span>
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
                
                <div className="space-y-3 max-h-[calc(100vh-25rem)] overflow-y-auto pr-1 custom-scrollbar">
                  {availableClues.map((clue, index) => (
                    <motion.div
                      key={clue.id}
                      className={`p-4 rounded-[16px] ${getClueStyle(clue.type)} hover:scale-105 transition-all duration-200 shadow-md`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white/80 text-xs font-mono">{clue.code}</span>
                        <span className="text-white font-bold">{clue.cost} crediti</span>
                      </div>
                      
                      <h3 className="text-white font-bold text-sm mb-1 font-orbitron">{clue.title}</h3>
                      <p className="text-white/60 text-xs mb-3">{clue.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-xs">+{clue.progressValue}% progresso</span>
                        <button
                          className={`px-3 py-1 rounded-full text-xs transition-all font-orbitron ${
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
                          Acquista
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

      {/* Fullscreen overlay for desktop */}
      {isFullscreen && <FullscreenView />}
    </>
  );
}
