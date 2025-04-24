
import React, { useEffect } from "react";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";

const Map = () => {
  // Initialize the buzz clues context to make it available for dynamic pricing
  const { unlockedClues } = useBuzzClues();
  const { addNotification } = useNotifications();
  const location = useLocation();
  
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

  return <MapLogicProvider />;
};

export default Map;
