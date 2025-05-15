
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentCode: string | null;
}

const AgentInfoPopup = ({ isOpen, onClose, agentCode }: AgentInfoPopupProps) => {
  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Define animation variants for Apple-like Dynamic Island
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const dynamicIslandVariants = {
    hidden: {
      width: "auto",
      height: "36px",
      borderRadius: "9999px",
      opacity: 1,
      scale: 0.95,
      y: 0
    },
    visible: {
      width: "92%",
      maxWidth: "32rem",
      height: "auto",
      borderRadius: "24px",
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.4,
        bounce: 0,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      width: "auto",
      height: "36px",
      borderRadius: "9999px",
      opacity: 1,
      scale: 0.95,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            role="presentation"
          />
          
          {/* Dynamic Island Container */}
          <motion.div
            className="fixed z-[60] origin-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dynamicIslandVariants}
            style={{
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              transformOrigin: "center center",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 209, 255, 0.15)"
            }}
            role="dialog"
            aria-label="Dynamic Island agente"
          >
            <div className="bg-zinc-900/95 backdrop-blur-md border border-cyan-500/30 rounded-[inherit] overflow-hidden p-6 text-white h-full w-full">
              <motion.div
                variants={contentVariants}
                className="flex justify-between items-center mb-4"
              >
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Informazioni Agente
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10"
                  aria-label="Chiudi"
                >
                  <X size={18} />
                </button>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                variants={contentVariants}
              >
                <div className="flex gap-4 items-center">
                  {/* Placeholder for agent profile image */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-xl font-bold border-2 border-white/20">
                    {agentCode ? agentCode.substring(0, 1) : "?"}
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-black/40 border border-cyan-800/30 rounded-lg p-3 mb-2">
                      <p className="text-sm text-gray-400">Codice agente:</p>
                      <p className="font-mono text-cyan-400 text-lg">{agentCode ?? "?????"}</p>
                    </div>
                    
                    <div className="bg-black/40 border border-cyan-800/30 rounded-lg p-3">
                      <p className="text-sm text-gray-400">Missione in corso:</p>
                      <p className="text-white">Operazione Venezia</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button 
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90"
                  >
                    <Search size={16} />
                    <span>Accedi ai tuoi indizi</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2 border-cyan-500/50 hover:bg-black/50"
                  >
                    <FileEdit size={16} />
                    <span>Modifica profilo</span>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div variants={contentVariants}>
                <Button 
                  onClick={onClose} 
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-black"
                >
                  Chiudi
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentInfoPopup;
