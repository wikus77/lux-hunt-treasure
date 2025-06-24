
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Coins, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientBox from "@/components/ui/gradient-box";

interface Clue {
  id: string;
  code: string;
  title: string;
  description: string;
  cost: number;
  difficulty: "easy" | "medium" | "hard";
  progressValue: number;
  category: "location" | "object" | "person" | "event";
}

interface BrokerConsoleProps {
  credits: number;
  onPurchaseClue: (clue: Clue) => void;
}

export function BrokerConsole({ credits, onPurchaseClue }: BrokerConsoleProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock clues data
  const availableClues: Clue[] = [
    {
      id: "CL001",
      code: "URBAN-SEEK-001",
      title: "Punto di Partenza",
      description: "Il primo luogo da visitare nella tua missione urbana",
      cost: 50,
      difficulty: "easy",
      progressValue: 5,
      category: "location"
    },
    {
      id: "CL002", 
      code: "URBAN-SEEK-002",
      title: "Oggetto Nascosto",
      description: "Un indizio su cosa cercare nel primo checkpoint",
      cost: 75,
      difficulty: "medium",
      progressValue: 8,
      category: "object"
    },
    {
      id: "CL003",
      code: "URBAN-SEEK-003", 
      title: "Contatto Segreto",
      description: "Informazioni su chi può aiutarti nella missione",
      cost: 100,
      difficulty: "hard",
      progressValue: 12,
      category: "person"
    },
    {
      id: "CL004",
      code: "URBAN-SEEK-004",
      title: "Evento Critico",
      description: "Timing perfetto per il completamento della missione",
      cost: 125,
      difficulty: "hard", 
      progressValue: 15,
      category: "event"
    }
  ];

  const categories = [
    { id: "all", label: "Tutti", icon: Eye },
    { id: "location", label: "Luoghi", icon: Eye },
    { id: "object", label: "Oggetti", icon: Eye },
    { id: "person", label: "Persone", icon: Eye },
    { id: "event", label: "Eventi", icon: Eye }
  ];

  const filteredClues = selectedCategory === "all" 
    ? availableClues 
    : availableClues.filter(clue => clue.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 bg-green-400/10";
      case "medium": return "text-yellow-400 bg-yellow-400/10";
      case "hard": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <GradientBox className="w-full h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION<span className="text-xs align-top">™</span> CONSOLE</span>
          </h2>
          <div className="flex items-center space-x-2 bg-yellow-500/10 px-3 py-1 rounded-full">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{credits}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`text-xs ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  : "bg-transparent border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <category.icon className="w-3 h-3 mr-1" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Clues List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredClues.map((clue, index) => (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{clue.title}</h3>
                  <p className="text-xs text-cyan-400 font-mono">{clue.code}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(clue.difficulty)}`}>
                  {clue.difficulty.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-white/70 mb-3">{clue.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-xs text-white/60">
                  <span>+{clue.progressValue}% progresso</span>
                </div>
                
                <Button
                  onClick={() => onPurchaseClue(clue)}
                  disabled={credits < clue.cost}
                  size="sm"
                  className={`${
                    credits >= clue.cost
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      : "bg-gray-600 cursor-not-allowed"
                  } text-white font-medium`}
                >
                  {credits >= clue.cost ? (
                    <>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {clue.cost} crediti
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      {clue.cost} crediti
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClues.length === 0 && (
          <div className="text-center py-8 text-white/50">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nessun indizio disponibile in questa categoria</p>
          </div>
        )}
      </div>
    </GradientBox>
  );
}
