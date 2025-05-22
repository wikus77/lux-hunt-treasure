
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Check if we're in a secure context (required for geolocation)
  const [isSecureContext] = useState(() => {
    return typeof window !== 'undefined' && (window.isSecureContext === true);
  });

  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Check for secure context first
      if (!isSecureContext) {
        console.error("Not running in secure context (HTTPS required for geolocation)");
        toast.error("Errore di sicurezza", {
          description: "La geolocalizzazione richiede una connessione HTTPS sicura."
        });
        setCurrentLocation([41.9028, 12.4964]); // Roma as default
        setIsLoading(false);
        return;
      }

      if (navigator.geolocation) {
        console.log("Setting up watchPosition in useUserCurrentLocation...");
        
        // Clear any possible cached positions
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        
        // Use watchPosition instead of getCurrentPosition for better continuous updates
        const id = navigator.geolocation.watchPosition(
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
            timeout: 20000, // Increased timeout to 20s
            maximumAge: 0 // Always get fresh position
          }
        );
        
        setWatchId(id);
        
        return () => {
          if (id !== null) {
            navigator.geolocation.clearWatch(id);
          }
        };
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
  }, [isSecureContext]);

  return currentLocation;
}
