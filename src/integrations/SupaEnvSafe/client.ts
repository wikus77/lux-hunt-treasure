/**
 * Safe shim attorno al client Supabase canonico.
 * Nessun hardcode: re-export totale + default uguale al named export esistente.
 */
export * from '@/integrations/supabase/client';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
export default supabaseClient;

export const SupaEnvSafe = supabaseClient;
