
import React from 'react';
import MapPointsSection from '../MapPointsSection';
import SearchAreasSection from '../SearchAreasSection';
import { MapMarker } from '@/components/maps/types';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Target } from 'lucide-react';

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
  const { user } = useUnifiedAuth();
  const isAdmin = user?.email === 'wikus77@hotmail.it';

  return (
    <div className="space-y-4">
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Punti
            </TabsTrigger>
            <TabsTrigger value="areas" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Aree
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="points" className="mt-4">
            <MapPointsSection 
              mapPoints={mapPoints}
              isAddingMapPoint={isAddingMapPoint}
              toggleAddingMapPoint={toggleAddingMapPoint}
              setActiveMapPoint={setActiveMapPoint}
              deleteMapPoint={deleteMapPoint}
            />
          </TabsContent>
          
          <TabsContent value="areas" className="mt-4">
            <SearchAreasSection
              searchAreas={searchAreas}
              setActiveSearchArea={setActiveSearchArea}
              handleAddArea={handleAddArea}
              isAddingSearchArea={isAddingSearchArea}
              deleteSearchArea={deleteSearchArea}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RightSidebarContent;
