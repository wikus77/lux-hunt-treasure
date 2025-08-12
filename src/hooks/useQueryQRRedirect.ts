import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * useQueryQRRedirect
 * - Legge ?qr= dalla URL e reindirizza a /qr/:code
 * - Pulisce il parametro per evitare loop al refresh
 */
export function useQueryQRRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const raw = sp.get('qr')?.trim();
      if (!raw) return;

      const code = encodeURIComponent(raw.toUpperCase());
      setLocation(`/qr/${code}`);

      // Rimuovi param per evitare ripetizioni
      const url = new URL(window.location.href);
      url.searchParams.delete('qr');
      window.history.replaceState({}, document.title, url.toString());
    } catch (e) {
      console.warn('[useQueryQRRedirect] init error', e);
    }
  }, [setLocation]);
}
