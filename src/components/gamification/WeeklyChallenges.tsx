// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Weekly Challenges Component

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, CheckCircle, Gift, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface Challenge {
  id: string;
  name: string;
  description: string;
  reward: number;
  reward_type: string;
  completed: boolean;
}

interface WeeklyChallengesData {
  week_start: string;
  challenges: Challenge[];
}

interface WeeklyChallengesProps {
  compact?: boolean;
}

export function WeeklyChallenges({ compact = false }: WeeklyChallengesProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyChallengesData | null>(null);
  const [showReward, setShowReward] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: result, error } = await supabase.rpc('get_user_weekly_challenges', {
        p_user_id: user.id
      });

      if (error) {
        console.warn('[WeeklyChallenges] RPC not available yet:', error.message);
        // Fallback: mostra sfide di default
        setData({
          week_start: new Date().toISOString().split('T')[0],
          challenges: [
            {
              id: 'conquer_country',
              name: 'Conquista 1 Paese',
              description: 'Conquista un paese questa settimana',
              reward: 100,
              reward_type: 'm1u',
              completed: false
            }
          ]
        });
      } else {
        setData(result as WeeklyChallengesData);
      }
    } catch (err) {
      console.error('[WeeklyChallenges] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for conquest events to refresh
  useEffect(() => {
    const handleConquest = () => {
      loadChallenges();
      setShowReward('conquer_country');
      setTimeout(() => setShowReward(null), 4000);
      
      // Dispatch M1U animation
      window.dispatchEvent(new CustomEvent('m1u-credited', { 
        detail: { amount: 100 } 
      }));
    };

    window.addEventListener('country-conquered', handleConquest);
    return () => window.removeEventListener('country-conquered', handleConquest);
  }, []);

  if (!user || loading) {
    return (
      <div className="animate-pulse bg-gray-800/50 rounded-xl h-20" />
    );
  }

  if (!data) return null;

  const completedCount = data.challenges.filter(c => c.completed).length;
  const totalCount = data.challenges.length;

  // Compact version
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
      >
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Sfide Settimanali</p>
          <p className="text-sm font-bold text-white">
            {completedCount}/{totalCount}
          </p>
        </div>
        {completedCount === totalCount && (
          <CheckCircle className="w-5 h-5 text-green-400" />
        )}
      </motion.div>
    );
  }

  // Full version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-2"
              >
                🏆
              </motion.div>
              <p className="text-xl font-bold text-white">Sfida Completata!</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg"
              >
                <p className="text-lg font-bold text-green-400">+100 M1U</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-[#1a1525] via-[#1a1a2e] to-[#0f172a] rounded-2xl border border-cyan-500/20 p-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center"
            >
              <Target className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Sfide Settimanali</p>
              <p className="text-lg font-bold text-white">
                {completedCount}/{totalCount} Completate
              </p>
            </div>
          </div>
          
          {completedCount === totalCount && (
            <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <span className="text-xs text-green-400 font-bold">✓ TUTTE COMPLETATE!</span>
            </div>
          )}
        </div>

        {/* Challenges List */}
        <div className="space-y-3">
          {data.challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-3 rounded-xl border ${
                challenge.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gray-800/50 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  challenge.completed
                    ? 'bg-green-500/20'
                    : 'bg-cyan-500/20'
                }`}>
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Trophy className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`font-bold ${challenge.completed ? 'text-green-300' : 'text-white'}`}>
                    {challenge.name}
                  </p>
                  <p className="text-xs text-gray-400">{challenge.description}</p>
                </div>

                {/* Reward */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  challenge.completed
                    ? 'bg-green-500/20'
                    : 'bg-yellow-500/20'
                }`}>
                  <Gift className={`w-4 h-4 ${
                    challenge.completed ? 'text-green-400' : 'text-yellow-400'
                  }`} />
                  <span className={`text-sm font-bold ${
                    challenge.completed ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    +{challenge.reward}
                  </span>
                </div>
              </div>

              {/* Progress bar for incomplete */}
              {!challenge.completed && (
                <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '0%' }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Week info */}
        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Resetta ogni lunedì • Conquista paesi per M1U bonus!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeeklyChallenges;

