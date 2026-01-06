/**
 * PULSE BREAKER - Game Logic Hook (BULLETPROOF VERSION)
 * 🔒 Works even if Supabase fails
 * 🔒 Zero console logs
 * 🎰 Psychological hooks integrated
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { emitGameEvent } from '@/gameplay/events';

export type GameStatus = 'idle' | 'running' | 'cashed_out' | 'crashed';
export type BetCurrency = 'PE' | 'M1U';

export interface GameState {
  status: GameStatus;
  roundId: string | null;
  betAmount: number;
  betCurrency: BetCurrency;
  currentMultiplier: number;
  crashPoint: number;
  cashoutMultiplier: number | null;
  payout: number | null;
  error: string | null;
  nearMissMultiplier: number | null;
  potentialWinAtCrash: number | null;
}

export interface UsePulseBreakerReturn {
  gameState: GameState;
  isLoading: boolean;
  startRound: (betAmount: number, currency: BetCurrency) => Promise<boolean>;
  cashout: () => Promise<boolean>;
  resetGame: () => void;
  userBalance: { m1u: number; pe: number };
  refreshBalance: () => Promise<void>;
  crashHistory: number[];
}

const INITIAL_STATE: GameState = {
  status: 'idle',
  roundId: null,
  betAmount: 0,
  betCurrency: 'M1U',
  currentMultiplier: 1.00,
  crashPoint: 0,
  cashoutMultiplier: null,
  payout: null,
  error: null,
  nearMissMultiplier: null,
  potentialWinAtCrash: null,
};

// 🔒 Generate crash point with crypto - 5% HOUSE EDGE, MAX 20x
function generateCrashPoint(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const r = array[0] / (0xFFFFFFFF + 1);
  const houseEdge = 0.95; // 5% margine M1SSION
  const raw = houseEdge / (1 - r * houseEdge);
  // Limit to max 20x
  return Math.max(1.01, Math.min(20, Math.floor(raw * 100) / 100));
}

const CRASH_HISTORY_SIZE = 10;

export function usePulseBreaker(): UsePulseBreakerReturn {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState({ m1u: 0, pe: 0 });
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const gameActiveRef = useRef<boolean>(false);
  const betDataRef = useRef<{ amount: number; currency: BetCurrency }>({ amount: 0, currency: 'M1U' });

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    gameActiveRef.current = false;
  }, []);

  // Fetch balance
  const refreshBalance = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('m1_units, pulse_energy')
        .eq('id', user.id)
        .single();
      if (data) {
        setUserBalance({
          m1u: data.m1_units || 0,
          pe: data.pulse_energy || 0
        });
      }
    } catch {
      // Silent
    }
  }, [user]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Update balance in Supabase (fire and forget)
  const updateBalanceAsync = useCallback(async (currency: BetCurrency, newBalance: number) => {
    if (!user) return;
    try {
      const field = currency === 'M1U' ? 'm1_units' : 'pulse_energy';
      await supabase.rpc('update_user_balance', {
        p_user_id: user.id,
        p_field: field,
        p_value: Math.floor(newBalance)
      });
    } catch {
      // Fallback: try direct update
      try {
        const field = currency === 'M1U' ? 'm1_units' : 'pulse_energy';
        await supabase
          .from('profiles')
          .update({ [field]: Math.floor(newBalance) })
          .eq('id', user.id);
      } catch {
        // Silent - local balance still works
      }
    }
  }, [user]);

  // START ROUND
  const startRound = useCallback(async (betAmount: number, currency: BetCurrency): Promise<boolean> => {
    if (!user || gameActiveRef.current || gameState.status === 'running') return false;

    const currentBalance = currency === 'M1U' ? userBalance.m1u : userBalance.pe;
    
    if (betAmount < 1 || betAmount > 1000) {
      setGameState(prev => ({ ...prev, error: 'Puntata: 1-1000' }));
      return false;
    }

    if (currentBalance < betAmount) {
      setGameState(prev => ({ ...prev, error: `Saldo ${currency} insufficiente` }));
      return false;
    }

    setIsLoading(true);
    cleanup();

    // Deduct from local balance immediately
    const newBalance = currentBalance - betAmount;
    setUserBalance(prev => ({
      ...prev,
      [currency.toLowerCase()]: newBalance
    }));

    // Fire async update to Supabase (don't wait)
    updateBalanceAsync(currency, newBalance);

    // Generate crash point
    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    startTimeRef.current = Date.now();
    gameActiveRef.current = true;
    betDataRef.current = { amount: betAmount, currency };

    setGameState({
      ...INITIAL_STATE,
      status: 'running',
      roundId: crypto.randomUUID(),
      betAmount,
      betCurrency: currency,
      currentMultiplier: 1.00,
    });

    // Start multiplier ticker
    intervalRef.current = setInterval(() => {
      if (!gameActiveRef.current) {
        cleanup();
        return;
      }

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const rawMult = 1 + Math.pow(elapsed, 1.3) * 0.15;
      const newMult = Math.min(20, Math.floor(rawMult * 100) / 100);

      // Check crash
      if (newMult >= crashPointRef.current) {
        cleanup();
        const crashPt = crashPointRef.current;
        
        setCrashHistory(prev => [...prev.slice(-(CRASH_HISTORY_SIZE - 1)), crashPt]);
        
        setGameState(prev => ({
          ...prev,
          status: 'crashed',
          currentMultiplier: crashPt,
          crashPoint: crashPt,
          payout: 0,
          potentialWinAtCrash: prev.betAmount * crashPt,
        }));
        
        // 🎉 Progress Feedback - Pulse Breaker crash event
        emitGameEvent('PULSE_BREAKER_CRASH', {
          crashPoint: crashPt.toFixed(2),
        });
        return;
      }

      setGameState(prev => {
        if (prev.status !== 'running') return prev;
        return { ...prev, currentMultiplier: newMult };
      });
    }, 50);

    setIsLoading(false);
    return true;
  }, [user, gameState.status, userBalance, cleanup, updateBalanceAsync]);

  // CASHOUT
  const cashout = useCallback(async (): Promise<boolean> => {
    if (!user || !gameActiveRef.current || gameState.status !== 'running') return false;

    cleanup();

    const cashoutMult = gameState.currentMultiplier;
    const crashPt = crashPointRef.current;
    const bet = betDataRef.current;
    const payout = Math.floor(bet.amount * cashoutMult);

    // Near miss calculation
    const nearMiss = crashPt > cashoutMult + 0.3 ? crashPt : null;
    const potentialWin = nearMiss ? bet.amount * crashPt : null;

    // Update local balance
    const currentBal = bet.currency === 'M1U' ? userBalance.m1u : userBalance.pe;
    const newBalance = currentBal + payout;
    
    setUserBalance(prev => ({
      ...prev,
      [bet.currency.toLowerCase()]: newBalance
    }));

    // Fire async update to Supabase
    updateBalanceAsync(bet.currency, newBalance);

    setCrashHistory(prev => [...prev.slice(-(CRASH_HISTORY_SIZE - 1)), crashPt]);

    setGameState(prev => ({
      ...prev,
      status: 'cashed_out',
      cashoutMultiplier: cashoutMult,
      payout,
      crashPoint: crashPt,
      nearMissMultiplier: nearMiss,
      potentialWinAtCrash: potentialWin ? Math.floor(potentialWin) : null,
    }));
    
    // 🎉 Progress Feedback - Pulse Breaker cashout event
    emitGameEvent('PULSE_BREAKER_CASHOUT', {
      payout,
      multiplier: cashoutMult.toFixed(2),
      currency: bet.currency,
    });

    return true;
  }, [user, gameState, userBalance, cleanup, updateBalanceAsync]);

  // RESET
  const resetGame = useCallback(() => {
    cleanup();
    crashPointRef.current = 0;
    betDataRef.current = { amount: 0, currency: 'M1U' };
    setGameState(INITIAL_STATE);
    refreshBalance();
  }, [cleanup, refreshBalance]);

  return {
    gameState,
    isLoading,
    startRound,
    cashout,
    resetGame,
    userBalance,
    refreshBalance,
    crashHistory,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
