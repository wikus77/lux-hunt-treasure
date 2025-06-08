
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Lock, Star, ChevronDown, ChevronUp } from "lucide-react";
import GradientBox from "@/components/ui/gradient-box";
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

  const getClueIcon = (type: string) => {
    switch (type) {
      case "basic":
        return <Zap className="w-4 h-4 text-blue-400" />;
      case "premium":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "exclusive":
        return <Lock className="w-4 h-4 text-purple-400" />;
      default:
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getClueStyle = (type: string) => {
    switch (type) {
      case "basic":
        return "border-blue-500/30 bg-blue-500/10";
      case "premium":
        return "border-yellow-500/30 bg-yellow-500/10";
      case "exclusive":
        return "border-purple-500/30 bg-purple-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
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
        <div className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-orbitron font-bold">
              <span className="text-[#00D1FF]" style={{ 
                textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
              }}>M1</span>
              <span className="text-white">SSION CONSOLE</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/70">Crediti disponibili</span>
              <span className="text-lg font-bold text-[#00D1FF]">{credits}</span>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-white/70 text-sm mb-4">
              Acquista indizi per avvicinarti all'obiettivo principale.
            </p>
            
            <div className="space-y-3">
              {availableClues.map((clue, index) => (
                <motion.div
                  key={clue.id}
                  className={`p-4 rounded-2xl border ${getClueStyle(clue.type)} hover:scale-105 transition-all duration-200 bg-[#121212] shadow-md`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {getClueIcon(clue.type)}
                      <span className="text-white/80 text-xs font-mono">{clue.code}</span>
                    </div>
                    <span className="text-[#00D1FF] font-bold">{clue.cost} crediti</span>
                  </div>
                  
                  <h3 className="text-white font-bold text-sm mb-1">{clue.title}</h3>
                  <p className="text-white/60 text-xs mb-3">{clue.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-xs">+{clue.progressValue}% progresso</span>
                    <button
                      className={`px-3 py-1 rounded text-xs transition-all ${
                        credits >= clue.cost
                          ? "bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white hover:scale-105"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={credits < clue.cost}
                      onClick={() => onPurchaseClue(clue)}
                    >
                      <ShoppingCart className="w-3 h-3 inline mr-1" />
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
        className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="p-4 border-b border-white/10 flex justify-between items-center"
          onClick={handleClick}
          {...(isMobile ? longPressProps : {})}
        >
          <h2 className="text-lg md:text-xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION CONSOLE</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/70">Crediti disponibili</span>
            <span className="text-lg font-bold text-[#00D1FF]">{credits}</span>
            {isMobile && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-white/60" />
              </motion.div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {!isMobile || isExpanded ? (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: isMobile ? 0.5 : 0, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <p className="text-white/70 text-sm mb-4">
                  Acquista indizi per avvicinarti all'obiettivo principale.
                </p>
                
                <div className="space-y-3 max-h-[calc(100vh-25rem)] overflow-y-auto pr-1 custom-scrollbar">
                  {availableClues.map((clue, index) => (
                    <motion.div
                      key={clue.id}
                      className={`p-4 rounded-2xl border ${getClueStyle(clue.type)} hover:scale-105 transition-all duration-200 bg-[#121212] shadow-md`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {getClueIcon(clue.type)}
                          <span className="text-white/80 text-xs font-mono">{clue.code}</span>
                        </div>
                        <span className="text-[#00D1FF] font-bold">{clue.cost} crediti</span>
                      </div>
                      
                      <h3 className="text-white font-bold text-sm mb-1">{clue.title}</h3>
                      <p className="text-white/60 text-xs mb-3">{clue.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-xs">+{clue.progressValue}% progresso</span>
                        <button
                          className={`px-3 py-1 rounded text-xs transition-all ${
                            credits >= clue.cost
                              ? "bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white hover:scale-105"
                              : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={credits < clue.cost}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPurchaseClue(clue);
                          }}
                        >
                          <ShoppingCart className="w-3 h-3 inline mr-1" />
                          Acquista
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen overlay for desktop */}
      {isFullscreen && <FullscreenView />}
    </>
  );
}
