
import { useCallback } from "react";

export function useSecureContextCheck() {
  const isSecureContext = useCallback(() => {
    // window.isSecureContext checks if the page is loaded over HTTPS or localhost
    const secure = typeof window !== 'undefined' && (window.isSecureContext === true);
    if (!secure) {
      console.error('Page not running in a secure context. Geolocation may not work.');
    }
    return secure;
  }, []);

  const isGeolocationAvailable = useCallback(() => {
    return 'geolocation' in navigator && isSecureContext();
  }, [isSecureContext]);

  return { isSecureContext, isGeolocationAvailable };
}
