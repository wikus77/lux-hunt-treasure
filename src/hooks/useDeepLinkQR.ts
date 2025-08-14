import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * useDeepLinkQR
 * - Legge ?qr= dalla URL
 * - Accetta sia M1-******* (code) sia UUID (id)
 * - Avvia lo stesso flow del bottone "Scansiona" navigando a /qr/:code
 * - Rimuove il parametro dalla URL per evitare doppi tentativi al refresh
 */
export function useDeepLinkQR() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const raw = sp.get('qr')?.trim();
      if (!raw) return;

      const go = async () => {
        let code = raw;
        if (UUID_RE.test(raw)) {
          // Resolve UUID -> code
          const { data, error } = await supabase
            .from('qr_codes')
            .select('code')
            .eq('id', raw)
            .maybeSingle();
          if (error) {
            // silently fail to keep UX smooth
            console.warn('[useDeepLinkQR] UUID lookup error', error);
            return;
          }
          if (!data?.code) return;
          code = data.code;
        }

        // Normalize and navigate to map (rewards handled by map modal)
        code = code.toUpperCase();
        setLocation(`/map`);

        // Remove param to avoid repeat on refresh
        const url = new URL(window.location.href);
        url.searchParams.delete('qr');
        window.history.replaceState({}, document.title, url.toString());
      };

      go();
    } catch (e) {
      console.warn('[useDeepLinkQR] init error', e);
    }
  }, [setLocation]);
}
