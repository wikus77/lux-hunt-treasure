
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MapLogicProvider from "./map/MapLogicProvider";
import MapArea from "./map/MapArea";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import GradientBox from "@/components/ui/gradient-box";
import MapInteractionControls from "./map/MapInteractionControls";
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Plus } from "lucide-react";
import NotesSection from "./map/NotesSection";
import SearchAreasSection from "./map/SearchAreasSection";
import { useMapLogic } from "./map/useMapLogic";

const Map = () => {
  const { unlockedClues } = useBuzzClues();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const mapLogic = useMapLogic();

  useEffect(() => {
    // Log the current clue count for debugging
    console.log(`Current unlocked clues count: ${unlockedClues}`);

    // Check if we're returning from a successful payment with clue information
    if (location.state?.paymentCompleted && location.state?.clue && !location.state?.notificationSent) {
      // Add notification for the new clue
      addNotification({
        title: "Nuovo indizio sbloccato",
        description: location.state.clue.description,
      });
      
      // Mark notification as sent to prevent duplicates
      history.replaceState(
        { ...location.state, notificationSent: true },
        "",
        location.pathname
      );
    }
  }, [unlockedClues, location.state, addNotification]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <motion.div
        className="container mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-[#00D1FF] text-center mt-6 mb-8 font-orbitron" style={{ 
          textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
        }}>MAPPA</h1>
      </motion.div>
      
      <div className={`pt-4 ${isMobile ? 'sm:pt-6' : 'sm:pt-6'} h-full relative pb-20`}>
        <motion.div
          className="mx-4 mb-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GradientBox className="overflow-hidden">
            <MapArea
              onMapReady={mapLogic.handleMapReady}
              markers={mapLogic.markers}
              searchAreas={mapLogic.searchAreas}
              isAddingMarker={mapLogic.isAddingMarker}
              isAddingSearchArea={mapLogic.isAddingSearchArea}
              activeMarker={mapLogic.activeMarker}
              activeSearchArea={mapLogic.activeSearchArea}
              onMapClick={mapLogic.handleMapClick}
              onMapDoubleClick={mapLogic.handleMapDoubleClick}
              setActiveMarker={mapLogic.setActiveMarker}
              setActiveSearchArea={mapLogic.setActiveSearchArea}
              saveMarkerNote={mapLogic.saveMarkerNote}
              saveSearchArea={mapLogic.saveSearchArea}
              editMarker={mapLogic.editMarker}
              editSearchArea={mapLogic.editSearchArea}
              deleteMarker={mapLogic.deleteMarker}
              deleteSearchArea={mapLogic.deleteSearchArea}
              currentLocation={mapLogic.currentLocation}
            />
          </GradientBox>
        </motion.div>
        
        <motion.div
          className="mx-4 mb-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GradientBox className="p-4 text-center">
            <p className="text-[#00D1FF] font-medium" style={{ 
              textShadow: "0 0 5px rgba(0, 209, 255, 0.4)"
            }}>
              Ecco l'area stimata dove si trova il premio!
            </p>
          </GradientBox>
        </motion.div>

        {/* Map Interaction Controls */}
        <motion.div
          className="mx-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={mapLogic.handleAddMarker}
              variant="outline"
              className="group"
              disabled={mapLogic.isAddingMarker}
            >
              <MapPin className="mr-2 h-4 w-4 text-[#39FF14] group-hover:animate-pulse" />
              Aggiungi punto
            </Button>
            
            <Button
              onClick={mapLogic.handleAddArea}
              variant="outline"
              className="group"
              disabled={mapLogic.isAddingSearchArea}
            >
              <Circle className="mr-2 h-4 w-4 text-[#9b87f5] group-hover:animate-pulse" />
              Inserisci area di ricerca
            </Button>
          </div>
        </motion.div>
        
        {/* Notes and Search Areas Container */}
        <motion.div
          className="mx-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <GradientBox className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Notes */}
              <div>
                <NotesSection />
              </div>
              
              {/* Right column: Search Areas */}
              <div>
                <SearchAreasSection
                  searchAreas={mapLogic.searchAreas}
                  setActiveSearchArea={mapLogic.setActiveSearchArea}
                  clearAllSearchAreas={() => {
                    mapLogic.searchAreas.forEach(area => mapLogic.deleteSearchArea(area.id));
                  }}
                />
              </div>
            </div>
          </GradientBox>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Map;
