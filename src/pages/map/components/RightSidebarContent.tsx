
import React from 'react';
import MapPointsSection from '../MapPointsSection';
import SearchAreasSection from '../SearchAreasSection';
import { MapMarker } from '@/components/maps/types';

interface RightSidebarContentProps {
  mapPoints: MapMarker[];
  isAddingMapPoint: boolean;
  toggleAddingMapPoint: () => void;
  setActiveMapPoint: (id: string | null) => void;
  deleteMapPoint: (id: string) => Promise<boolean>;
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  handleAddArea: (area: any) => void;
  isAddingSearchArea: boolean;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const RightSidebarContent: React.FC<RightSidebarContentProps> = ({
  mapPoints,
  isAddingMapPoint,
  toggleAddingMapPoint,
  setActiveMapPoint,
  deleteMapPoint,
  searchAreas,
  setActiveSearchArea,
  handleAddArea,
  isAddingSearchArea,
  deleteSearchArea
}) => {
  return (
    <>
      {/* Map points list section */}
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        <MapPointsSection 
          mapPoints={mapPoints}
          isAddingMapPoint={isAddingMapPoint}
          toggleAddingMapPoint={toggleAddingMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          deleteMapPoint={deleteMapPoint}
        />
      </div>
      
      {/* Search areas section - removed clearAllSearchAreas prop */}
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        <SearchAreasSection
          searchAreas={searchAreas}
          setActiveSearchArea={setActiveSearchArea}
          handleAddArea={handleAddArea}
          isAddingSearchArea={isAddingSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
      </div>
    </>
  );
};

export default RightSidebarContent;
