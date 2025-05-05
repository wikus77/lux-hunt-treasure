
import React, { useState, useEffect } from "react";
import { BadgeDollarSign, ShoppingCart, BarChart3, Info } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useToast } from "@/components/ui/use-toast";

interface ClueItem {
  id: string;
  code: string;
  title: string;
  cost: number;
  reliability: number;
  progressValue: number;
  description: string;
}

interface BrokerConsoleProps {
  credits: number;
  onPurchaseClue: (clue: ClueItem) => void;
}

export function BrokerConsole({ credits, onPurchaseClue }: BrokerConsoleProps) {
  const { toast } = useToast();
  const [availableClues, setAvailableClues] = useState<ClueItem[]>([]);
  const [selectedClue, setSelectedClue] = useState<ClueItem | null>(null);

  // Load sample clues
  useEffect(() => {
    // Sample clues data
    const sampleClues: ClueItem[] = [
      {
        id: "1",
        code: "ALPHA01",
        title: "Coordinate GPS anomale",
        cost: 200,
        reliability: 85,
        progressValue: 5,
        description: "Una serie di coordinate GPS che indicano un pattern insolito nell'area metropolitana."
      },
      {
        id: "2",
        code: "BRAVO02",
        title: "Testimone chiave",
        cost: 350,
        reliability: 72,
        progressValue: 7,
        description: "Informazioni da una fonte attendibile riguardo movimenti sospetti nella zona industriale."
      },
      {
        id: "3",
        code: "CHARLIE03",
        title: "Documento riservato",
        cost: 500,
        reliability: 90,
        progressValue: 12,
        description: "Una pagina di un documento confidenziale che menziona la posizione del bersaglio."
      },
      {
        id: "4",
        code: "DELTA04",
        title: "Registrazione audio",
        cost: 150,
        reliability: 60,
        progressValue: 3,
        description: "Una conversazione ambigua che potrebbe contenere indizi sulla localizzazione."
      }
    ];
    
    setAvailableClues(sampleClues);
  }, []);

  const handlePurchase = (clue: ClueItem) => {
    if (credits < clue.cost) {
      toast({
        title: "Crediti insufficienti",
        description: "Non hai abbastanza crediti per acquistare questo indizio.",
        variant: "destructive"
      });
      return;
    }
    
    onPurchaseClue(clue);
    
    toast({
      title: "Indizio acquistato",
      description: `Hai acquistato l'indizio ${clue.code}`,
    });
    
    // Remove the purchased clue from available clues
    setAvailableClues(prev => prev.filter(c => c.id !== clue.id));
    setSelectedClue(null);
  };

  return (
    <motion.div
      className="glass-card p-4 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BadgeDollarSign className="text-cyan-400 mr-2" size={20} />
          <h2 className="text-lg font-medium text-cyan-400">Console del Broker</h2>
        </div>
        <div className="bg-black/40 px-3 py-1 rounded-full flex items-center">
          <span className="text-yellow-400 font-mono font-bold">{credits}</span>
          <span className="ml-1 text-yellow-400/70 text-sm">CR</span>
        </div>
      </div>

      <div className="horizontal-line mb-4"></div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {availableClues.length > 0 ? (
          <div className="space-y-3">
            {availableClues.map(clue => (
              <motion.div
                key={clue.id}
                className={`bg-black/50 border border-gray-800 rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedClue?.id === clue.id ? "border-cyan-500/50" : "hover:border-gray-700"
                }`}
                onClick={() => setSelectedClue(clue.id === selectedClue?.id ? null : clue)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="text-cyan-300 font-mono text-sm">{clue.code}</span>
                      <span className="ml-2 bg-cyan-900/30 text-cyan-400 text-xs px-2 py-0.5 rounded-full">
                        {clue.reliability}% affidabilità
                      </span>
                    </div>
                    <h3 className="font-medium mt-1">{clue.title}</h3>
                  </div>
                  <div className="text-yellow-400 font-mono font-bold">
                    {clue.cost}
                  </div>
                </div>
                
                {/* Expanded content */}
                {selectedClue?.id === clue.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-gray-800/50"
                  >
                    <p className="text-sm text-gray-300 mb-3">{clue.description}</p>
                    <div className="flex justify-end gap-2">
                      <MagneticButton 
                        className="bg-gray-800 hover:bg-gray-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show more info about the clue
                          toast({
                            title: "Dettagli indizio",
                            description: `Affidabilità: ${clue.reliability}%, Valore progresso: +${clue.progressValue}%`,
                          });
                        }}
                      >
                        <Info size={14} className="mr-1" /> Info
                      </MagneticButton>
                      <MagneticButton 
                        className="bg-cyan-700 hover:bg-cyan-600 text-white py-1 px-3 rounded-md text-sm flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(clue);
                        }}
                      >
                        <ShoppingCart size={14} className="mr-1" /> Acquista
                      </MagneticButton>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BarChart3 size={32} className="text-gray-500 mb-2" />
            <p className="text-gray-400">Nessun indizio disponibile al momento</p>
            <p className="text-gray-500 text-sm mt-1">Controlla più tardi per nuovi aggiornamenti</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
