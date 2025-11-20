// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™
// Blindatura di sicurezza avanzata per M1SSION PANEL™

import { useEffect, useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

// Hash SHA-256 autorizzato
const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';
const AUTHORIZED_EMAIL = 'wikus77@hotmail.it';

// Funzione per calcolare SHA-256
async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Interfaccia per il tracking degli accessi
interface AccessAttempt {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
}

export const usePanelAccessProtection = () => {
  const { user, isAuthenticated, isLoading } = useUnifiedAuth();
  const { navigate } = useWouterNavigation();
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');

  // Funzione per registrare tentativo di accesso
  const logAccessAttempt = async (attempt: AccessAttempt) => {
    try {
      await supabase.from('admin_logs').insert({
        event_type: 'panel_access_attempt',
        user_id: user?.id || null,
        context: JSON.stringify({
          email: attempt.email,
          ip: attempt.ip,
          userAgent: attempt.userAgent,
          success: attempt.success,
          reason: accessDeniedReason
        }),
        note: attempt.success ? 'Accesso autorizzato al M1SSION PANEL™' : 'Tentativo di accesso non autorizzato'
      });
    } catch (error) {
      console.error('❌ Errore nel logging dell\'accesso:', error);
    }
  };

  // Funzione per ottenere IP approssimativo
  const getClientInfo = () => {
    return {
      ip: 'client-side', // In produzione si può usare un servizio per l'IP reale
      userAgent: navigator.userAgent
    };
  };

  // Validazione principale dell'accesso
  const validateAccess = async () => {
    setIsValidating(true);
    
    try {
      const clientInfo = getClientInfo();
      
      console.log('🔐 PANEL ACCESS VALIDATION - DEBUG:', {
        isAuthenticated,
        isLoading,
        user: user,
        email: user?.email,
        expectedEmail: AUTHORIZED_EMAIL,
        timestamp: new Date().toISOString()
      });
      
      // 1. Controllo autenticazione base
      if (!isAuthenticated || !user?.email) {
        console.error('🚨 PANEL ACCESS DENIED - Not authenticated:', {
          isAuthenticated,
          isLoading,
          hasUser: !!user,
          hasEmail: !!user?.email
        });
        
        setAccessDeniedReason('Utente non autenticato');
        setIsWhitelisted(false);
        
        await logAccessAttempt({
          email: user?.email || 'anonymous',
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: new Date().toISOString(),
          success: false
        });
        
        return; // NON navigare, solo ritorna false
      }

      // 2. Controllo email esatto
      if (user.email !== AUTHORIZED_EMAIL) {
        console.error('🚨 PANEL ACCESS DENIED - Wrong email:', {
          actualEmail: user.email,
          expectedEmail: AUTHORIZED_EMAIL,
          match: user.email === AUTHORIZED_EMAIL
        });
        
        setAccessDeniedReason('Email non autorizzata');
        setIsWhitelisted(false);
        
        await logAccessAttempt({
          email: user.email,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: new Date().toISOString(),
          success: false
        });
        
        return; // NON navigare, solo ritorna false
      }

      // 3. Verifica hash SHA-256
      const emailHash = await calculateSHA256(user.email);
      if (emailHash !== AUTHORIZED_EMAIL_HASH) {
        setAccessDeniedReason('Hash email non valido');
        setIsWhitelisted(false);
        
        await logAccessAttempt({
          email: user.email,
          ip: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          timestamp: new Date().toISOString(),
          success: false
        });
        
        navigate('/access-denied');
        return;
      }

      // ✅ Accesso autorizzato
      setIsWhitelisted(true);
      setAccessDeniedReason('');
      
      await logAccessAttempt({
        email: user.email,
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        timestamp: new Date().toISOString(),
        success: true
      });

    } catch (error) {
      console.error('❌ Errore nella validazione dell\'accesso:', error);
      setAccessDeniedReason('Errore di validazione');
      setIsWhitelisted(false);
      navigate('/access-denied');
    } finally {
      setIsValidating(false);
    }
  };

  // Effetto per validare l'accesso al caricamento
  useEffect(() => {
    validateAccess();
  }, [isAuthenticated, user?.email]);

  // Anti-bypass: blocco se si tenta di accedere senza validazione
  useEffect(() => {
    if (!isValidating && !isWhitelisted) {
      navigate('/access-denied');
    }
  }, [isValidating, isWhitelisted]);

  return {
    isWhitelisted,
    isValidating,
    accessDeniedReason,
    revalidate: validateAccess
  };
};