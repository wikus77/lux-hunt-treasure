
import { useState, useCallback } from 'react';

export const useBuzzMapRadius = () => {
  // FIXED: Simple radius calculation with clear logic
  const calculateRadius = useCallback((generation: number): number => {
    console.log("▶️ generation:", generation);
    
    if (generation === 1) {
      const radius = 500000; // 500km in meters
      console.log("✅ BUZZ MAPPA PARTENZA DA 500km - FIRST GENERATION");
      console.log("▶️ radius:", radius, "meters =", radius / 1000, "km");
      return radius;
    }
    
    // Progressive reduction: 500km * 0.95^(generation-1)
    const radius = Math.max(5000, 500000 * Math.pow(0.95, generation - 1));
    console.log("✅ RADIUS REDUCTION: Generation", generation, "= ", radius / 1000, "km");
    console.log("▶️ radius:", radius, "meters =", radius / 1000, "km");
    
    return radius;
  }, []);

  return {
    calculateRadius
  };
};
