
import { useCallback } from "react";
import { toast } from "sonner";
import { useSecureContextCheck } from "./useSecureContextCheck";

export function useGeolocationErrors() {
  const { isSecureContext } = useSecureContextCheck();

  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    console.error("Geolocation error:", error.message, error.code);
    
    let errorMessage = "Impossibile ottenere la tua posizione.";
    let shouldRetry = false;
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage = "Accesso alla posizione negato dall'utente.";
        toast.error("Accesso alla posizione negato", {
          description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
        });
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = "Informazioni sulla posizione non disponibili.";
        toast.error("Posizione non disponibile", {
          description: "Il tuo dispositivo non è riuscito a determinare la tua posizione attuale."
        });
        shouldRetry = true;
        break;
      case 3: // TIMEOUT
        errorMessage = "Timeout nella richiesta della posizione.";
        toast.error("Richiesta scaduta", {
          description: "La richiesta della posizione ha impiegato troppo tempo. Riprova."
        });
        shouldRetry = true;
        break;
    }
    
    return { errorMessage, shouldRetry, permissionState: error.code === 1 ? "denied" : "prompt" };
  }, []);

  const handleSecurityError = useCallback(() => {
    const errorMessage = "Il contesto non è sicuro. La pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione.";
    
    toast.error("Errore di sicurezza", {
      description: "HTTPS è necessario per accedere alla geolocalizzazione."
    });
    
    return { errorMessage, shouldRetry: false, permissionState: "denied" };
  }, []);

  return { 
    handleGeolocationError, 
    handleSecurityError, 
    checkSecurityContext: isSecureContext 
  };
}
