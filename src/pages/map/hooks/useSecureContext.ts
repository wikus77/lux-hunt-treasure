
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useSecureContext = () => {
  const [isSecureContext, setIsSecureContext] = useState(() => {
    // window.isSecureContext checks if the page is loaded over HTTPS or localhost
    const secure = typeof window !== 'undefined' && (window.isSecureContext === true);
    if (!secure) {
      console.error('Page not running in a secure context. Geolocation may not work.');
    }
    return secure;
  });

  useEffect(() => {
    if (!isSecureContext) {
      toast.error("Contesto non sicuro", {
        description: "Questa pagina deve essere caricata in HTTPS per utilizzare la geolocalizzazione."
      });
    }
  }, [isSecureContext]);

  return { isSecureContext };
};
