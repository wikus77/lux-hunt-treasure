// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface M1ssionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const M1ssionInfoModal: React.FC<M1ssionInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-cyan-400/20">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">
                  <span style={{ color: "#00E5FF" }}>M1</span>
                  <span style={{ color: "white" }}>SSION</span>
                  <span className="text-xs align-top" style={{ color: "white" }}>™</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 text-white">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-cyan-400">Come Funziona</h3>
                  <p className="text-gray-300 leading-relaxed">
                    M1SSION™ è un'esperienza interattiva che combina elementi di gioco, sfida intellettuale e premi reali. 
                    I partecipanti devono risolvere enigmi, trovare indizi nascosti e completare missioni per avanzare nel gioco.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-cyan-400">Abbonamenti Disponibili</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800 p-4 rounded-lg border border-cyan-400/20">
                      <h4 className="font-semibold text-cyan-400">Basic Hunter</h4>
                      <p className="text-gray-300">Accesso alle missioni base e indizi standard</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-purple-400/20">
                      <h4 className="font-semibold text-purple-400">Pro Seeker</h4>
                      <p className="text-gray-300">Accesso a missioni avanzate e indizi esclusivi</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-yellow-400/20">
                      <h4 className="font-semibold text-yellow-400">Elite Master</h4>
                      <p className="text-gray-300">Accesso completo con premi premium e supporto prioritario</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-cyan-400">Il Gioco</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Ogni missione è progettata per testare le tue capacità di osservazione, logica e intuizione. 
                    Gli indizi sono nascosti in bella vista, camuffati nella realtà quotidiana. 
                    Solo chi sa vedere oltre l'apparenza può avanzare e conquistare i premi finali.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <p className="text-yellow-400 font-semibold">IT IS POSSIBLE</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default M1ssionInfoModal;