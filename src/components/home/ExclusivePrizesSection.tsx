
import { useState } from "react";
import { motion } from "framer-motion";
import { mysteryPrizes } from "@/data/mysteryPrizesData";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExclusivePrizesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
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
                className="bg-black/40 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={prize.imageUrl} 
                    alt={`Premio ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-gradient-to-r from-gray-900/50 to-black border-cyan-500/30 hover:bg-black/60 group-hover:border-cyan-400/60"
                  >
                    <span>Scopri la missione</span>
                    <ChevronRight size={16} className="text-cyan-400" />
                  </Button>
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
