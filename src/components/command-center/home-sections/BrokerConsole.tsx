
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClueData {
  id: string;
  code: string;
  title: string;
  reliability: number;
  cost: number;
  progressValue: number;
  description: string;
}

interface BrokerConsoleProps {
  credits: number;
  onPurchaseClue: (clue: ClueData) => void;
}

// Sample clues data for UI demonstration
const availableClues: ClueData[] = [
  {
    id: "c1",
    code: "Alpha01",
    title: "Coordinate iniziali",
    reliability: 90,
    cost: 200,
    progressValue: 5,
    description: "Indica il punto di partenza della missione con precisione GPS."
  },
  {
    id: "c2",
    code: "Beta19",
    title: "Indizio del parco",
    reliability: 75,
    cost: 150,
    progressValue: 3,
    description: "Suggerisce la presenza di un oggetto nascosto in un'area verde."
  },
  {
    id: "c3",
    code: "Delta7",
    title: "Codice digitale",
    reliability: 85,
    cost: 300,
    progressValue: 8,
    description: "Una sequenza numerica che sblocca un contenuto digitale importante."
  },
  {
    id: "c4",
    code: "Gamma22",
    title: "Frammento audio",
    reliability: 60,
    cost: 100,
    progressValue: 2,
    description: "Registrazione ambientale con suoni e voci che rivelano un indizio."
  },
  {
    id: "c5",
    code: "Omega99",
    title: "Foto satellitare",
    reliability: 95,
    cost: 450,
    progressValue: 12,
    description: "Immagine ad alta risoluzione di un'area urbana con dettagli cruciali."
  }
];

export function BrokerConsole({ credits, onPurchaseClue }: BrokerConsoleProps) {
  const [selectedClue, setSelectedClue] = useState<ClueData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter clues based on search query
  const filteredClues = availableClues.filter(clue => 
    clue.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClueSelect = (clue: ClueData) => {
    setSelectedClue(clue);
  };

  const handlePurchase = () => {
    if (selectedClue) {
      onPurchaseClue(selectedClue);
      setSelectedClue(null);
    }
  };

  // Function to render reliability indicator
  const renderReliabilityIndicator = (reliability: number) => {
    const getColor = () => {
      if (reliability >= 80) return "bg-green-500";
      if (reliability >= 60) return "bg-yellow-500";
      return "bg-red-500";
    };
    
    return (
      <div className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${getColor()}`}></span>
        <span className="text-xs">{reliability}%</span>
      </div>
    );
  };

  return (
    <motion.div
      className="glass-card p-4 h-full flex flex-col"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-3">
        <ShieldCheck className="text-blue-400 mr-2" size={20} />
        <h2 className="text-lg font-medium flex items-center">
          <span className="text-cyan-400">M1</span>
          <span className="text-white">SSION</span> 
          <span className="text-white ml-1">CONSOLE</span>
        </h2>
      </div>

      <div className="horizontal-line mb-4"></div>
      
      {/* Credits Display */}
      <div className="flex justify-between items-center mb-4 bg-blue-900/20 p-2 rounded-md">
        <span className="text-white">Crediti disponibili:</span>
        <span className="text-xl font-bold text-blue-400">{credits}</span>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Cerca indizio per codice o nome..."
          className="w-full bg-black/30 border border-blue-900/30 rounded pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Clues List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {filteredClues.length > 0 ? (
          <div className="space-y-2">
            {filteredClues.map((clue) => (
              <motion.div
                key={clue.id}
                className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                  selectedClue?.id === clue.id 
                    ? "bg-blue-900/30 border border-blue-500/50" 
                    : "bg-black/30 border border-gray-700/50 hover:border-blue-900/50"
                }`}
                onClick={() => handleClueSelect(clue)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-mono text-xs bg-blue-900/40 px-2 py-0.5 rounded text-blue-300 mr-2">
                        {clue.code}
                      </span>
                      {renderReliabilityIndicator(clue.reliability)}
                    </div>
                    <h3 className="font-medium text-white">{clue.title}</h3>
                  </div>
                  <div className="text-blue-400 font-bold">
                    {clue.cost}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 italic">
            Nessun indizio trovato con i criteri di ricerca attuali.
          </div>
        )}
      </div>
      
      {/* Selected Clue Details */}
      {selectedClue && (
        <div className="mt-4 pt-4 border-t border-blue-900/30">
          <div className="bg-black/30 p-3 rounded-md border border-blue-900/40">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-blue-400">{selectedClue.title}</h3>
              <div className="flex items-center">
                <Star className="text-yellow-500 mr-1" size={14} />
                <span className="text-gray-400 text-xs">+{selectedClue.progressValue}% progresso</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">{selectedClue.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Affidabilità: <span className="text-blue-400">{selectedClue.reliability}%</span>
              </div>
              <Button 
                onClick={handlePurchase}
                disabled={credits < selectedClue.cost}
                className={`${
                  credits >= selectedClue.cost 
                    ? "bg-blue-700 hover:bg-blue-600 text-white" 
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                } text-xs px-3 py-1 rounded`}
              >
                Acquista per {selectedClue.cost}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
