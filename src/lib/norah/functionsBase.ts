/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0
 * Functions Base URL from centralized configuration
 */

import { SUPABASE_CONFIG } from '@/lib/supabase/config';

export function getFunctionsBase(): string {
  return SUPABASE_CONFIG.functionsUrl;
}
