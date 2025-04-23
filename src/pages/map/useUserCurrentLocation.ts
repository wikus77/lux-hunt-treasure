
import { useEffect, useState } from "react";

export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
          error => {
            console.log("Geolocation error:", error.message);
            // Default a Milano in caso di errore
            setCurrentLocation([45.4642, 9.19]);
          },
          { timeout: 10000, enableHighAccuracy: false, maximumAge: 30000 }
        );
      } else {
        console.log("Geolocation non supportata");
        // Default a Milano se geolocation non supportata
        setCurrentLocation([45.4642, 9.19]);
      }
    } catch (e) {
      console.error("Errore inaspettato nella geolocalizzazione:", e);
      // Default a Milano in caso di errore generico
      setCurrentLocation([45.4642, 9.19]);
    }
  }, []);

  return currentLocation;
}
