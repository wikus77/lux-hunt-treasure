// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { DailySpinWheel } from '@/components/daily-spin/DailySpinWheel';
import { useDailySpinCheck } from '@/hooks/useDailySpinCheck';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Loader2 } from 'lucide-react';

export const DailySpinPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useUnifiedAuth();
  const { spinStatus, isLoading, error } = useDailySpinCheck();
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);

  // Redirect se non autenticato
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🚫 Daily Spin: utente non autenticato, redirect a login');
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  // Redirect se ha già giocato oggi
  useEffect(() => {
    if (spinStatus?.hasPlayedToday) {
      console.log('🎰 Daily Spin: utente ha già giocato oggi, redirect a home');
      setLocation('/home');
    }
  }, [spinStatus, setLocation]);

  // Auto-close dopo risultato (5 secondi)
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Caricamento Daily Spin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-destructive mb-4">Errore</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => setLocation('/home')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // Se non può giocare (ha già giocato), redirect
  if (spinStatus && !spinStatus.canPlay) {
    setLocation('/home');
    return null;
  }

  return (
    <div className="min-h-screen">
      <DailySpinWheel />
    </div>
  );
};