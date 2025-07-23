// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDailySpinCheck } from '@/hooks/useDailySpinCheck';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface DailySpinRedirectProps {
  children: React.ReactNode;
}

export const DailySpinRedirect: React.FC<DailySpinRedirectProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { user } = useUnifiedAuth();
  const { spinStatus, isLoading } = useDailySpinCheck();

  useEffect(() => {
    console.log('[DAILY-SPIN-REDIRECT] Effect triggered', {
      isLoading,
      hasUser: !!user,
      location,
      spinStatus,
      hasPlayedToday: spinStatus?.hasPlayedToday,
      canPlay: spinStatus?.canPlay
    });

    // 🚨 BLOCCA TUTTI I REDIRECT se siamo su pagine escluse
    if (
      location.includes('/daily-spin') ||
      location.includes('/login') ||
      location.includes('/register') ||
      location.includes('/auth') ||
      location.includes('/choose-plan')
    ) {
      console.log('[DAILY-SPIN-REDIRECT] 🚫 BLOCCATO per pagina esclusa:', location);
      return;
    }

    // 🚨 BLOCCA se non abbiamo utente
    if (!user) {
      console.log('[DAILY-SPIN-REDIRECT] 🚫 BLOCCATO per mancanza utente');
      return;
    }

    // 🚨 BLOCCA se stiamo ancora caricando e non abbiamo spinStatus
    if (isLoading && !spinStatus) {
      console.log('[DAILY-SPIN-REDIRECT] 🚫 BLOCCATO - ancora caricando senza spinStatus');
      return;
    }

    // 🔥 CONTROLLO IMMEDIATO localStorage per prevenire race conditions
    const today = new Date().toISOString().split('T')[0];
    const localSpinKey = `daily_spin_${user.id}_${today}`;
    const hasPlayedLocalStorage = localStorage.getItem(localSpinKey);
    
    if (hasPlayedLocalStorage) {
      console.log('[DAILY-SPIN-REDIRECT] 🚫 BLOCCATO - utente ha già giocato oggi (localStorage)');
      return;
    }

    // 🔥 CONTROLLO SPINSTATUS - Blocca se ha già giocato
    if (spinStatus?.hasPlayedToday) {
      console.log('[DAILY-SPIN-REDIRECT] 🚫 BLOCCATO - utente ha già giocato oggi (spinStatus)');
      return;
    }

    // ✅ REDIRECT SOLO se l'utente può giocare O se spinStatus è ancora null/undefined (fallback sicuro)
    const shouldRedirect = (spinStatus?.canPlay && !spinStatus?.hasPlayedToday) || 
                          (!spinStatus && !isLoading); // Fallback per spinStatus undefined

    if (shouldRedirect) {
      console.log('[DAILY-SPIN-REDIRECT] ✅ REDIRECT AUTORIZZATO', {
        reason: spinStatus ? 'can play' : 'fallback for undefined spinStatus',
        spinStatus
      });
      setLocation('/daily-spin');
    } else {
      console.log('[DAILY-SPIN-REDIRECT] ⏸️ NESSUN REDIRECT necessario', {
        canPlay: spinStatus?.canPlay,
        hasPlayedToday: spinStatus?.hasPlayedToday,
        isLoading,
        spinStatus
      });
    }
  }, [spinStatus, isLoading, user, location, setLocation]);

  return <>{children}</>;
};