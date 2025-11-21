
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
    <div className="mt-8 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl overflow-hidden shadow-xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
            <span className="text-cyan-400">📦</span> Premi Esclusivi M1SSION
          </h2>
          
          <p className="text-gray-300 text-center mb-6">
            Scopri le auto di lusso che potrai vincere partecipando alle missioni M1SSION
          </p>
          
          {/* Gradient divider */}
          <div className="h-0.5 w-full mb-6 bg-gradient-to-r from-purple-600 via-cyan-500 to-blue-500" />
          
          {/* Prize cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="card-front bg-black/40 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500/30 transition-colors group">
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
                  <div className="card-back bg-black/70 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500/30 transition-colors p-4">
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
          
          {/* Call to action */}
          <div className="mt-6 text-center">
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:opacity-90 text-white"
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
