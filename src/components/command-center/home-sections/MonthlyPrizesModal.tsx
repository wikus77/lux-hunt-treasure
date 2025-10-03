import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "@/styles/animations/flip-card.css";
import lamborghiniImg from "@/assets/prizes/lamborghini-huracan.png";
import rolexImg from "@/assets/prizes/rolex-submariner.png";
import hermesImg from "@/assets/prizes/hermes-birkin.png";
import iphoneImg from "@/assets/prizes/iphone-16-pro-max.png";
import airpodsImg from "@/assets/prizes/airpods-max.png";

interface MonthlyPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonthlyPrizesModal = ({ isOpen, onClose }: MonthlyPrizesModalProps) => {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const prizes = [
    {
      name: "Lamborghini Huracán Experience",
      image: lamborghiniImg,
      description: "🏎️ Lamborghini Huracán Experience — Un weekend adrenalina pura."
    },
    {
      name: "Rolex Submariner",
      image: rolexImg,
      description: "⌚ Rolex Submariner — Precisione e stile intramontabile."
    },
    {
      name: "Hermès Birkin",
      image: hermesImg,
      description: "👜 Hermès Birkin — Eleganza senza compromessi."
    },
    {
      name: "iPhone 16 Pro Max",
      image: iphoneImg,
      description: "📱 iPhone 16 Pro Max — Tecnologia all'avanguardia."
    },
    {
      name: "AirPods Max",
      image: airpodsImg,
      description: "🎧 AirPods Max — Immersivo, ovunque."
    }
  ];

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

          {/* Modal Content - Same style as PrizeVision GradientBox */}
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
            className="fixed inset-4 md:inset-x-8 md:top-[5%] md:bottom-[5%] z-[101] mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
            style={{
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
              <h2 className="text-xl md:text-2xl font-orbitron font-bold">
                <span className="text-[#00D1FF]" style={{ 
                  textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                }}>PREMI</span>
                <span className="text-white"> MENSILI</span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-white/10 text-white"
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
                {prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="perspective-1000 h-64 cursor-pointer"
                    onClick={() => toggleFlip(index)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`mission-flip-card w-full h-full ${flippedCards.includes(index) ? 'is-flipped' : ''}`}
                    >
                      {/* FRONT */}
                      <div className="mission-card-front bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="h-3/5 overflow-hidden">
                          <img 
                            src={prize.image} 
                            alt={prize.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 h-2/5 flex flex-col justify-center">
                          <h3 className="font-orbitron text-base md:text-lg font-bold text-cyan-400 mb-2">{prize.name}</h3>
                          <p className="text-xs text-cyan-300/70 italic">👆 Tocca per scoprire →</p>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className="mission-card-back bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <p className="text-white text-sm md:text-base leading-relaxed mb-4">
                          {prize.description}
                        </p>
                        <div className="space-y-2 text-xs text-white/70">
                          <p>🗓️ Disponibile questo mese</p>
                          <p>📍 Italia</p>
                        </div>
                        <p className="text-xs text-cyan-300/70 italic mt-4">← Tocca per tornare</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="px-6 md:px-8 py-3 rounded-full font-orbitron font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all"
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
