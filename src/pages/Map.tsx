
import React from 'react';
import { toast } from 'sonner';
import { useMapLogic } from './map/useMapLogic';
import MapLogicProvider from './map/MapLogicProvider';
import NotesSection from './map/NotesSection';
import SearchAreasSection from './map/SearchAreasSection';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';

const Map = () => {
  const mapLogic = useMapLogic();
  
  return (
    <div className="flex flex-col h-full bg-background">
      <UnifiedHeader
        leftComponent={<M1ssionText />}
      />
      
      {/* Proper spacing to avoid header overlap */}
      <div className="container mx-auto px-4 pt-20 pb-2 max-w-6xl">
        <div className="m1ssion-glass-card p-4 sm:p-6 mb-6">
          <MapLogicProvider />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="m1ssion-glass-card p-4 sm:p-6">
            <NotesSection />
          </div>
          
          <div className="m1ssion-glass-card p-4 sm:p-6">
            <SearchAreasSection
              searchAreas={mapLogic.searchAreas}
              setActiveSearchArea={mapLogic.setActiveSearchArea}
              clearAllSearchAreas={() => {
                mapLogic.searchAreas.forEach(area => mapLogic.deleteSearchArea(area.id));
                toast.success("Tutte le aree di ricerca sono state cancellate");
              }}
              handleAddArea={mapLogic.handleAddArea}
              isAddingSearchArea={mapLogic.isAddingSearchArea}
            />
          </div>
        </div>
        
        <div className="m1ssion-glass-card mx-4 p-4 text-center text-sm text-gray-400 mt-6 mb-20">
          <p>Nell'area stimata troverai il premio. Più precisione = più possibilità!</p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Map;
