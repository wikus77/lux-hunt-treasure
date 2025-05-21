
import React, { useEffect } from "react";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Map = () => {
  // Initialize the buzz clues context to make it available for dynamic pricing
  const { unlockedClues } = useBuzzClues();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
    
    // Force a script refresh for map components
    const refreshMapScripts = () => {
      // Remove any existing Google Maps scripts to force fresh load
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());
      
      // Add back the script with a unique query parameter to prevent caching
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ&libraries=places&v=weekly&callback=initMapCallback&t=${new Date().getTime()}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      // Define the global callback function
      window.initMap = function() {
        console.log("Google Maps API loaded successfully");
      };
      
      // Use a separate callback name for the script loading
      window.initMapCallback = function() {
        console.log("Maps API script loaded, initializing map");
        if (typeof window.initMap === 'function') {
          window.initMap();
        }
      };
    };
    
    refreshMapScripts();
    
    return () => {
      // Clean up on unmount
      delete window.initMap;
      delete window.initMapCallback;
      document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(script => script.remove());
    };
  }, [unlockedClues, location.state, addNotification]);

  // Added improved wrapper with loading indicator
  return (
    <div className="min-h-screen bg-black">
      <div className={`pt-[180px] ${isMobile ? 'sm:pt-[170px]' : 'sm:pt-[170px]'} h-full relative pb-20`}>
        <MapLogicProvider />
        <div id="map-loading-indicator" className="hidden absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="text-cyan-400 text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Caricamento mappa...</p>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Map;
