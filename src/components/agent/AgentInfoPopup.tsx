
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

  // Define animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1] // Apple-like easing
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Dynamic styles based on the open state and trigger position
  const getContentContainerStyles = () => {
    // Base styles that apply to both states
    const baseStyles = {
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 209, 255, 0.15)",
      transition: "top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease, border-radius 0.4s ease, transform 0.4s ease",
      overflow: "hidden" as const
    };

    // If we have a trigger position and are animating from it
    if (triggerPosition) {
      return {
        ...baseStyles,
        position: "fixed" as const,
        top: isOpen ? "50%" : triggerPosition.top,
        left: isOpen ? "50%" : triggerPosition.left,
        transform: isOpen ? "translate(-50%, -50%)" : "none",
        width: isOpen ? "100%" : triggerPosition.width,
        maxWidth: isOpen ? "32rem" : triggerPosition.width,
        height: isOpen ? "auto" : "32px",
        borderRadius: isOpen ? "0.75rem" : "9999px"
      };
    }

    // Default centered styles if no trigger position
    return {
      ...baseStyles,
      position: "fixed" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      maxWidth: "32rem",
      borderRadius: "0.75rem"
    };
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
          />
          
          {/* Dynamic Island inspired popup */}
          <motion.div
            className="fixed z-50"
            style={getContentContainerStyles()}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
