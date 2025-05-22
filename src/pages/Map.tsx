
import React from 'react';
import { toast } from 'sonner';
import { useMapLogic } from './map/useMapLogic';
import MapHeader from './map/MapHeader';
import MapLogicProvider from './map/MapLogicProvider';
import NotesSection from './map/NotesSection';
import SearchAreasSection from './map/SearchAreasSection';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Map = () => {
  const mapLogic = useMapLogic();
  
  return (
    <div className="flex flex-col h-full bg-background">
      <MapHeader 
        onHelp={() => toast.info("Aiuto mappa", { description: "Questa funzione sarà disponibile presto" })}
        onBuzz={mapLogic.handleBuzz}
        buzzMapPrice={mapLogic.buzzMapPrice}
      />
      
      {/* Added proper spacing to avoid header overlap */}
      <div className="container mx-auto px-4 pt-28 pb-2 max-w-6xl">
        <div className="glass-card p-4 sm:p-6 mb-6">
          <MapLogicProvider />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4 sm:p-6">
            <NotesSection />
          </div>
          
          <div className="glass-card p-4 sm:p-6">
            <SearchAreasSection
              searchAreas={mapLogic.searchAreas}
              setActiveSearchArea={mapLogic.setActiveSearchArea}
              clearAllSearchAreas={() => {
                mapLogic.searchAreas.forEach(area => mapLogic.deleteSearchArea(area.id));
                toast.success("Tutte le aree di ricerca sono state cancellate");
              }}
            />
          </div>
        </div>
        
        <div className="glass-card mx-4 p-4 text-center text-sm text-gray-400 mt-6 mb-20">
          <p>Nell'area stimata troverai il premio. Più precisione = più possibilità!</p>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Map;
