
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
import { supabase } from "@/integrations/supabase/client";

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
  
  // Special admin constants
  const SPECIAL_ADMIN_EMAIL = 'wikus77@hotmail.it';
  const SPECIAL_ADMIN_CODE = 'X0197';

  useEffect(() => {
    const fetchAgentCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user is the special admin
          if (user.email?.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase()) {
            setAgentCode(SPECIAL_ADMIN_CODE);
            return;
          }
          
          // Otherwise check if they have an agent code in their profile
          const { data } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();
            
          if (data?.agent_code) {
            setAgentCode(data.agent_code);
          }
        }
      } catch (error) {
        console.error("Error fetching agent code:", error);
      }
    };
    
    fetchAgentCode();
    
    // Typewriter effect for agent dossier - increased to 2 seconds
    const timer = setTimeout(() => {
      setShowCodeText(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Main Header - Similar structure to other pages */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <M1ssionText />
              
              {/* Agent dossier code with typewriter effect - desktop only */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="hidden sm:flex items-center ml-2"
              >
                <span className="text-cyan-400 font-mono text-xs mr-1">DOSSIER:</span>
                <motion.span 
                  className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded-md text-xs"
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
                className="bg-black/40 border border-projectx-deep-blue/40 p-1.5 rounded-full flex items-center justify-center hover:bg-black/60 text-xs sm:text-sm press-effect min-h-[40px] min-w-[40px]"
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Aiuto</span>
              </button>

              <button
                onClick={onBuzz}
                className="bg-gradient-to-r from-projectx-blue to-projectx-pink w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-90 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Buzz Map - {buzzMapPrice.toFixed(2)}€</span>
              </button>
            </div>
          </div>

          {/* Mobile agent code - compact version for small screens */}
          <motion.div 
            className="sm:hidden flex justify-center items-center py-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-cyan-400 font-mono text-[10px] mr-1">DOSSIER:</span>
            <motion.span 
              className="font-mono text-white bg-cyan-900/30 px-1.5 py-0.5 rounded-md text-[10px]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {agentCode}
            </motion.span>
          </motion.div>
          
          {/* Countdown Timer - centered and more compact */}
          <div className="flex justify-center pb-1.5 pt-0.5">
            <CountdownTimer targetDate={getMissionDeadline()} />
          </div>
        </div>
      </header>
      
      {/* Toolbar for map actions - improved spacing and touch areas */}
      <div className="fixed top-[95px] sm:top-[90px] left-0 right-0 z-40 bg-black/60 backdrop-blur-md py-2 px-2 sm:px-3 border-b border-projectx-deep-blue/30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-1.5 sm:gap-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={onAddMarker}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-md text-sm min-h-[40px] min-w-[40px] touch-manipulation ${
                isAddingMarker
                  ? "bg-projectx-blue text-white"
                  : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
              }`}
              aria-label="Aggiungi punto"
            >
              <PlusCircle className="h-4 w-4" />
              <span className={isMobile ? "hidden sm:inline text-xs" : ""}>Punto</span>
            </button>

            <button
              onClick={onAddArea}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-md text-sm min-h-[40px] min-w-[40px] touch-manipulation ${
                isAddingArea
                  ? "bg-projectx-blue text-white"
                  : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
              }`}
              aria-label="Aggiungi area"
            >
              <Map className="h-4 w-4" />
              <span className={isMobile ? "hidden sm:inline text-xs" : ""}>Area</span>
            </button>

            {/* Wrapped in div for mobile optimization */}
            <div className="min-h-[40px] min-w-[40px] touch-manipulation">
              <MapFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapHeader;
