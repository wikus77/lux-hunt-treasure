// © 2025 Joseph MULÉ – M1SSION™ – Dynamic Auth Storage Keys
// Generates localStorage keys dynamically from Supabase URL

/**
 * Get dynamic auth storage key based on Supabase URL
 */
export function getAuthStorageKey(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) return 'sb-auth-token'; // fallback
  
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  const ref = match ? match[1] : 'default';
  return `sb-${ref}-auth-token`;
}

/**
 * Safe localStorage operations with dynamic keys
 */
export const authStorage = {
  get(): string | null {
    const key = getAuthStorageKey();
    return localStorage.getItem(key);
  },
  
  set(value: string): void {
    const key = getAuthStorageKey();
    localStorage.setItem(key, value);
  },
  
  remove(): void {
    const key = getAuthStorageKey();
    localStorage.removeItem(key);
  },
  
  clear(): void {
    // Remove all auth-related keys
    const keys = ['hasSeenPostLoginIntro', 'auth_cache_clear', 'auth_reload_done'];
    keys.forEach(key => localStorage.removeItem(key));
    this.remove();
  }
};
