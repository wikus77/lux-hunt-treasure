/**
 * BATTLE ARENA - Solo Mode with Real M1U/PE Stakes
 * Play against AI Bot with real currency stakes (max 5)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, RotateCcw, Target, Bot, Coins, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface PracticeModeProps {
  userId: string;
  onClose?: () => void;
}

type GameState = 'idle' | 'countdown' | 'waiting' | 'flash' | 'result' | 'too_early';
type StakeCurrency = 'M1U' | 'PE';

// Bot difficulty levels with reaction time ranges (ms)
const BOT_LEVELS = {
  easy: { min: 350, max: 500, name: 'Rookie Bot', color: 'text-green-400' },
  medium: { min: 250, max: 400, name: 'Agent Bot', color: 'text-yellow-400' },
  hard: { min: 180, max: 300, name: 'Elite Bot', color: 'text-orange-400' },
  extreme: { min: 120, max: 220, name: 'TRON Master', color: 'text-red-400' },
};

type BotLevel = keyof typeof BOT_LEVELS;

// Stake amounts (max 5)
const STAKE_AMOUNTS = [1, 2, 3, 5];

export function PracticeMode({ userId, onClose }: PracticeModeProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [myReaction, setMyReaction] = useState<number | null>(null);
  const [botReaction, setBotReaction] = useState<number | null>(null);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [botLevel, setBotLevel] = useState<BotLevel>('medium');
  const [stats, setStats] = useState({ wins: 0, losses: 0, bestTime: 0, avgTime: 0, totalGames: 0 });
  const [recentTimes, setRecentTimes] = useState<number[]>([]);
  
  // Stake system
  const [stakeCurrency, setStakeCurrency] = useState<StakeCurrency>('M1U');
  const [stakeAmount, setStakeAmount] = useState(1);
  const [userBalance, setUserBalance] = useState({ m1u: 0, pe: 0 });
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  
  const flashTimeRef = useRef<number>(0);
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStakeRef = useRef<{ amount: number; currency: StakeCurrency }>({ amount: 0, currency: 'M1U' });

  // Fetch balance
  const refreshBalance = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('m1_units, pulse_energy')
        .eq('id', userId)
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
  }, [userId]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Load practice stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`battle_stats_${userId}`);
    if (saved) {
      setStats(JSON.parse(saved));
    }
    const savedTimes = localStorage.getItem(`battle_times_${userId}`);
    if (savedTimes) {
      setRecentTimes(JSON.parse(savedTimes));
    }
  }, [userId]);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: typeof stats, newTimes: number[]) => {
    localStorage.setItem(`battle_stats_${userId}`, JSON.stringify(newStats));
    localStorage.setItem(`battle_times_${userId}`, JSON.stringify(newTimes.slice(-20)));
  }, [userId]);

  // Update balance in Supabase (fire and forget, like Pulse Breaker)
  const updateBalanceAsync = useCallback(async (currency: StakeCurrency, newBalance: number) => {
    try {
      const field = currency === 'M1U' ? 'm1_units' : 'pulse_energy';
      await supabase
        .from('profiles')
        .update({ [field]: Math.floor(Math.max(0, newBalance)) })
        .eq('id', userId);
    } catch {
      // Silent - local balance still works
    }
  }, [userId]);

  // Check if user can afford stake
  const canAffordStake = () => {
    const balance = stakeCurrency === 'M1U' ? userBalance.m1u : userBalance.pe;
    return balance >= stakeAmount;
  };

  // Start game (deduct stake)
  const startGame = () => {
    if (!canAffordStake()) {
      return;
    }

    // Deduct stake from local balance
    const currentBalance = stakeCurrency === 'M1U' ? userBalance.m1u : userBalance.pe;
    const newBalance = currentBalance - stakeAmount;
    
    setUserBalance(prev => ({
      ...prev,
      [stakeCurrency.toLowerCase()]: newBalance
    }));
    
    // Fire async update to Supabase
    updateBalanceAsync(stakeCurrency, newBalance);
    
    // Store current stake for payout calculation
    currentStakeRef.current = { amount: stakeAmount, currency: stakeCurrency };
    
    setGameState('countdown');
    setCountdown(3);
    setMyReaction(null);
    setBotReaction(null);
    setWinner(null);
    setLastPayout(null);
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('waiting');
    }
  }, [gameState, countdown]);

  // Waiting phase - random delay before flash (2-8 seconds)
  useEffect(() => {
    if (gameState !== 'waiting') return;

    const delay = 2000 + Math.random() * 6000;
    
    const timer = setTimeout(() => {
      flashTimeRef.current = Date.now();
      
      // Generate bot reaction time
      const bot = BOT_LEVELS[botLevel];
      const botTime = Math.round(bot.min + Math.random() * (bot.max - bot.min));
      setBotReaction(botTime);
      
      setGameState('flash');
    }, delay);

    waitingTimeoutRef.current = timer;

    return () => {
      clearTimeout(timer);
    };
  }, [gameState, botLevel]);

  // Handle tap
  const handleTap = () => {
    if (gameState === 'waiting') {
      // Too early! Lose stake
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
      
      // Player loses - no payout
      const newStats = {
        ...stats,
        losses: stats.losses + 1,
        totalGames: stats.totalGames + 1,
      };
      setStats(newStats);
      saveStats(newStats, recentTimes);
      setLastPayout(-currentStakeRef.current.amount);
      
      setGameState('too_early');
      return;
    }

    if (gameState === 'flash') {
      const reaction = Date.now() - flashTimeRef.current;
      setMyReaction(reaction);
      
      // Determine winner
      const botTime = botReaction || 999;
      const playerWon = reaction < botTime;
      setWinner(playerWon ? 'player' : 'bot');
      
      // Calculate payout
      const stake = currentStakeRef.current;
      let payout = 0;
      
      if (playerWon) {
        // Win: Get stake back + winnings (2x stake = original stake as profit)
        payout = stake.amount * 2;
        const currentBalance = stake.currency === 'M1U' ? userBalance.m1u : userBalance.pe;
        const newBalance = currentBalance + payout;
        
        setUserBalance(prev => ({
          ...prev,
          [stake.currency.toLowerCase()]: newBalance
        }));
        
        updateBalanceAsync(stake.currency, newBalance);
        setLastPayout(stake.amount); // Show profit only
      } else {
        // Loss: Stake already deducted
        setLastPayout(-stake.amount);
      }
      
      // Update stats
      const newTimes = [...recentTimes, reaction];
      const newStats = {
        wins: stats.wins + (playerWon ? 1 : 0),
        losses: stats.losses + (playerWon ? 0 : 1),
        bestTime: stats.bestTime === 0 ? reaction : Math.min(stats.bestTime, reaction),
        avgTime: Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length),
        totalGames: stats.totalGames + 1,
      };
      
      setStats(newStats);
      setRecentTimes(newTimes);
      saveStats(newStats, newTimes);
      
      setGameState('result');

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(playerWon ? [50, 30, 50] : [100]);
      }
    }
  };

  // Play beep sound
  const playBeep = (freq: number = 800, duration: number = 100) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  };

  // Play beep on countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      playBeep(600 + (3 - countdown) * 200, 100);
    }
    if (gameState === 'flash') {
      playBeep(1200, 150);
    }
  }, [gameState, countdown]);

  const bot = BOT_LEVELS[botLevel];
  const currentBalance = stakeCurrency === 'M1U' ? userBalance.m1u : userBalance.pe;

  return (
    <div className="space-y-4">
      {/* Balance Display */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">{userBalance.m1u}</span>
            <span className="text-xs text-gray-400">M1U</span>
          </div>
          <div className="w-px h-4 bg-gray-600" />
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-cyan-400">{userBalance.pe}</span>
            <span className="text-xs text-gray-400">PE</span>
          </div>
        </div>
        {lastPayout !== null && (
          <Badge className={lastPayout > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
            {lastPayout > 0 ? '+' : ''}{lastPayout} {currentStakeRef.current.currency}
          </Badge>
        )}
      </div>

      {/* Stake Selection - Only visible in idle state */}
      {(gameState === 'idle' || gameState === 'result' || gameState === 'too_early') && (
        <div className="space-y-3">
          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant={stakeCurrency === 'M1U' ? 'default' : 'outline'}
              onClick={() => setStakeCurrency('M1U')}
              className={`flex items-center gap-1.5 ${stakeCurrency === 'M1U' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
            >
              <Coins className="w-3.5 h-3.5" />
              M1U
            </Button>
            <Button
              size="sm"
              variant={stakeCurrency === 'PE' ? 'default' : 'outline'}
              onClick={() => setStakeCurrency('PE')}
              className={`flex items-center gap-1.5 ${stakeCurrency === 'PE' ? 'bg-cyan-500 hover:bg-cyan-600 text-black' : ''}`}
            >
              <Battery className="w-3.5 h-3.5" />
              PE
            </Button>
          </div>

          {/* Stake Amount */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400 mr-2">Stake:</span>
            {STAKE_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                size="sm"
                variant={stakeAmount === amount ? 'default' : 'outline'}
                onClick={() => setStakeAmount(amount)}
                disabled={currentBalance < amount}
                className={`w-10 h-8 text-sm ${
                  stakeAmount === amount 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : currentBalance < amount 
                      ? 'opacity-50' 
                      : ''
                }`}
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Bot Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${bot.color}`} />
          <span className={`font-semibold ${bot.color}`}>{bot.name}</span>
        </div>
        <div className="flex gap-1">
          {(Object.keys(BOT_LEVELS) as BotLevel[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={botLevel === level ? 'default' : 'outline'}
              onClick={() => setBotLevel(level)}
              disabled={gameState !== 'idle' && gameState !== 'result' && gameState !== 'too_early'}
              className={`text-xs px-2 h-7 ${botLevel === level ? 'bg-cyan-600' : ''}`}
            >
              {level.charAt(0).toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-[10px] text-gray-400">Wins</p>
          <p className="text-lg font-bold text-green-400">{stats.wins}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-[10px] text-gray-400">Losses</p>
          <p className="text-lg font-bold text-red-400">{stats.losses}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-[10px] text-gray-400">Best</p>
          <p className="text-lg font-bold text-cyan-400">{stats.bestTime || '-'}ms</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-800/50">
          <p className="text-[10px] text-gray-400">Avg</p>
          <p className="text-lg font-bold text-purple-400">{stats.avgTime || '-'}ms</p>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative h-64 rounded-2xl overflow-hidden cursor-pointer select-none"
        onClick={handleTap}
        style={{
          background: gameState === 'flash' 
            ? 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)' 
            : gameState === 'too_early'
            ? 'linear-gradient(135deg, #ff0000 0%, #ff4444 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: gameState === 'flash' 
            ? '0 0 60px rgba(0,255,255,0.8), inset 0 0 60px rgba(0,255,0,0.4)'
            : '0 0 30px rgba(0,0,0,0.5)',
          transition: 'background 0.05s, box-shadow 0.05s',
        }}
      >
        <AnimatePresence mode="wait">
          {/* IDLE */}
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <Target className="w-16 h-16 text-cyan-400 mb-4" />
              <p className="text-white text-lg font-semibold mb-2">Battle Arena</p>
              <p className="text-gray-400 text-sm mb-4">Stake {stakeAmount} {stakeCurrency} vs {bot.name}</p>
              <Button 
                onClick={startGame} 
                disabled={!canAffordStake()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Battle ({stakeAmount} {stakeCurrency})
              </Button>
              {!canAffordStake() && (
                <p className="text-red-400 text-xs mt-2">Saldo {stakeCurrency} insufficiente</p>
              )}
            </motion.div>
          )}

          {/* COUNTDOWN */}
          {gameState === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-bold text-white"
                style={{ textShadow: '0 0 30px rgba(0,212,255,0.8)' }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}

          {/* WAITING */}
          {gameState === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-20 h-20 rounded-full border-4 border-cyan-400/50 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-400/20" />
              </motion.div>
              <p className="text-cyan-400 mt-4 text-lg">Wait for GREEN...</p>
              <p className="text-yellow-400 text-sm mt-2">⚡ {stakeAmount} {stakeCurrency} at stake</p>
            </motion.div>
          )}

          {/* FLASH - TAP NOW! */}
          {gameState === 'flash' && (
            <motion.div
              key="flash"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                <Zap className="w-24 h-24 text-black" />
              </motion.div>
              <p className="text-black text-3xl font-bold mt-4">TAP NOW!</p>
            </motion.div>
          )}

          {/* TOO EARLY */}
          {gameState === 'too_early' && (
            <motion.div
              key="too_early"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-white text-3xl font-bold mb-2">TOO EARLY! ❌</p>
              <p className="text-red-400 text-lg mb-2">-{currentStakeRef.current.amount} {currentStakeRef.current.currency}</p>
              <p className="text-white/80 mb-6">Wait for the green flash</p>
              <Button onClick={startGame} disabled={!canAffordStake()} variant="outline" className="border-white text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again ({stakeAmount} {stakeCurrency})
              </Button>
            </motion.div>
          )}

          {/* RESULT */}
          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4"
            >
              <div className="text-6xl mb-2">
                {winner === 'player' ? '🏆' : '💀'}
              </div>
              <p className={`text-2xl font-bold mb-2 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {winner === 'player' ? 'YOU WIN!' : 'BOT WINS!'}
              </p>
              
              {/* Payout display */}
              <p className={`text-lg font-bold mb-4 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {winner === 'player' ? '+' : ''}{lastPayout} {currentStakeRef.current.currency}
              </p>
              
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">You</p>
                  <p className={`text-2xl font-bold ${winner === 'player' ? 'text-green-400' : 'text-white'}`}>
                    {myReaction}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">{bot.name}</p>
                  <p className={`text-2xl font-bold ${winner === 'bot' ? 'text-red-400' : 'text-white'}`}>
                    {botReaction}ms
                  </p>
                </div>
              </div>

              {myReaction && myReaction < 200 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">
                  ⚡ Lightning Fast!
                </Badge>
              )}

              <Button 
                onClick={startGame} 
                disabled={!canAffordStake()}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again ({stakeAmount} {stakeCurrency})
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="text-center text-xs text-gray-500">
        <p>💡 Win = 2x your stake | Lose or Too Early = lose stake</p>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
