
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  agentCode: string | null;
  triggerPosition?: { top: number; left: number; width: number };
}

const AgentInfoPopup = ({ isOpen, onClose, agentCode, triggerPosition }: AgentInfoPopupProps) => {
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

  // Calculate the initial and final position for the dynamic island effect
  const getInitialStyle = () => {
    if (!triggerPosition) return {};
    
    return {
      position: "fixed",
      top: `${triggerPosition.top}px`,
      left: `${triggerPosition.left}px`,
      width: `${triggerPosition.width}px`,
      height: "32px", // Approximate height of the badge
      borderRadius: "9999px", // Fully rounded (pill shape)
      opacity: 0
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Dynamic Island inspired popup */}
          <motion.div
            initial={triggerPosition ? getInitialStyle() : { scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              top: "50%", 
              left: "50%", 
              width: "100%", 
              maxWidth: "sm", 
              height: "auto",
              transform: "translate(-50%, -50%)",
              scale: 1, 
              opacity: 1, 
              y: 0,
              borderRadius: "0.75rem", // Rounded corners for final state
            }}
            exit={triggerPosition 
              ? { 
                  ...getInitialStyle(),
                  opacity: 0,
                  transition: { 
                    duration: 0.3,
                    ease: [0.32, 0.72, 0, 1] // Apple-like easing
                  }
                } 
              : { scale: 0.9, opacity: 0, y: 20 }
            }
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4,
              ease: [0.32, 0.72, 0, 1] // Apple-like easing for the expansion
            }}
            className="fixed z-50 overflow-hidden"
            style={{ 
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 209, 255, 0.15)"
            }}
          >
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden p-6 text-white h-full w-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex justify-between items-center mb-4"
              >
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Informazioni Agente
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="bg-black/40 border border-cyan-800/30 rounded-lg p-3">
                  <p className="text-sm text-gray-400">Codice agente:</p>
                  <p className="font-mono text-cyan-400 text-lg">{agentCode ?? "?????"}</p>
                </div>
                
                <div className="bg-black/40 border border-cyan-800/30 rounded-lg p-3">
                  <p className="text-sm text-gray-400">Status:</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <p className="text-green-400">Attivo</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400">
                  Il tuo codice identificativo personale nella rete M1SSION. Questo codice è univoco e ti identifica nel sistema.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
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
