
import React, { useEffect } from "react";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";

const Map = () => {
  // Initialize the buzz clues context to make it available for dynamic pricing
  const { unlockedClues } = useBuzzClues();
  
  useEffect(() => {
    // Log the current clue count for debugging
    console.log(`Current unlocked clues count: ${unlockedClues}`);
  }, [unlockedClues]);

  return <MapLogicProvider />;
};

export default Map;
