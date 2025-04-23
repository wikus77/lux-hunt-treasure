
import { useEffect, useState } from "react";

export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Aggiunta gestione errori più robusta
      navigator.geolocation.getCurrentPosition(
        position => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
        error => {
          console.log("Geolocation error:", error.message);
          // Impostazione default su Milano in caso di errore
          setCurrentLocation([45.4642, 9.19]);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      console.log("Geolocation non supportata");
      // Impostazione default su Milano se geolocation non supportata
      setCurrentLocation([45.4642, 9.19]);
    }
  }, []);

  return currentLocation;
}
