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
    // 🚨 BLOCCA TUTTI I REDIRECT se:
    // 1. Stiamo caricando
    // 2. Non c'è utente autenticato  
    // 3. Siamo già sulla pagina daily-spin
    // 4. Siamo su pagine di auth/login/register/choose-plan
    // 5. L'utente ha già giocato oggi (CRITICO PER EVITARE LOOP)
    if (
      isLoading ||
      !user ||
      location.includes('/daily-spin') ||
      location.includes('/login') ||
      location.includes('/register') ||
      location.includes('/auth') ||
      location.includes('/choose-plan') ||
      spinStatus?.hasPlayedToday // 🔥 PREVENZIONE LOOP ASSOLUTA
    ) {
      console.log('🚫 DailySpinRedirect: BLOCCATO', {
        isLoading,
        hasUser: !!user,
        location,
        hasPlayedToday: spinStatus?.hasPlayedToday,
        canPlay: spinStatus?.canPlay
      });
      return;
    }

    // ✅ REDIRECT SOLO se l'utente può giocare E non ha ancora giocato oggi
    if (spinStatus?.canPlay && !spinStatus?.hasPlayedToday) {
      console.log('🎰 Daily Spin: REDIRECT AUTORIZZATO - utente può giocare e non ha giocato oggi');
      setLocation('/daily-spin');
    } else {
      console.log('🎰 Daily Spin: NESSUN REDIRECT necessario', {
        canPlay: spinStatus?.canPlay,
        hasPlayedToday: spinStatus?.hasPlayedToday
      });
    }
  }, [spinStatus, isLoading, user, location, setLocation]);

  return <>{children}</>;
};