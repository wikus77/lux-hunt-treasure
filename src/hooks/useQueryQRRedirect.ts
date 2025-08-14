// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT

import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * useQueryQRRedirect - Legacy QR handling removed
 * Now redirects directly to map without QR processing
 */
export function useQueryQRRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const raw = sp.get('qr')?.trim();
      if (!raw) return;

      // Direct redirect to map - QR processing handled by markers
      setLocation(`/map`);

      // Remove param to avoid loops
      const url = new URL(window.location.href);
      url.searchParams.delete('qr');
      window.history.replaceState({}, document.title, url.toString());
    } catch (e) {
      console.warn('[useQueryQRRedirect] redirect error', e);
    }
  }, [setLocation]);
}
