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
    // Non fare redirect se:
    // 1. Stiamo caricando
    // 2. Non c'è utente autenticato
    // 3. Siamo già sulla pagina daily-spin
    // 4. Siamo su pagine di auth/login/register
    // 5. Siamo su pagine di scelta piano
    if (
      isLoading ||
      !user ||
      location.includes('/daily-spin') ||
      location.includes('/login') ||
      location.includes('/register') ||
      location.includes('/auth') ||
      location.includes('/choose-plan')
    ) {
      return;
    }

    // IMPORTANTE: Non fare redirect se l'utente ha già giocato oggi
    if (spinStatus?.hasPlayedToday) {
      console.log('🎰 Daily Spin: utente ha già giocato oggi, nessun redirect');
      return;
    }

    // Se l'utente può giocare al Daily Spin E non ha ancora giocato oggi, redirect
    if (spinStatus?.canPlay && !spinStatus?.hasPlayedToday) {
      console.log('🎰 Daily Spin: utente può giocare e non ha giocato oggi, redirect a /daily-spin');
      setLocation('/daily-spin');
    }
  }, [spinStatus, isLoading, user, location, setLocation]);

  return <>{children}</>;
};