
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden p-6 text-white shadow-lg"
                 style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 209, 255, 0.15)" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Informazioni Agente
                </h3>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
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
              </div>
              
              <Button 
                onClick={onClose} 
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-black"
              >
                Chiudi
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentInfoPopup;
