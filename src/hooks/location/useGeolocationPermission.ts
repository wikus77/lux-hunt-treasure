
import { useCallback } from "react";
import { toast } from "sonner";

export function useGeolocationPermission() {
  const checkPermissionStatus = useCallback(() => {
    if (navigator.permissions && 'query' in navigator.permissions) {
      return navigator.permissions.query({ name: 'geolocation' })
        .then(permissionStatus => {
          console.log('Geolocation permission status:', permissionStatus.state);
          return permissionStatus;
        })
        .catch(err => {
          console.error('Error checking permission:', err);
          return null;
        });
    }
    return Promise.resolve(null);
  }, []);

  const handlePermissionDenied = useCallback(() => {
    toast.error("Accesso alla posizione negato", {
      description: "Per vedere la tua posizione sulla mappa, attiva la localizzazione nelle impostazioni del browser."
    });
  }, []);

  return { checkPermissionStatus, handlePermissionDenied };
}
