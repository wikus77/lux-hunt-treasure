/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Connection Verification
 * 
 * Utility per verificare che la connessione Supabase sia configurata correttamente
 * dopo il remix e la riconnessione a un Supabase personale.
 */

import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from './config';

export interface ConnectionStatus {
  connected: boolean;
  projectRef: string;
  url: string;
  errors: string[];
  warnings: string[];
}

/**
 * Verifica lo stato della connessione Supabase
 * 
 * @returns {Promise<ConnectionStatus>} Status object con dettagli
 */
export async function verifySupabaseConnection(): Promise<ConnectionStatus> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Verifica env variables
  if (!SUPABASE_CONFIG.url) {
    errors.push('Missing VITE_SUPABASE_URL environment variable');
  }
  
  if (!SUPABASE_CONFIG.anonKey) {
    errors.push('Missing VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) environment variable');
  }
  
  if (!SUPABASE_CONFIG.projectRef) {
    warnings.push('Could not extract project ref from URL');
  }
  
  // 2. Test connessione database (read-only)
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      errors.push(`Database query failed: ${error.message}`);
    }
  } catch (err: any) {
    errors.push(`Database connection error: ${err?.message || 'Unknown error'}`);
  }
  
  // 3. Test autenticazione
  try {
    const { data: session, error } = await supabase.auth.getSession();
    if (error) {
      warnings.push(`Auth check warning: ${error.message}`);
    }
  } catch (err: any) {
    warnings.push(`Auth connection warning: ${err?.message || 'Unknown error'}`);
  }
  
  return {
    connected: errors.length === 0,
    projectRef: SUPABASE_CONFIG.projectRef,
    url: SUPABASE_CONFIG.url,
    errors,
    warnings,
  };
}

/**
 * Verifica la connessione e logga i risultati nella console
 * Utile per debug rapido durante lo sviluppo
 */
export async function logConnectionStatus(): Promise<void> {
  console.group('🔍 [SUPABASE] Connection Verification');
  
  const status = await verifySupabaseConnection();
  
  console.log('Project Ref:', status.projectRef);
  console.log('URL:', status.url);
  console.log('Connected:', status.connected ? '✅' : '❌');
  
  if (status.errors.length > 0) {
    console.group('❌ Errors:');
    status.errors.forEach(err => console.error(err));
    console.groupEnd();
  }
  
  if (status.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    status.warnings.forEach(warn => console.warn(warn));
    console.groupEnd();
  }
  
  if (status.connected) {
    console.log('✅ All checks passed!');
  } else {
    console.error('❌ Connection verification failed. Check errors above.');
  }
  
  console.groupEnd();
}
