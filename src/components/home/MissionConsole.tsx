
import React from "react";
import { motion } from "framer-motion";
import { Coins, ShoppingCart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClueItem {
  id: string;
  code: string;
  description: string;
  progress: number;
  price: number;
  unlocked: boolean;
}

const MissionConsole: React.FC = () => {
  const availableCredits = 1020;
  
  const clueItems: ClueItem[] = [
    {
      id: "clu-001",
      code: "CLU-001",
      description: "Zona metropolitana centro",
      progress: 75,
      price: 50,
      unlocked: true
    },
    {
      id: "clu-002", 
      code: "CLU-002",
      description: "Edificio storico principale",
      progress: 40,
      price: 75,
      unlocked: true
    },
    {
      id: "clu-003",
      code: "CLU-003", 
      description: "Coordinate precise nascoste",
      progress: 0,
      price: 100,
      unlocked: false
    }
  ];

  return (
    <motion.div 
      className="bg-gradient-to-br from-[#1C1C1F] to-[#000000] rounded-[24px] border border-white/10 p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-orbitron font-bold text-white">
          Mission Console
        </h2>
        <div className="flex items-center gap-2 bg-[#FACC15]/20 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-[#FACC15]" />
          <span className="text-[#FACC15] font-bold">{availableCredits}</span>
        </div>
      </div>

      {/* Clue Items */}
      <div className="space-y-4">
        {clueItems.map((clue, index) => (
          <motion.div
            key={clue.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#00D1FF] font-mono text-sm font-bold">
                    {clue.code}
                  </span>
                  {!clue.unlocked && (
                    <Lock className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <p className="text-white/80 text-sm mb-3">
                  {clue.description}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Progresso</span>
                    <span className="text-[#00D1FF]">{clue.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${clue.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <Button
                  size="sm"
                  disabled={!clue.unlocked || availableCredits < clue.price}
                  className="bg-gradient-to-r from-[#7B2EFF] to-[#FC1EFF] hover:from-[#6A25CC] hover:to-[#E01BCC] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {clue.price}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Indizi disponibili</span>
          <span className="text-[#00D1FF] font-medium">{clueItems.filter(c => c.unlocked).length}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionConsole;
