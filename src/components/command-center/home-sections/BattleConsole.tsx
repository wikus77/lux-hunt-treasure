// @ts-nocheck
/**
 * M1SSION BATTLE Console - FULLSCREEN modals REVOLUT STYLE
 * Tap container → Lobby modal → INIZIA BATTAGLIA → Game modal
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Swords, ChevronDown, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BattleConsoleFlipOverlay } from "./BattleConsoleFlipOverlay";
import { BattleGameFlipOverlay } from "./BattleGameFlipOverlay";
import { BattleConsoleLobbyContent } from "./BattleConsoleLobbyContent";
import { BattleGameContent } from "./BattleGameContent";
import { useHomeSectionLauncher } from "@/contexts/HomeSectionLauncherContext";

interface BattleConsoleProps {
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function BattleConsole({ className }: BattleConsoleProps) {
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const battleCardRef = useRef<HTMLDivElement>(null);
  const { registerOpenBattle } = useHomeSectionLauncher();

  useEffect(() => {
    const cleanup = registerOpenBattle(() => {
      const rect = battleCardRef.current?.getBoundingClientRect() ?? null;
      setOriginRect(rect);
      setIsLobbyOpen(true);
      return true;
    });
    return cleanup;
  }, [registerOpenBattle]);

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

  const handleOpenLobby = (e: React.MouseEvent<HTMLDivElement>) => {
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setIsLobbyOpen(true);
  };

  const handleCloseLobby = () => {
    setIsLobbyOpen(false);
    // Ricarica stats quando chiudi
    if (userId) {
      loadStats(userId);
    }
  };

  const handleStartBattle = () => {
    // Chiudi lobby e apri game modal
    setIsLobbyOpen(false);
    setTimeout(() => {
      setIsGameOpen(true);
    }, 100);
  };

  const handleCloseGame = () => {
    setIsGameOpen(false);
    // Ricarica stats quando chiudi
    if (userId) {
      loadStats(userId);
    }
  };

  const handleBackToLobby = () => {
    // Chiudi game e riapri lobby
    setIsGameOpen(false);
    setTimeout(() => {
      setIsLobbyOpen(true);
    }, 100);
    // Ricarica stats
    if (userId) {
      loadStats(userId);
    }
  };

  return (
    <>
      {/* Compact Card - Tap to open lobby modal */}
      {/* 🔧 FIX 06/02/2026: Stile "Buzz Notifications/Generali" - glass graphite, no glow */}
      <motion.div 
        ref={battleCardRef}
        className={`m1-folder-glass--graphite rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 mb-4 relative ${className}`}
        onClick={handleOpenLobby}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FC1EFF] to-[#00D1FF] flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-orbitron font-bold">
                  <span className="text-cyan-400">M1</span><span className="text-white">SSION BATTLE</span>
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
          
          {/* Quick Stats Preview - 🔧 FIX 06/02/2026: Testi più visibili */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats?.total_wins || 0}</p>
              <p className="text-[10px] text-white/90">Vinte</p>
            </div>
            <div className="text-center">
              <Users className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{stats?.total_losses || 0}</p>
              <p className="text-[10px] text-white/90">Perse</p>
            </div>
            <div className="text-center">
              <Zap className="w-4 h-4 text-[#00D1FF] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#00D1FF]">{stats?.win_rate || 0}%</p>
              <p className="text-[10px] text-white/90">Win Rate</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Battle Lobby Modal - FULLSCREEN REVOLUT STYLE */}
      <BattleConsoleFlipOverlay
        open={isLobbyOpen}
        originRect={originRect}
        onClose={handleCloseLobby}
      >
        <BattleConsoleLobbyContent
          stats={stats}
          onClose={handleCloseLobby}
          onStartBattle={handleStartBattle}
        />
      </BattleConsoleFlipOverlay>

      {/* Battle Game Modal - FULLSCREEN REVOLUT STYLE */}
      <BattleGameFlipOverlay
        open={isGameOpen}
        onClose={handleCloseGame}
      >
        {userId && (
          <BattleGameContent
            userId={userId}
            onClose={handleCloseGame}
            onBack={handleBackToLobby}
          />
        )}
      </BattleGameFlipOverlay>
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
