
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);

      if (navigator.geolocation) {
        console.log("Requesting current location in useUserCurrentLocation...");
        
        // Clear any possible cached positions
        navigator.geolocation.clearWatch(
          navigator.geolocation.watchPosition(() => {}, () => {})
        );
        
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log("Position received in useUserCurrentLocation:", latitude, longitude);
            setCurrentLocation([latitude, longitude]);
            setIsLoading(false);
          },
          error => {
            console.log("Geolocation error in useUserCurrentLocation:", error.message);
            
            // Roma as default location in case of error
            setCurrentLocation([41.9028, 12.4964]);
            setIsLoading(false);
            
            // Show toast only for permission denied
            if (error.code === 1) {
              toast.error("Accesso alla posizione negato", {
                description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
              });
            }
          },
          { 
            enableHighAccuracy: true, 
            timeout: 20000, // Increased timeout from 10s to 20s
            maximumAge: 0 // Always get fresh position
          }
        );
      } else {
        console.log("Geolocation non supportata");
        
        // Default to Roma if geolocation not supported
        setCurrentLocation([41.9028, 12.4964]);
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Errore inaspettato nella geolocalizzazione:", e);
      // Default to Roma in case of generic error
      setCurrentLocation([41.9028, 12.4964]);
      setIsLoading(false);
    }
  }, []);

  return currentLocation;
}
