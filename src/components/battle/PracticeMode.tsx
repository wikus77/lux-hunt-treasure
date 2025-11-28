/**
 * Practice Mode - Solo training for reaction time
 * Play against AI Bot to improve your skills
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, RotateCcw, Target, Bot, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface PracticeModeProps {
  userId: string;
  onClose?: () => void;
}

type GameState = 'idle' | 'countdown' | 'waiting' | 'flash' | 'result' | 'too_early';

// Bot difficulty levels with reaction time ranges (ms)
const BOT_LEVELS = {
  easy: { min: 350, max: 500, name: 'Rookie Bot', color: 'text-green-400' },
  medium: { min: 250, max: 400, name: 'Agent Bot', color: 'text-yellow-400' },
  hard: { min: 180, max: 300, name: 'Elite Bot', color: 'text-orange-400' },
  extreme: { min: 120, max: 220, name: 'TRON Master', color: 'text-red-400' },
};

type BotLevel = keyof typeof BOT_LEVELS;

export function PracticeMode({ userId, onClose }: PracticeModeProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [myReaction, setMyReaction] = useState<number | null>(null);
  const [botReaction, setBotReaction] = useState<number | null>(null);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [botLevel, setBotLevel] = useState<BotLevel>('medium');
  const [stats, setStats] = useState({ wins: 0, losses: 0, bestTime: 0, avgTime: 0, totalGames: 0 });
  const [recentTimes, setRecentTimes] = useState<number[]>([]);
  
  const flashTimeRef = useRef<number>(0);
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load practice stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`practice_stats_${userId}`);
    if (saved) {
      setStats(JSON.parse(saved));
    }
    const savedTimes = localStorage.getItem(`practice_times_${userId}`);
    if (savedTimes) {
      setRecentTimes(JSON.parse(savedTimes));
    }
  }, [userId]);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: typeof stats, newTimes: number[]) => {
    localStorage.setItem(`practice_stats_${userId}`, JSON.stringify(newStats));
    localStorage.setItem(`practice_times_${userId}`, JSON.stringify(newTimes.slice(-20))); // Keep last 20
  }, [userId]);

  // Start game
  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    setMyReaction(null);
    setBotReaction(null);
    setWinner(null);
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, move to waiting
      setGameState('waiting');
    }
  }, [gameState, countdown]);

  // Waiting phase - random delay before flash (2-8 seconds)
  useEffect(() => {
    if (gameState !== 'waiting') return;

    // Random delay between 2 and 8 seconds
    const delay = 2000 + Math.random() * 6000;
    console.log(`[Practice] Flash will appear in ${Math.round(delay)}ms`);
    
    const timer = setTimeout(() => {
      console.log('[Practice] FLASH!');
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
    console.log('[Practice] Tap! State:', gameState);
    
    if (gameState === 'waiting') {
      // Too early! Cancel the pending flash
      console.log('[Practice] Too early!');
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
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

  return (
    <div className="space-y-4">
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
              <p className="text-white text-lg font-semibold mb-2">Practice Mode</p>
              <p className="text-gray-400 text-sm mb-4">Train against {bot.name}</p>
              <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600">
                <Zap className="mr-2 h-4 w-4" />
                Start Training
              </Button>
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
              <p className="text-white text-3xl font-bold mb-4">TOO EARLY! ❌</p>
              <p className="text-white/80 mb-6">Wait for the green flash</p>
              <Button onClick={startGame} variant="outline" className="border-white text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
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
              <p className={`text-2xl font-bold mb-4 ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {winner === 'player' ? 'YOU WIN!' : 'BOT WINS!'}
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

              <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="text-center text-xs text-gray-500">
        <p>💡 Pro tip: Focus on the center and use your peripheral vision</p>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

