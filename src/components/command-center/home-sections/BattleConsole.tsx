// @ts-nocheck
/**
 * M1SSION BATTLE Console - TUTTO nel modal, NIENTE navigazione
 * Tap container → apre modal → clicca INIZIA BATTAGLIA → gioco NEL modal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ChevronDown, Trophy, Users, Zap, Target, Play, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassModal } from "@/components/ui/GlassModal";
import { PracticeMode } from "@/components/battle/PracticeMode";

interface BattleConsoleProps {
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATTLE LOBBY - Vista iniziale nel modal (stats + bottone INIZIA)
// ═══════════════════════════════════════════════════════════════════════════
interface BattleLobbyProps {
  stats: any;
  onStartBattle: () => void;
}

function BattleLobby({ stats, onStartBattle }: BattleLobbyProps) {
  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div 
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(252, 30, 255, 0.1) 0%, rgba(0, 209, 255, 0.08) 100%)',
          border: '1px solid rgba(252, 30, 255, 0.25)',
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats?.total_wins || 0}</p>
            <p className="text-[10px] text-white/50">Vittorie</p>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats?.total_losses || 0}</p>
            <p className="text-[10px] text-white/50">Sconfitte</p>
          </div>
          <div className="text-center">
            <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-cyan-400">{stats?.win_rate || 0}%</p>
            <p className="text-[10px] text-white/50">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Battle Arena Info */}
      <div 
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC1EFF] to-[#00D1FF] flex items-center justify-center flex-shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">Battle Arena</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Sfida i bot AI e metti alla prova i tuoi riflessi. Vinci M1U o PE (max 5).
            </p>
          </div>
        </div>
      </div>

      {/* Start Battle Button */}
      <motion.button
        onClick={onStartBattle}
        className="w-full py-3.5 rounded-2xl font-orbitron font-bold text-white text-base flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #FC1EFF 0%, #00D1FF 100%)',
          boxShadow: '0 4px 20px rgba(252, 30, 255, 0.4)'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Play className="w-5 h-5" />
        INIZIA BATTAGLIA
      </motion.button>

      {/* Best Times */}
      {stats?.best_reaction_ms > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-xl font-bold text-[#FC1EFF]">{stats.best_reaction_ms}ms</p>
            <p className="text-[10px] text-white/50">Miglior Tempo</p>
          </div>
          <div 
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <p className="text-xl font-bold text-yellow-400">{stats.avg_reaction_ms || 0}ms</p>
            <p className="text-[10px] text-white/50">Tempo Medio</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BATTLE GAME VIEW - PracticeMode embedded nel modal
// ═══════════════════════════════════════════════════════════════════════════
interface BattleGameViewProps {
  userId: string;
  onBack: () => void;
}

function BattleGameView({ userId, onBack }: BattleGameViewProps) {
  return (
    <div className="space-y-3">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla lobby
      </button>
      
      {/* PracticeMode Component - TUTTO QUI */}
      <PracticeMode userId={userId} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function BattleConsole({ className }: BattleConsoleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // false = lobby, true = game
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<any>(null);

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

  // Subscribe to battle updates
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
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('id')
        .eq('opponent_id', uid)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPendingCount(data.length);
      }
    } catch (e) {
      console.debug('[BattleConsole] loadPendingBattles error:', e);
    }
  };

  const loadStats = async (uid: string) => {
    try {
      const saved = localStorage.getItem(`battle_stats_${uid}`);
      if (saved) {
        const localStats = JSON.parse(saved);
        setStats({
          total_battles: localStats.totalGames || 0,
          total_wins: localStats.wins || 0,
          total_losses: localStats.losses || 0,
          win_rate: localStats.totalGames > 0 
            ? Math.round((localStats.wins / localStats.totalGames) * 100) 
            : 0,
          avg_reaction_ms: localStats.avgTime || 0,
          best_reaction_ms: localStats.bestTime || 0,
          total_energy_won: localStats.totalEnergyWon || 0,
        });
      }
    } catch (e) {
      console.debug('[BattleConsole] Stats load error:', e);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsPlaying(false); // Sempre inizia dalla lobby
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
    // Ricarica stats quando chiudi
    if (userId) {
      loadStats(userId);
    }
  };

  const handleStartBattle = () => {
    // NON navigare via! Mostra il gioco NEL modal
    setIsPlaying(true);
  };

  const handleBackToLobby = () => {
    setIsPlaying(false);
    // Ricarica stats
    if (userId) {
      loadStats(userId);
    }
  };

  return (
    <>
      {/* Compact Card - Tap to open modal */}
      <motion.div 
        className={`m1-relief rounded-[20px] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 mb-4 relative ${className}`}
        onClick={handleOpenModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated glow strip */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FC1EFF] to-transparent opacity-60"
            style={{
              animation: 'slideGlowBattle 3s ease-in-out infinite',
              width: '200%',
              left: '-100%'
            }}
          />
        </div>
        <style>{`
          @keyframes slideGlowBattle {
            0% { transform: translateX(0); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(0); }
          }
        `}</style>

        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FC1EFF] to-[#00D1FF] flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-orbitron font-bold text-white">
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
            <ChevronDown className="w-4 h-4 text-white/40" />
          </div>
          
          {/* Quick Stats Preview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats?.total_wins || 0}</p>
              <p className="text-[10px] text-white/50">Vinte</p>
            </div>
            <div className="text-center">
              <Users className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats?.total_losses || 0}</p>
              <p className="text-[10px] text-white/50">Perse</p>
            </div>
            <div className="text-center">
              <Zap className="w-4 h-4 text-[#00D1FF] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#00D1FF]">{stats?.win_rate || 0}%</p>
              <p className="text-[10px] text-white/50">Win Rate</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Battle Modal - TUTTO qui dentro */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accentColor="#FC1EFF"
        title={isPlaying ? "BATTLE ARENA" : "M1SSION BATTLE"}
        subtitle={isPlaying ? "Test your reflexes!" : "Arena di sfida tra agenti"}
      >
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BattleLobby stats={stats} onStartBattle={handleStartBattle} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {userId && (
                <BattleGameView userId={userId} onBack={handleBackToLobby} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassModal>
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
