
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BuzzAreasExpansibleProps {
  searchAreas: any[];
}

const BuzzAreasExpansible: React.FC<BuzzAreasExpansibleProps> = ({ searchAreas }) => {
  const [isExpanded, setIsExpanded] = useState(searchAreas.length > 0);

  // Mock data per l'esempio - in produzione verranno dai searchAreas
  const mockAreaData = {
    center: "45.4642, 9.1900",
    radius: "5.2",
    mode: "FORCED MODE + BACKEND VERIFIED",
    generation: "settimana 24 - giorno 2025-06-09"
  };

  return (
    <div className="w-full">
      {/* Container principale identico a M1SSION CONSOLE */}
      <div className="bg-[#0e0e11] rounded-2xl border border-[#1a1a1f] overflow-hidden">
        {/* Linea gradient superiore */}
        <div className="h-[1px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff]" />
        
        {/* Header cliccabile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <h3 className="uppercase font-bold tracking-wider text-base text-white">
            AREE DI INTERESSE
          </h3>
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-white transition-transform duration-300",
              isExpanded ? "rotate-180" : ""
            )}
          />
        </button>

        {/* Contenuto espandibile */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-4">
            {searchAreas.length > 0 ? (
              <div className="space-y-2 text-sm text-neutral-300">
                <div>
                  <span className="text-neutral-400">Centro stimato:</span> {mockAreaData.center}
                </div>
                <div>
                  <span className="text-neutral-400">Raggio:</span> {mockAreaData.radius} km
                </div>
                <div>
                  <span className="text-neutral-400">Modalità:</span> {mockAreaData.mode}
                </div>
                <div>
                  <span className="text-neutral-400">Generazione:</span> {mockAreaData.generation}
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                Nessuna area attiva
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuzzAreasExpansible;
