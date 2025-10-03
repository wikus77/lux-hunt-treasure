import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, MapPin, Calendar, Sparkles } from "lucide-react";
import { mysteryPrizes } from "@/data/mysteryPrizesData";

interface MonthlyPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonthlyPrizesModal = ({ isOpen, onClose }: MonthlyPrizesModalProps) => {
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
            className="fixed inset-x-4 top-[5%] bottom-[5%] z-[101] mx-auto max-w-2xl overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              border: '2px solid #00D1FF',
              boxShadow: '0 0 40px rgba(0, 209, 255, 0.4), 0 0 80px rgba(0, 209, 255, 0.2), inset 0 0 20px rgba(0, 209, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div 
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(0, 209, 255, 0.3)'
              }}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#00D1FF]" />
                <h2 className="text-2xl font-bold" style={{ color: '#00D1FF' }}>
                  PREMI MENSILI
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:bg-white/10"
                style={{ color: '#00D1FF' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto h-full pb-24 px-6 pt-6">
              <p className="text-white/70 text-sm mb-6 text-center">
                Premi in palio durante la M1SSION mensile corrente
              </p>

              {/* Prizes Grid */}
              <div className="space-y-6">
                {mysteryPrizes.map((prize, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 209, 255, 0.1)'
                    }}
                  >
                    {/* Prize Image */}
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${prize.imageUrl})` }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)'
                        }}
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                        style={{
                          background: 'rgba(0, 209, 255, 0.2)',
                          border: '1px solid #00D1FF',
                          color: '#00D1FF'
                        }}
                      >
                        <Trophy className="w-3 h-3 inline mr-1" />
                        PREMIO #{index + 1}
                      </div>
                    </div>

                    {/* Prize Info */}
                    <div className="p-4">
                      <p className="text-white text-sm leading-relaxed">
                        {prize.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Questo mese</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Italia</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-lg font-bold text-black transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00D1FF, #00A3CC)',
                    boxShadow: '0 4px 20px rgba(0, 209, 255, 0.4)'
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
