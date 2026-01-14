/**
 * M1SSION™ — Rank Detail Modal
 * Modal completo con tutte le informazioni sul rank e PE
 * Responsive, rimane tra header e bottom nav
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronUp, Target, Trophy, Flame, MessageCircle, Gamepad2, Map, Clock } from 'lucide-react';
import { useHierarchyRank } from '@/hooks/useHierarchyRank';
import { HIERARCHY_LEVELS, HierarchyLevel } from '@/config/hierarchyConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface RankDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PEActivity {
  action: string;
  amount: number;
  date: string;
  icon: React.ReactNode;
}

export const RankDetailModal: React.FC<RankDetailModalProps> = ({ isOpen, onClose }) => {
  const { state } = useHierarchyRank();
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<PEActivity[]>([]);

  // Fetch recent PE activities (simulato per ora, in futuro può essere da DB)
  useEffect(() => {
    if (isOpen && user?.id) {
      // Per ora mostriamo attività tipiche, in futuro potranno essere da pe_daily_awards
      const mockActivities: PEActivity[] = [
        { action: 'Buzz Click', amount: 10, date: 'Oggi', icon: <Target className="w-4 h-4" /> },
        { action: 'Buzz Map', amount: 15, date: 'Oggi', icon: <Map className="w-4 h-4" /> },
        { action: 'Pulse Breaker', amount: 10, date: 'Oggi', icon: <Gamepad2 className="w-4 h-4" /> },
        { action: 'Daily Login', amount: 5, date: 'Oggi', icon: <Flame className="w-4 h-4" /> },
        { action: 'AION Chat', amount: 20, date: 'Ieri', icon: <MessageCircle className="w-4 h-4" /> },
        { action: 'Map Time (10 min)', amount: 30, date: 'Ieri', icon: <Clock className="w-4 h-4" /> },
      ];
      setRecentActivities(mockActivities);
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const currentLevel = state?.currentLevel;
  const nextLevel = state?.nextLevel;
  const pulseEnergy = state?.pulseEnergy ?? 0;
  const progressPercent = state?.progressPercent ?? 0;
  const peInCurrentLevel = state?.peInCurrentLevel ?? 0;
  const peNeededForLevel = state?.peNeededForLevel ?? 0;
  const peToNextLevel = state?.peToNextLevel ?? 0;
  const isMaxLevel = state?.isMaxLevel ?? false;

  const formatPE = (pe: number) => {
    if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
    if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
    return pe.toString();
  };

  const rankColor = currentLevel?.color || '#00e7ff';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container - tra header e bottom nav */}
          <motion.div
            className="fixed left-0 right-0 z-[9999] px-4"
            style={{
              top: 'calc(72px + env(safe-area-inset-top, 0px))',
              bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              className="w-full max-w-md max-h-full overflow-y-auto rounded-3xl"
              style={{
                background: 'linear-gradient(180deg, rgba(10, 15, 30, 0.98) 0%, rgba(5, 10, 20, 0.99) 100%)',
                border: `2px solid ${rankColor}50`,
                boxShadow: `0 0 60px ${rankColor}30, 0 25px 50px rgba(0, 0, 0, 0.5)`,
              }}
            >
              {/* Header */}
              <div 
                className="relative p-6 pb-4 border-b border-white/10"
                style={{
                  background: `linear-gradient(180deg, ${rankColor}15 0%, transparent 100%)`,
                }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                {/* Badge grande */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="text-7xl mb-3"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      filter: `drop-shadow(0 0 30px ${rankColor})`,
                    }}
                  >
                    {currentLevel?.icon || '❓'}
                  </motion.div>

                  <h2 
                    className="text-2xl font-black uppercase tracking-wider mb-1"
                    style={{ color: rankColor }}
                  >
                    {currentLevel?.name || 'Unranked'}
                  </h2>

                  <p className="text-white/50 text-sm font-mono">
                    Livello {currentLevel?.level || 0}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* PE Totali */}
                <div className="text-center">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Pulse Energy Totale</p>
                  <div 
                    className="text-4xl font-black font-mono"
                    style={{
                      background: `linear-gradient(90deg, ${rankColor}, #8b5cf6, #00ff88)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {formatPE(pulseEnergy)} PE
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50">Progresso Livello</span>
                    <span style={{ color: rankColor }} className="font-bold">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>

                  <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${rankColor}, ${rankColor}99)`,
                        boxShadow: `0 0 10px ${rankColor}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>

                  <div className="flex justify-between text-xs mt-2 text-white/40 font-mono">
                    <span>{formatPE(peInCurrentLevel)} PE</span>
                    <span>{formatPE(peNeededForLevel)} PE</span>
                  </div>
                </div>

                {/* Next Rank */}
                {nextLevel && !isMaxLevel ? (
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: `${nextLevel.color}10`,
                      borderColor: `${nextLevel.color}30`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronUp className="w-5 h-5" style={{ color: nextLevel.color }} />
                      <div className="flex-1">
                        <p className="text-xs text-white/50">Prossimo Grado</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{nextLevel.icon}</span>
                          <span className="font-bold" style={{ color: nextLevel.color }}>
                            {nextLevel.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">Mancano</p>
                        <p className="font-bold font-mono" style={{ color: nextLevel.color }}>
                          {formatPE(peToNextLevel)} PE
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-400 font-bold">GRADO MASSIMO RAGGIUNTO!</p>
                  </div>
                )}

                {/* Attività Recenti */}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Come guadagnare PE
                  </p>

                  <div className="space-y-2">
                    {[
                      { action: 'Buzz Click', amount: '+10 PE', limit: '5/giorno' },
                      { action: 'Buzz Map', amount: '+15 PE', limit: '3/giorno' },
                      { action: 'Pulse Breaker (vittoria)', amount: '+10 PE', limit: '10/giorno' },
                      { action: 'Tron Battle (vittoria)', amount: '+50 PE', limit: '∞' },
                      { action: 'AION Chat', amount: '+20 PE', limit: '3/giorno' },
                      { action: 'Forum Post', amount: '+25 PE', limit: '5/giorno' },
                      { action: 'Tempo Mappa (4 min)', amount: '+15 PE', limit: '1/giorno' },
                      { action: 'Tempo Mappa (10 min)', amount: '+30 PE', limit: '1/giorno' },
                      { action: 'Ruota Fortuna', amount: '+10 PE', limit: '1/giorno' },
                      { action: 'Login Giornaliero', amount: '+5 PE', limit: '1/giorno' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                      >
                        <span className="text-sm text-white/70">{item.action}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{item.limit}</span>
                          <span className="text-sm font-bold text-emerald-400">{item.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gerarchia Completa */}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                    Gerarchia Completa
                  </p>

                  <div className="space-y-1">
                    {HIERARCHY_LEVELS.filter(l => l.code !== 'MCP').map((level) => {
                      const isUnlocked = pulseEnergy >= level.peThreshold;
                      const isCurrent = currentLevel?.level === level.level;

                      return (
                        <div
                          key={level.level}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isCurrent ? 'bg-white/10 border border-white/20' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{level.icon}</span>
                            <span 
                              className={`text-sm font-medium ${isUnlocked ? '' : 'opacity-40'}`}
                              style={{ color: isUnlocked ? level.color : undefined }}
                            >
                              {level.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 font-mono">
                              {formatPE(level.peThreshold)} PE
                            </span>
                            {isUnlocked ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-white/20">🔒</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default RankDetailModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

