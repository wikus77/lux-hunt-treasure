/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Configuration
 * Centralizes Supabase project configuration to ensure consistency
 * 
 * ⚠️ POST-REMIX: This will automatically use the new Supabase project
 * after you reconnect via Lovable Cloud settings.
 * 
 * Environment variables (auto-populated by Lovable):
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)
 * - VITE_SUPABASE_PROJECT_ID
 */

// Extract project ref from URL (e.g., "xyz" from "https://xyz.supabase.co")
function extractProjectRef(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || '';
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const SUPABASE_CONFIG = {
  projectRef: import.meta.env.VITE_SUPABASE_PROJECT_ID || extractProjectRef(supabaseUrl),
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  functionsUrl: supabaseUrl.replace(/\/$/, '') + '/functions/v1'
} as const;

// Validation in development
if (import.meta.env.DEV) {
  if (!SUPABASE_CONFIG.url) {
    console.error('❌ [SUPABASE-CONFIG] Missing VITE_SUPABASE_URL');
  }
  if (!SUPABASE_CONFIG.anonKey) {
    console.error('❌ [SUPABASE-CONFIG] Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  }
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    console.log('✅ [SUPABASE-CONFIG] Configuration loaded:', {
      projectRef: SUPABASE_CONFIG.projectRef,
      url: SUPABASE_CONFIG.url.substring(0, 30) + '...',
    });
  }
}
