/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0
 * Functions Base URL derivation (no hardcoded project refs)
 */

export function getFunctionsBase(): string {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL ?? '';
  
  if (typeof url !== 'string' || !url) {
    console.warn('[Norah] VITE_SUPABASE_URL not set');
    return '';
  }
  
  // Extract project ref from https://<project>.supabase.co
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co$/i);
  const projectRef = match?.[1] ?? '';
  
  if (!projectRef) {
    console.warn('[Norah] Could not extract project ref from VITE_SUPABASE_URL:', url);
    return '';
  }
  
  return `https://${projectRef}.functions.supabase.co`;
}
