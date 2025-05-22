
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Key for storing permission in localStorage
const GEO_PERMISSION_KEY = "geo_permission_granted";

export type UseUserLocationPermissionResult = {
  permission: "granted" | "denied" | "prompt";
  userLocation: [number, number] | null;
  askPermission: () => void;
  loading: boolean;
  error: string | null;
};

export function useUserLocationPermission(): UseUserLocationPermissionResult {
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true); // Initialize as loading
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);

  // Function to check if geolocation is available in the browser
  const isGeolocationAvailable = () => {
    return 'geolocation' in navigator;
  };

  // Get current position using Geolocation API with improved error handling
  const getCurrentPosition = useCallback(() => {
    if (!isGeolocationAvailable()) {
      console.error("Geolocation not available in this browser");
      setError("La geolocalizzazione non è supportata dal tuo browser");
      setPermission("denied");
      localStorage.setItem(GEO_PERMISSION_KEY, "denied");
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    const now = Date.now();
    if (lastAttempt && now - lastAttempt < 3000) {
      console.log("Skipping duplicate geolocation request");
      return;
    }
    
    setLastAttempt(now);
    setLoading(true);
    setError(null);
    
    console.log("Requesting user position...");
    
    try {
      // Prima verifichiamo lo stato dell'autorizzazione, se il browser lo supporta
      if (navigator.permissions && 'query' in navigator.permissions) {
        navigator.permissions.query({name: 'geolocation'})
          .then(permissionStatus => {
            console.log('Geolocation permission status:', permissionStatus.state);
            
            // Aggiungiamo un listener per i cambiamenti dello stato di autorizzazione
            permissionStatus.onchange = () => {
              console.log('Geolocation permission changed to:', permissionStatus.state);
              if (permissionStatus.state === 'granted') {
                // Richiediamo nuovamente la posizione se l'utente ha concesso l'autorizzazione
                getCurrentPosition();
              }
            };
          })
          .catch(err => {
            console.error('Error checking permission:', err);
          });
      }
        
      // Richiediamo la posizione con opzioni migliorate
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Position obtained:", { latitude, longitude });
          setUserLocation([latitude, longitude]);
          setPermission("granted");
          localStorage.setItem(GEO_PERMISSION_KEY, "granted");
          setLoading(false);
          setError(null);
          
          // Notifica di successo
          toast.success("Posizione rilevata con successo", {
            description: "La mappa è stata centrata sulla tua posizione attuale."
          });
        },
        (error) => {
          console.error("Geolocation error:", error.message, error.code);
          
          let errorMessage = "Impossibile ottenere la tua posizione.";
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = "Accesso alla posizione negato dall'utente.";
              toast.error("Accesso alla posizione negato", {
                description: "Attiva la geolocalizzazione nelle impostazioni del browser per utilizzare questa funzione."
              });
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = "Informazioni sulla posizione non disponibili.";
              toast.error("Posizione non disponibile", {
                description: "Il tuo dispositivo non è riuscito a determinare la tua posizione attuale."
              });
              break;
            case 3: // TIMEOUT
              errorMessage = "Timeout nella richiesta della posizione.";
              toast.error("Richiesta scaduta", {
                description: "La richiesta della posizione ha impiegato troppo tempo. Riprova."
              });
              break;
          }
          
          setError(errorMessage);
          setPermission("denied");
          localStorage.setItem(GEO_PERMISSION_KEY, "denied");
          setLoading(false);
        },
        {
          enableHighAccuracy: true, // Using high accuracy for better positioning
          timeout: 10000, // 10 seconds timeout - reduced from previous setting
          maximumAge: 0 // Don't use cached position - always get a fresh reading
        }
      );
    } catch (e) {
      console.error("Unexpected error in geolocation request:", e);
      setError("Errore imprevisto nella geolocalizzazione");
      setLoading(false);
      setPermission("denied");
      toast.error("Errore di geolocalizzazione", {
        description: "Si è verificato un errore imprevisto durante la richiesta della posizione."
      });
    }
  }, [lastAttempt]);

  // Forza la richiesta di localizzazione immediatamente al mount del componente
  useEffect(() => {
    // Clear any previous stored permission to ensure we always try to get location
    // when the component mounts - this helps if the user previously denied but has
    // since changed their browser settings
    localStorage.removeItem(GEO_PERMISSION_KEY);
    
    // Always try to get the location on component mount
    console.log("Initial geolocation request on component mount");
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Function to explicitly ask for permission
  const askPermission = useCallback(() => {
    console.log("Explicitly asking for geolocation permission");
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { permission, userLocation, askPermission, loading, error };
}
