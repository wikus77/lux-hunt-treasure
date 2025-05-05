
import { PlusCircle, Filter, Map, HelpCircle, Zap } from "lucide-react";
import { MapFilters } from "@/components/maps/MapFilters";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import M1ssionText from "@/components/logo/M1ssionText";
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MapHeaderProps {
  onAddMarker: () => void;
  onAddArea: () => void;
  onHelp: () => void;
  onBuzz: () => void;
  isAddingMarker: boolean;
  isAddingArea: boolean;
  buzzMapPrice: number;
}

const MapHeader = ({
  onAddMarker,
  onAddArea,
  onHelp,
  onBuzz,
  isAddingMarker,
  isAddingArea,
  buzzMapPrice,
}: MapHeaderProps) => {
  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
    toast("Filtri applicati", {
      description: `Hai aggiornato i filtri della mappa`,
      duration: 3000,
    });
  };

  const [agentCode, setAgentCode] = useState("AG-X480");
  const [showCodeText, setShowCodeText] = useState(false);

  useEffect(() => {
    const savedAgentCode = localStorage.getItem('agentCode');
    if (savedAgentCode) {
      setAgentCode(savedAgentCode);
    }
    
    // Typewriter effect for agent dossier
    const timer = setTimeout(() => {
      setShowCodeText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="sticky top-16 z-10 w-full bg-black/50 backdrop-blur-sm py-3 px-4 border-b border-projectx-deep-blue/30">
      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-4">
            <M1ssionText />
            
            {/* Agent dossier code with typewriter effect - visible only on larger screens */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden md:flex items-center ml-2"
            >
              <span className="text-cyan-400 font-mono text-xs mr-1">DOSSIER AGENTE:</span>
              <motion.span 
                className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded text-xs"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {agentCode}
              </motion.span>
            </motion.div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={onAddMarker}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm ${
                  isAddingMarker
                    ? "bg-projectx-blue text-white"
                    : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Punto</span>
              </button>

              <button
                onClick={onAddArea}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm ${
                  isAddingArea
                    ? "bg-projectx-blue text-white"
                    : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Area</span>
              </button>

              <MapFilters onFilterChange={handleFilterChange} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onHelp}
              className="bg-black/40 border border-projectx-deep-blue/40 py-1.5 px-3 rounded-md flex items-center gap-1.5 hover:bg-black/60 text-sm press-effect"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Aiuto</span>
            </button>

            <button
              onClick={onBuzz}
              className="bg-gradient-to-r from-projectx-blue to-projectx-pink w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 text-sm press-effect shadow-[0_0_10px_rgba(217,70,239,0.5)]"
            >
              <Zap className="h-5 w-5" />
              <span className="sr-only">Buzz Map - {buzzMapPrice.toFixed(2)}€</span>
            </button>
          </div>
        </div>
        
        {/* Mobile agent code - only visible on small screens */}
        <motion.div 
          className="md:hidden flex justify-center items-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-cyan-400 font-mono text-[10px] mr-1">DOSSIER:</span>
          <motion.span 
            className="font-mono text-white bg-cyan-900/30 px-1.5 py-0.5 rounded text-[10px]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {agentCode}
          </motion.span>
        </motion.div>
        
        {/* Countdown Timer - centered */}
        <div className="flex justify-center mt-2">
          <CountdownTimer targetDate={getMissionDeadline()} />
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
