/**
 * TRON BATTLE - Arena Page
 * Main battle scene with countdown, disc, and realtime sync
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TronDisc } from '@/components/tron-battle/TronDisc';
import { useBattleRealtime } from '@/hooks/useBattleRealtime';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BattleStatus = 'waiting' | 'countdown' | 'active' | 'tapped' | 'resolved';

export default function BattleArena() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<BattleStatus>('waiting');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [myReactionMs, setMyReactionMs] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [battle, setBattle] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { connected } = useBattleRealtime({
    battleId: battleId || null,
    onBattleUpdate: (updatedBattle) => {
      setBattle(updatedBattle);
    },
    onCountdownStart: (countdownStartAt, flashAt) => {
      const startTime = new Date(countdownStartAt).getTime();
      const flashTime = new Date(flashAt).getTime();
      const now = Date.now();

      // Start countdown
      if (startTime > now) {
        setTimeout(() => {
          setStatus('countdown');
          startCountdownTimer(flashTime);
        }, startTime - now);
      } else {
        setStatus('countdown');
        startCountdownTimer(flashTime);
      }
    },
    onResolved: (winnerIdResolved) => {
      setWinnerId(winnerIdResolved);
      setStatus('resolved');
    },
  });

  const startCountdownTimer = (flashTime: number) => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((flashTime - Date.now()) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        triggerFlash(flashTime);
      }
    }, 100);
  };

  const triggerFlash = (flashTime: number) => {
    setIsFlashing(true);
    setStatus('active');
    toast({ title: '⚡ FLASH!', description: 'Tap now!', duration: 1000 });

    // Auto-clear flash after 500ms
    setTimeout(() => setIsFlashing(false), 500);
  };

  const handleTap = async () => {
    if (status !== 'active' || !battleId || !userId) return;

    const clientTapAt = new Date().toISOString();
    setStatus('tapped');

    // Measure ping (simple RTT approximation)
    const pingStart = Date.now();
    await supabase.from('battles').select('id').eq('id', battleId).single();
    const pingMs = Date.now() - pingStart;

    // Commit tap to server
    const { data, error } = await supabase.functions.invoke('battle-tap-commit', {
      body: {
        battle_id: battleId,
        client_tap_at: clientTapAt,
        ping_ms: pingMs,
      },
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setMyReactionMs(data.reaction_ms);
    toast({ title: `⚡ ${data.reaction_ms}ms!`, description: 'Reaction recorded' });

    // Trigger resolve
    setTimeout(async () => {
      await supabase.functions.invoke('battle-resolve', {
        body: { battle_id: battleId },
      });
    }, 2000);
  };

  const handleReady = async () => {
    if (!battleId) return;

    const { error } = await supabase.functions.invoke('battle-ready', {
      body: { battle_id: battleId },
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (!battleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <p className="text-white">Invalid battle ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Status indicator */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400">
          {connected ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
        </div>

        {/* Battle arena name */}
        {battle?.arena_name && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider"
          >
            {battle.arena_name}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Waiting for ready */}
          {status === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Get Ready</h2>
                <p className="text-cyan-400">Prepare for battle</p>
              </div>
              <Button onClick={handleReady} size="lg" className="bg-cyan-500 hover:bg-cyan-600">
                <Zap className="mr-2" />
                I'm Ready
              </Button>
            </motion.div>
          )}

          {/* Countdown */}
          {status === 'countdown' && countdown !== null && (
            <motion.div
              key="countdown"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <Clock className="w-16 h-16 text-cyan-400 animate-pulse" />
              <div className="text-9xl font-bold text-white">{countdown}</div>
              <p className="text-cyan-400 text-xl">Get ready to tap...</p>
            </motion.div>
          )}

          {/* Active - Show disc */}
          {(status === 'active' || status === 'tapped') && (
            <motion.div
              key="active"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <TronDisc
                isActive={status === 'active'}
                isFlashing={isFlashing}
                onClick={handleTap}
                disabled={status === 'tapped'}
              />
              {status === 'tapped' && myReactionMs && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-cyan-400"
                >
                  {myReactionMs}ms
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Resolved */}
          {status === 'resolved' && winnerId && (
            <motion.div
              key="resolved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <Trophy className="w-32 h-32 text-yellow-400" />
              <h2 className="text-5xl font-bold text-white">
                {winnerId === userId ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              {battle && (
                <div className="text-center">
                  <p className="text-cyan-400 text-xl mb-2">Reaction Times</p>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-gray-400">You</p>
                      <p className="text-white text-2xl font-bold">
                        {battle.creator_id === userId ? battle.creator_reaction_ms : battle.opponent_reaction_ms}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Opponent</p>
                      <p className="text-white text-2xl font-bold">
                        {battle.creator_id === userId ? battle.opponent_reaction_ms : battle.creator_reaction_ms}ms
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={() => navigate('/battle')} size="lg" className="bg-purple-600 hover:bg-purple-700">
                Back to Lobby
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
