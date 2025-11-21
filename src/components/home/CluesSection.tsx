import { useState } from "react";
import { Button } from "@/components/ui/button";
import ClueCard from "@/components/clues/ClueCard";
import { clues } from "@/data/cluesData";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CluesSection = () => {
  const { unlockedClues, incrementUnlockedCluesAndAddClue, MAX_CLUES } = useBuzzClues();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      className="m1ssion-glass-card rounded-2xl p-4 cursor-pointer hover:border-cyan-500/30 transition-colors overflow-hidden relative"
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          <span className="text-white/80 text-sm">Indizi Disponibili</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
            <span className="text-cyan-400 font-mono font-bold">{unlockedClues} / {MAX_CLUES}</span>
            <span className="text-white/60 ml-1">sbloccati</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/60" />
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-4 pt-4 border-t border-white/10"
          >
            <div className="space-y-3">
              {clues.map((clue) => (
                <ClueCard 
                  key={clue.id} 
                  title={clue.title} 
                  description={clue.description} 
                  week={clue.week} 
                  isLocked={clue.isLocked} 
                  subscriptionType={clue.subscriptionType}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                onClick={incrementUnlockedCluesAndAddClue}
              >
                Sblocca Tutti gli Indizi
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CluesSection;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
