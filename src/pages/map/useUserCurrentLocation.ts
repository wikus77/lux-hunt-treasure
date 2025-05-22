
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
            
            // Show specific error message based on error code
            if (error.code === 1) { // PERMISSION_DENIED
              toast.error("Accesso alla posizione negato", {
                description: "Attiva la geolocalizzazione per visualizzare la mappa correttamente."
              });
            }
            
            // Default a Roma in caso di errore
            setCurrentLocation([41.9028, 12.4964]);
            setIsLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 // Always get fresh position
          }
        );
      } else {
        console.log("Geolocation non supportata");
        toast.error("Geolocalizzazione non supportata", {
          description: "Il tuo browser non supporta la geolocalizzazione."
        });
        
        // Default a Roma se geolocation non supportata
        setCurrentLocation([41.9028, 12.4964]);
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Errore inaspettato nella geolocalizzazione:", e);
      // Default a Roma in caso di errore generico
      setCurrentLocation([41.9028, 12.4964]);
      setIsLoading(false);
    }
  }, []);

  return currentLocation;
}
