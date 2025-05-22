
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useLocationErrorHandler = (
  onPermissionDenied: () => void,
  attemptRetry: () => void
) => {
  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    console.error("Watch position error:", error);
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        onPermissionDenied();
        toast.error("Accesso alla posizione negato", {
          description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
        });
        break;
      case 2: // POSITION_UNAVAILABLE
        toast.error("Posizione non disponibile", {
          description: "Non è stato possibile determinare la tua posizione."
        });
        attemptRetry();
        break;
      case 3: // TIMEOUT
        toast.error("Timeout", {
          description: "Richiesta scaduta. Riprova."
        });
        attemptRetry();
        break;
    }
  }, [onPermissionDenied, attemptRetry]);
  
  return { handleGeolocationError };
};
