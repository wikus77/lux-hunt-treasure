
import { useState } from "react";
import { motion } from "framer-motion";
import { mysteryPrizes } from "@/data/mysteryPrizesData";
import { ChevronRight, ChevronLeft, Gauge, Zap, Fuel, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExclusivePrizesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  
  const toggleCardFlip = (index: number) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  // Prevent default event for double-click
  const handleCardEvents = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <div className="mt-4 mb-8"> {/* 🚀 NATIVE: Margini ridotti */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div 
          className="m1ssion-glass-card p-4 sm:p-6 overflow-hidden relative m1-border-glow m1-card-compact"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 209, 255, 0.3)'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00D1FF] via-[#7B2EFF] via-[#F059FF] to-[#FACC15] opacity-90" />
          <h2 className="text-2xl font-bold mb-3 text-center flex items-center justify-center gap-2 neon-text-cyan font-orbitron">
            <span className="text-cyan-400">📦</span> Premi Esclusivi M1SSION
          </h2>
          
          <p className="text-gray-300 text-center mb-6">
            Scopri le auto di lusso che potrai vincere partecipando alle missioni M1SSION
          </p>
          
          {/* Gradient divider */}
          <div className="h-0.5 w-full mb-6 bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-500" />
          
          {/* Prize cards - 🚀 NATIVE: Grid più compatta */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 m1-dense-grid">
            {mysteryPrizes.map((prize, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card-container perspective-1000 cursor-pointer"
                onClick={() => toggleCardFlip(index)}
                onDoubleClick={handleCardEvents}
                onMouseDown={handleCardEvents}
                onTouchStart={handleCardEvents}
                onKeyDown={(e) => e.key === "Enter" && toggleCardFlip(index)}
                tabIndex={0}
                role="button"
                aria-pressed={flippedCards.includes(index)}
              >
                <div 
                  className={`card relative h-full transition-transform duration-700 transform-style-3d ${flippedCards.includes(index) ? 'is-flipped' : ''}`}
                >
                  {/* Front of card */}
                  <div 
                    className="card-front rounded-lg overflow-hidden group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={prize.imageUrl} 
                        alt={`Premio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {prize.description.split(',')[0]}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        {prize.description.split(',')[1] || "Auto esclusiva per gli agenti M1SSION"}
                      </p>
                      
                      <div className="flex items-center justify-center mt-2 text-xs text-cyan-400">
                        <span>Tocca per dettagli</span>
                        <RotateCw size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Back of card */}
                  <div 
                    className="card-back rounded-lg overflow-hidden p-4"
                    style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div className="h-full flex flex-col">
                      <h3 className="text-lg font-bold text-cyan-400 mb-3 text-center">
                        {prize.description.split(',')[0]}
                      </h3>
                      
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center text-gray-200">
                          <Gauge className="text-cyan-500 mr-2" size={18} />
                          <span className="font-medium">Potenza:</span>
                          <span className="ml-auto">{index === 0 ? "670 CV" : index === 1 ? "780 CV" : "760 CV"}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-200">
                          <Zap className="text-cyan-500 mr-2" size={18} />
                          <span className="font-medium">0-100 km/h:</span>
                          <span className="ml-auto">{index === 0 ? "3.0s" : index === 1 ? "2.9s" : "2.8s"}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-200">
                          <RotateCw className="text-cyan-500 mr-2" size={18} />
                          <span className="font-medium">Cambio:</span>
                          <span className="ml-auto">{index === 0 ? "Automatico 7" : index === 1 ? "Doppia frizione" : "Sequenziale"}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-200">
                          <Fuel className="text-cyan-500 mr-2" size={18} />
                          <span className="font-medium">Motore:</span>
                          <span className="ml-auto">{index === 0 ? "V8 Turbo" : index === 1 ? "V12" : "V10"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center mt-4 text-xs text-cyan-400">
                        <span>Tocca per tornare</span>
                        <RotateCw size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Call to action - 🚀 NATIVE: Pulsante più grande con breathing */}
          <div className="mt-5 text-center">
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:opacity-90 text-white prize-card-btn px-8 py-3 text-base font-semibold m1-breathing m1-glow-pulse m1-touch-feedback"
            >
              Partecipa alle missioni
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExclusivePrizesSection;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
