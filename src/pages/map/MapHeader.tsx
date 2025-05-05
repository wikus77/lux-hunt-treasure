
import { PlusCircle, Filter, Map, HelpCircle, Zap } from "lucide-react";
import { MapFilters } from "@/components/maps/MapFilters";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import M1ssionText from "@/components/logo/M1ssionText";
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <>
      {/* Main Header - Similar structure to other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <M1ssionText />
              
              {/* Agent dossier code with typewriter effect - desktop only */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="hidden sm:flex items-center ml-2"
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
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onHelp}
                className="bg-black/40 border border-projectx-deep-blue/40 p-2 rounded-full flex items-center justify-center hover:bg-black/60 text-xs sm:text-sm press-effect min-h-[44px] min-w-[44px]"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Aiuto</span>
              </button>

              <button
                onClick={onBuzz}
                className="bg-gradient-to-r from-projectx-blue to-projectx-pink w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
              >
                <Zap className="h-5 w-5" />
                <span className="sr-only">Buzz Map - {buzzMapPrice.toFixed(2)}€</span>
              </button>
            </div>
          </div>

          {/* Mobile agent code - only visible on small screens */}
          <motion.div 
            className="sm:hidden flex justify-center items-center py-1"
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
          <div className="flex justify-center py-1">
            <CountdownTimer targetDate={getMissionDeadline()} />
          </div>
        </div>
      </header>
      
      {/* Toolbar for map actions - moved below header with proper spacing */}
      <div className="fixed top-[105px] sm:top-[95px] left-0 right-0 z-40 bg-black/40 backdrop-blur-md py-2 px-3 border-b border-projectx-deep-blue/30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAddMarker}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-md text-sm min-h-[44px] min-w-[44px] touch-manipulation ${
                isAddingMarker
                  ? "bg-projectx-blue text-white"
                  : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Punto</span>
            </button>

            <button
              onClick={onAddArea}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-md text-sm min-h-[44px] min-w-[44px] touch-manipulation ${
                isAddingArea
                  ? "bg-projectx-blue text-white"
                  : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
              }`}
            >
              <Map className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Area</span>
            </button>

            {/* Wrapped in div for mobile optimization */}
            <div className="min-h-[44px] min-w-[44px] touch-manipulation">
              <MapFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapHeader;
