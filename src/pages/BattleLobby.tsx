// @ts-nocheck
/**
 * TRON BATTLE - Battle Lobby (Simplified - AI Only)
 * Play against AI bots with real M1U/PE stakes
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PracticeMode } from '@/components/battle/PracticeMode';

export default function BattleLobby() {
  const [userId, setUserId] = useState<string | null>(null);
  const [localStats, setLocalStats] = useState<any>(null);

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Load local stats from localStorage
        loadLocalStats(data.user.id);
      }
    });
  }, []);

  // Load stats from localStorage (saved by PracticeMode)
  const loadLocalStats = (uid: string) => {
    try {
      const saved = localStorage.getItem(`battle_stats_${uid}`);
      if (saved) {
        const stats = JSON.parse(saved);
        setLocalStats({
          total_battles: stats.totalGames || 0,
          win_rate_percentage: stats.totalGames > 0 
            ? Math.round((stats.wins / stats.totalGames) * 100) 
            : 0,
          avg_reaction_ms: stats.avgTime || 0,
          fastest_reaction_ms: stats.bestTime || 0,
          wins: stats.wins || 0,
          losses: stats.losses || 0,
        });
      }
    } catch {
      setLocalStats(null);
    }
  };

  return (
    <div className="h-auto max-h-[70vh] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            M1SSION BATTLE ARENA
          </h1>
          <p className="text-cyan-400 text-base">Enter the grid. Test your reaction.</p>
        </motion.div>

        {/* Stats Overview (from localStorage) */}
        {localStats && localStats.total_battles > 0 && (
          <Card className="bg-gray-800/50 border-cyan-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Win Rate</p>
                  <p className="text-xl font-bold text-white">{localStats.win_rate_percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Battles</p>
                  <p className="text-xl font-bold text-white">{localStats.total_battles}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Avg Reaction</p>
                  <p className="text-xl font-bold text-cyan-400">{localStats.avg_reaction_ms}ms</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Fastest</p>
                  <p className="text-xl font-bold text-green-400">{localStats.fastest_reaction_ms}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="battle" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="battle" className="gap-1">
              <Target className="w-3 h-3" />
              Battle
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Trophy className="w-3 h-3 mr-1" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Battle Arena - Play against AI with real stakes */}
          <TabsContent value="battle">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  Battle Arena
                </CardTitle>
                <CardDescription className="text-sm">
                  Challenge AI bots and win M1U or PE (max 5 per battle)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userId && <PracticeMode userId={userId} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5" />
                  Your Battle Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {localStats && localStats.total_battles > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gray-700/30 text-center">
                      <p className="text-3xl font-bold text-green-400">{localStats.win_rate_percentage}%</p>
                      <p className="text-xs text-gray-400 mt-1">Win Rate</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-700/30 text-center">
                      <p className="text-3xl font-bold text-white">{localStats.total_battles}</p>
                      <p className="text-xs text-gray-400 mt-1">Total Battles</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-700/30 text-center">
                      <p className="text-3xl font-bold text-cyan-400">{localStats.avg_reaction_ms}ms</p>
                      <p className="text-xs text-gray-400 mt-1">Avg Reaction</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-700/30 text-center">
                      <p className="text-3xl font-bold text-yellow-400">{localStats.fastest_reaction_ms}ms</p>
                      <p className="text-xs text-gray-400 mt-1">Fastest</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Play battles to see your stats!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
