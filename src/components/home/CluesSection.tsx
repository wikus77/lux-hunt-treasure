import { useState } from "react";
import { Button } from "@/components/ui/button";
import ClueCard from "@/components/clues/ClueCard";
import { clues } from "@/data/cluesData";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export const CluesSection = () => {
  const { unlockedClues, incrementUnlockedCluesAndAddClue, MAX_CLUES } = useBuzzClues();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="m1-card m1-elev-1 p-6 mb-8 m1-motion w-full"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center mb-4 w-full text-left"
      >
        <h2 className="m1-title text-xl">Indizi Disponibili</h2>
        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1 rounded-full bg-cyan-500/20">
            <span className="text-cyan-400 font-mono font-bold">{unlockedClues} / {MAX_CLUES}</span>
            <span className="text-gray-400 ml-1">sbloccati</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="m1-hairline mb-4" />
          
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
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 m1-tint m1-motion"
              onClick={incrementUnlockedCluesAndAddClue}
            >
              Sblocca Tutti gli Indizi
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CluesSection;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
