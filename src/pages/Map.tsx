
import React, { useEffect } from "react";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
      
      // Add back the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    };
    
    refreshMapScripts();
    
    return () => {
      // Clean up on unmount if needed
    };
  }, [unlockedClues, location.state, addNotification]);

  // Added improved wrapper padding to account for the fixed header and toolbar
  return (
    <div className={`pt-[180px] ${isMobile ? 'sm:pt-[170px]' : 'sm:pt-[170px]'} h-full`}>
      <MapLogicProvider />
    </div>
  );
};

export default Map;
