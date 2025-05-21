
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DEFAULT_LOCATION } from '../utils/leafletIcons';

export function usePrizeLocation(userLocation: [number, number] | null) {
  const [prizeLocation, setPrizeLocation] = useState<[number, number]>([41.9027, 12.4963]); // Roma by default
  const [bufferRadius, setBufferRadius] = useState(1000); // 1km
  
  // In a real application, this would come from your backend
  useEffect(() => {
    // Simulated prize location near user or default
    setTimeout(() => {
      try {
        // Use user location if available, otherwise use default
        const baseLocation = userLocation || DEFAULT_LOCATION;
        
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
      }
    }, 1000);
  }, [userLocation]);

  return { prizeLocation, bufferRadius };
}
