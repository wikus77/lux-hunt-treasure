/**
 * M1SSION BATTLE Console
 * Embedded Battle Lobby with tabs, badge, and overlay Arena support
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ChevronDown, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load BattleLobby for performance
const BattleLobby = lazy(() => import("@/pages/BattleLobby"));

interface BattleConsoleProps {
  className?: string;
}

export function BattleConsole({ className }: BattleConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const isMobile = useIsMobile();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadPendingBattles(data.user.id);
        loadStats(data.user.id);
      }
    });
  }, []);

  // Subscribe to battle updates (read-only)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('battle-console-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battles',
        filter: `opponent_id=eq.${userId}`,
      }, () => {
        loadPendingBattles(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadPendingBattles = async (uid: string) => {
    const { data, error } = await supabase
      .from('battles')
      .select('id')
      .eq('opponent_id', uid)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPendingCount(data.length);
    }
  };

  const loadStats = async (uid: string) => {
    const { data } = await supabase
      .from('battle_metrics')
      .select('*')
      .eq('user_id', uid)
      .single();

    setStats(data);
  };

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className={`rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-4 relative ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(255, 30, 255, 0.1) 100%)',
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Top neon border */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #FC1EFF 0%, #00D1FF 50%, #FACC15 100%)'
        }}
      />
      
      {/* Header */}
      <div 
        className="p-6 border-b border-white/10 flex justify-between items-center"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FC1EFF] to-[#00D1FF] flex items-center justify-center">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-orbitron font-bold text-white">
              M1SSION BATTLE
            </h2>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00D1FF]/20 border border-[#00D1FF]/50"
              >
                <Zap className="w-3 h-3 text-[#00D1FF]" />
                <span className="text-xs font-bold text-[#00D1FF]">{pendingCount} sfide</span>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {stats && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white/70">W:</span>
                <span className="text-white font-bold">{stats.total_wins}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                <span className="text-white/70">L:</span>
                <span className="text-white font-bold">{stats.total_losses}</span>
              </div>
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/60" />
          </motion.div>
        </div>
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <Tabs defaultValue="lobby" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/30">
                  <TabsTrigger value="lobby" className="data-[state=active]:bg-[#FC1EFF]/20 data-[state=active]:text-[#FC1EFF]">
                    <Swords className="w-4 h-4 mr-2" />
                    Lobby
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-[#00D1FF]/20 data-[state=active]:text-[#00D1FF]">
                    <Trophy className="w-4 h-4 mr-2" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#FACC15]/20 data-[state=active]:text-[#FACC15]">
                    <Users className="w-4 h-4 mr-2" />
                    Top
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lobby" className="max-h-[70vh] overflow-y-auto custom-scrollbar mt-4">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        className="w-8 h-8 border-2 border-[#FC1EFF] border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  }>
                    <BattleLobby />
                  </Suspense>
                </TabsContent>

                <TabsContent value="stats" className="mt-4">
                  <div className="space-y-4">
                    {stats ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                            <div className="text-white/60 text-xs mb-1">Total Battles</div>
                            <div className="text-2xl font-bold text-white">{stats.total_battles}</div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                            <div className="text-white/60 text-xs mb-1">Win Rate</div>
                            <div className="text-2xl font-bold text-[#00D1FF]">{stats.win_rate}%</div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                            <div className="text-white/60 text-xs mb-1">Best Reaction</div>
                            <div className="text-2xl font-bold text-[#FC1EFF]">{stats.best_reaction_ms}ms</div>
                          </div>
                          <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                            <div className="text-white/60 text-xs mb-1">Avg Reaction</div>
                            <div className="text-2xl font-bold text-yellow-400">{stats.avg_reaction_ms}ms</div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FC1EFF]/10 to-[#00D1FF]/10 border border-[#FC1EFF]/30">
                          <div className="text-white/60 text-xs mb-2">Total Earned</div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#FACC15]" />
                            <div className="text-xl font-bold text-white">{stats.total_energy_won} Energy</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-white/50">
                        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Play your first battle to see stats</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-4">
                  <div className="text-center py-8 text-white/50">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Leaderboard coming soon</p>
                    <p className="text-xs mt-2">Battle to earn your rank</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
