
import React from 'react';
import { SearchArea } from '@/components/maps/types';

interface SearchAreasSectionProps {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  clearAllSearchAreas: () => void;
}

const SearchAreasSection: React.FC<SearchAreasSectionProps> = ({
  searchAreas,
  setActiveSearchArea,
  clearAllSearchAreas,
}) => {
  return (
    <div>
      <h3 className="gradient-text-cyan text-lg font-semibold mb-3">Aree di ricerca</h3>
      
      {searchAreas.length === 0 ? (
        <p className="text-sm text-gray-400">Nessuna area di ricerca aggiunta. Usa il bottone "Area" per aggiungerne una.</p>
      ) : (
        <>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-none">
            {searchAreas.map((area) => (
              <div
                key={area.id}
                className="p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 transition-all cursor-pointer"
                onClick={() => setActiveSearchArea(area.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">
                    {area.label || `Area ${area.id.substring(0, 5)}`}
                  </h4>
                  
                  <div className="flex items-center gap-1">
                    {area.confidence && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {area.confidence}
                      </span>
                    )}
                    {area.isAI && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-projectx-blue/20">
                        AI
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">
                  Raggio: {(area.radius / 1000).toFixed(1)} km
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              onClick={clearAllSearchAreas}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Cancella tutte le aree
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchAreasSection;
