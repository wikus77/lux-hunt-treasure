
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Lock, Unlock, Coins, Info } from 'lucide-react';

interface Clue {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  progressValue: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface BrokerConsoleProps {
  credits: number;
  purchasedClues: Clue[];
  onPurchaseClue: (clue: Clue) => void;
}

export const BrokerConsole: React.FC<BrokerConsoleProps> = ({ 
  credits, 
  purchasedClues, 
  onPurchaseClue 
}) => {
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  const availableClues: Clue[] = [
    {
      id: "clue-001",
      code: "ALPHA-7",
      title: "Traccia Fotografica",
      description: "Immagine georeferenziata della zona target con coordinate precise.",
      cost: 150,
      progressValue: 8,
      difficulty: "easy",
      category: "Navigazione"
    },
    {
      id: "clue-002",
      code: "BRAVO-12",
      title: "Codice di Accesso",
      description: "Sequenza numerica per l'apertura del primo checkpoint.",
      cost: 250,
      progressValue: 12,
      difficulty: "medium",
      category: "Sicurezza"
    },
    {
      id: "clue-003",
      code: "CHARLIE-9",
      title: "Intel Temporale",
      description: "Orario esatto di attivazione del prossimo obiettivo.",
      cost: 300,
      progressValue: 15,
      difficulty: "medium",
      category: "Timing"
    },
    {
      id: "clue-004",
      code: "DELTA-15",
      title: "Bypass Quantico",
      description: "Protocollo avanzato per aggirare i sistemi di sicurezza.",
      cost: 500,
      progressValue: 25,
      difficulty: "hard",
      category: "Hacking"
    }
  ];

  const unpurchasedClues = availableClues.filter(
    clue => !purchasedClues.some(purchased => purchased.id === clue.id)
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 border-green-400/30";
      case "medium": return "text-yellow-400 border-yellow-400/30";
      case "hard": return "text-red-400 border-red-400/30";
      default: return "text-gray-400 border-gray-400/30";
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl border border-yellow-500/30 p-6"
      style={{
        boxShadow: "0 0 20px rgba(255, 193, 7, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-orbitron font-bold text-white">BROKER CONSOLE</h3>
        </div>
        
        <div className="flex items-center space-x-2 bg-black/30 px-3 py-2 rounded-lg border border-yellow-400/20">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-orbitron font-bold text-yellow-400">{credits}</span>
          <span className="text-xs font-orbitron text-yellow-400/70">CREDITI</span>
        </div>
      </div>

      {/* Clues List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {unpurchasedClues.map((clue) => (
          <motion.div
            key={clue.id}
            className={`bg-black/30 rounded-lg p-4 border cursor-pointer transition-all duration-300 ${
              selectedClue?.id === clue.id 
                ? 'border-cyan-400/50 bg-cyan-400/5' 
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => setSelectedClue(clue)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-orbitron text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">
                  {clue.code}
                </span>
                <span className={`text-xs font-orbitron px-2 py-1 rounded-full border ${getDifficultyColor(clue.difficulty)}`}>
                  {clue.difficulty.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-orbitron font-bold text-yellow-400">
                  {clue.cost}
                </span>
                <Coins className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <h4 className="text-sm font-orbitron font-bold text-white mb-1">
              {clue.title}
            </h4>
            
            <p className="text-xs text-white/70 mb-2">
              {clue.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-orbitron text-purple-400">
                +{clue.progressValue}% PROGRESSO
              </span>
              <span className="text-xs font-orbitron text-white/50">
                {clue.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Button */}
      {selectedClue && (
        <motion.div
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className={`w-full font-orbitron font-bold py-3 px-4 rounded-lg transition-all duration-300 ${
              credits >= selectedClue.cost
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-400/50'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => selectedClue && credits >= selectedClue.cost && onPurchaseClue(selectedClue)}
            disabled={credits < selectedClue.cost}
            whileHover={credits >= selectedClue.cost ? { scale: 1.02 } : {}}
            whileTap={credits >= selectedClue.cost ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-center space-x-2">
              {credits >= selectedClue.cost ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>
                {credits >= selectedClue.cost 
                  ? `ACQUISTA ${selectedClue.code}` 
                  : 'CREDITI INSUFFICIENTI'
                }
              </span>
            </div>
          </motion.button>
          
          {selectedClue && (
            <div className="mt-3 p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-400">
                  <strong>{selectedClue.title}:</strong> {selectedClue.description}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {unpurchasedClues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50 font-orbitron text-sm">
            Tutti gli indizi sono stati acquistati
          </p>
        </div>
      )}
    </motion.div>
  );
};
