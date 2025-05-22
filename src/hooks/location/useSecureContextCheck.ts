
import { useCallback } from "react";

export function useSecureContextCheck() {
  const isSecureContext = useCallback(() => {
    return typeof window !== 'undefined' && (window.isSecureContext === true);
  }, []);

  const isGeolocationAvailable = useCallback(() => {
    return 'geolocation' in navigator && isSecureContext();
  }, [isSecureContext]);

  return { isSecureContext, isGeolocationAvailable };
}
