
import React, { useState } from "react";
import { motion } from "framer-motion";

interface ClueItem {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  progressValue: number;
  alreadyPurchased?: boolean;
}

interface BrokerConsoleProps {
  credits: number;
  onPurchaseClue: (clue: ClueItem) => void;
}

export function BrokerConsole({ credits, onPurchaseClue }: BrokerConsoleProps) {
  // Sample clues data
  const clues: ClueItem[] = [
    {
      id: "c1",
      code: "CLU-001",
      title: "Posizione approssimativa",
      description: "La merce si trova in un raggio di 500m dal punto indicato sulla mappa.",
      cost: 200,
      progressValue: 5,
    },
    {
      id: "c2",
      code: "CLU-002",
      title: "Tipologia edificio",
      description: "La merce è nascosta all'interno di un edificio storico.",
      cost: 350,
      progressValue: 8,
    },
    {
      id: "c3",
      code: "CLU-003",
      title: "Accesso riservato",
      description: "Per accedere alla location è necessario un codice speciale.",
      cost: 500,
      progressValue: 12,
    },
    {
      id: "c4",
      code: "CLU-004",
      title: "Orari disponibilità",
      description: "La merce è accessibile solo in determinati orari.",
      cost: 150,
      progressValue: 4,
    },
  ];

  const [hoveredClue, setHoveredClue] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-xl" style={{ 
      background: "linear-gradient(180deg, rgba(19, 21, 36, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.06)"
    }}>
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION CONSOLE</span>
        </h2>
        
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#00D1FF] text-white text-sm font-medium">
          {credits} Crediti
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="text-white/70 text-sm mb-2">
          Acquista indizi per progredire nella missione:
        </div>
        
        {clues.map((clue) => (
          <motion.div
            key={clue.id}
            className="p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 transition-colors"
            whileHover={{ scale: 1.01 }}
            onMouseEnter={() => setHoveredClue(clue.id)}
            onMouseLeave={() => setHoveredClue(null)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">
                    {clue.code}
                  </span>
                  <h3 className="text-white ml-2 font-medium">{clue.title}</h3>
                </div>
                {(hoveredClue === clue.id) && (
                  <motion.p 
                    className="text-xs text-white/60 mt-1 ml-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    {clue.description}
                  </motion.p>
                )}
              </div>
              
              <button
                className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white text-sm font-medium hover:shadow-[0_0_10px_rgba(0,209,255,0.4)] transition-all"
                onClick={() => onPurchaseClue(clue)}
                disabled={credits < clue.cost}
              >
                {clue.cost} CR
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
