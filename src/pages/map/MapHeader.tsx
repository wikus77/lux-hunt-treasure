
import { HelpCircle, Zap } from "lucide-react";
import M1ssionText from "@/components/logo/M1ssionText";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentBadge from "@/components/AgentBadge";

interface MapHeaderProps {
  onHelp: () => void;
  onBuzz: () => void;
  buzzMapPrice: number;
}

const MapHeader = ({
  onHelp,
  onBuzz,
  buzzMapPrice,
}: MapHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10"
        style={{ 
          // CRITICAL FIX: Position below safe zone
          top: '47px',
          paddingTop: '0px',
          marginTop: '0px'
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <M1ssionText />
            </div>

            <div className="flex items-center justify-center">
              <AgentBadge />
            </div>
            
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
          
          <div className="line-glow"></div>
        </div>
      </header>
    </>
  );
};

export default MapHeader;
