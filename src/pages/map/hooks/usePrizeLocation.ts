
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Default fallback to Roma, not Milano
const DEFAULT_FALLBACK: [number, number] = [41.9028, 12.4964];

export function usePrizeLocation(userLocation: [number, number] | null) {
  const [prizeLocation, setPrizeLocation] = useState<[number, number]>(DEFAULT_FALLBACK);
  const [bufferRadius, setBufferRadius] = useState(1000); // 1km
  
  // Check if we're in a secure context (required for geolocation)
  const [isSecureContext] = useState(() => {
    return typeof window !== 'undefined' && (window.isSecureContext === true);
  });
  
  // In a real application, this would come from your backend
  useEffect(() => {
    // Simulated prize location near user or default
    setTimeout(() => {
      try {
        if (!isSecureContext) {
          console.warn("Not running in secure context - using default prize location");
          setPrizeLocation(DEFAULT_FALLBACK);
          return;
        }
        
        // Use user location if available, otherwise use default
        const baseLocation = userLocation || DEFAULT_FALLBACK;
        
        // Random offset within a certain range from user's location
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        
        // Validate before setting
        const newLat = baseLocation[0] + latOffset;
        const newLng = baseLocation[1] + lngOffset;
        
        if (!isNaN(newLat) && !isNaN(newLng)) {
          console.log("Setting prize location to:", [newLat, newLng]);
          setPrizeLocation([newLat, newLng]);
        
          // Set buffer radius based on clues unlocked (simulated)
          const unlockedClues = parseInt(localStorage.getItem('unlockedClues') || '0');
          const newRadius = Math.max(100, 2000 - unlockedClues * 200); // Shrinks as more clues are unlocked
          setBufferRadius(newRadius);
        }
      } catch (err) {
        console.error("Error setting prize location:", err);
        // Ensure we always have a valid prize location even if there's an error
        setPrizeLocation(DEFAULT_FALLBACK);
      }
    }, 1000);
  }, [userLocation, isSecureContext]);

  return { prizeLocation, bufferRadius };
}
