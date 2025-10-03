import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { mysteryPrizes } from "@/data/mysteryPrizesData";
import "../../styles/animations/flip-card.css";

interface MonthlyPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonthlyPrizesModal = ({ isOpen, onClose }: MonthlyPrizesModalProps) => {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="fixed inset-4 md:inset-x-8 md:top-[5%] md:bottom-[5%] z-[101] mx-auto max-w-4xl overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid #00D1FF',
              boxShadow: '0 0 50px rgba(0, 209, 255, 0.5), 0 0 100px rgba(0, 209, 255, 0.3), inset 0 0 30px rgba(0, 209, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div 
              className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 backdrop-blur-xl border-b"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 209, 255, 0.4)'
              }}
            >
              <h2 
                className="text-xl md:text-3xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              >
                PREMI MENSILI
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-cyan-500/20"
                style={{ color: '#00D1FF' }}
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto h-full pb-6 px-4 md:px-6 pt-6">
              <p className="text-white/70 text-xs md:text-sm mb-6 text-center">
                Premi in palio durante la M1SSION mensile corrente - Tocca le card per scoprire i dettagli
              </p>

              {/* Prizes Grid with Flip Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {mysteryPrizes.map((prize, index) => (
                  <div
                    key={index}
                    className="perspective-1000 h-72 cursor-pointer"
                    onClick={() => toggleFlip(index)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`card transform-style-3d w-full h-full transition-transform duration-700 ${flippedCards.includes(index) ? 'rotate-y-180' : ''}`}
                    >
                      {/* FRONT */}
                      <div 
                        className="card-front absolute w-full h-full backface-hidden rounded-xl overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))',
                          border: '1px solid rgba(0, 209, 255, 0.4)',
                          boxShadow: '0 0 25px rgba(0, 209, 255, 0.2)'
                        }}
                      >
                        <div 
                          className="h-3/5 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${prize.imageUrl})` }}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 60%)'
                            }}
                          />
                        </div>
                        <div className="p-4 h-2/5 flex flex-col justify-center relative">
                          <div 
                            className="absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-[10px] font-bold"
                            style={{
                              background: 'rgba(0, 209, 255, 0.2)',
                              border: '1px solid #00D1FF',
                              borderTop: 'none',
                              borderRight: 'none',
                              color: '#00D1FF'
                            }}
                          >
                            PREMIO #{index + 1}
                          </div>
                          <p className="text-xs md:text-sm text-white/90 leading-relaxed line-clamp-3">
                            {prize.description}
                          </p>
                          <p className="text-[10px] md:text-xs text-cyan-300/80 italic mt-3">
                            👆 Tocca per scoprire di più →
                          </p>
                        </div>
                      </div>

                      {/* BACK */}
                      <div 
                        className="card-back absolute w-full h-full backface-hidden rotate-y-180 rounded-xl p-6 flex flex-col justify-center items-center text-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 100, 130, 0.5), rgba(0, 50, 100, 0.5))',
                          border: '2px solid rgba(0, 209, 255, 0.6)',
                          boxShadow: '0 0 40px rgba(0, 209, 255, 0.4), inset 0 0 30px rgba(0, 209, 255, 0.1)'
                        }}
                      >
                        <div className="space-y-4">
                          <div 
                            className="text-xs md:text-sm font-bold px-3 py-1 rounded-full inline-block"
                            style={{
                              background: 'rgba(0, 209, 255, 0.3)',
                              border: '1px solid #00D1FF',
                              color: '#00D1FF'
                            }}
                          >
                            PREMIO #{index + 1}
                          </div>
                          <p className="text-white text-sm md:text-base leading-relaxed px-2">
                            {prize.description}
                          </p>
                          <div className="pt-4 space-y-2">
                            <p className="text-cyan-300 text-xs md:text-sm font-orbitron">
                              🗓️ Disponibile questo mese
                            </p>
                            <p className="text-cyan-300 text-xs md:text-sm font-orbitron">
                              📍 Italia
                            </p>
                          </div>
                          <p className="text-[10px] md:text-xs text-cyan-300/70 italic pt-2">
                            ← Tocca per tornare
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="px-6 md:px-8 py-3 rounded-full font-orbitron font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00D1FF, #0080FF)',
                    boxShadow: '0 0 30px rgba(0, 209, 255, 0.5), 0 4px 20px rgba(0, 209, 255, 0.3)'
                  }}
                >
                  INIZIA LA M1SSION
                </button>
                <p className="text-white/50 text-xs mt-3">
                  Completa le sfide per sbloccare questi premi
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MonthlyPrizesModal;
