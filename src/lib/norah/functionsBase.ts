/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0
 * Functions Base URL from centralized configuration
 */

import { getFunctionsUrl } from '@/lib/supabase/clientUtils';

export function getFunctionsBase(): string {
  return getFunctionsUrl();
}
