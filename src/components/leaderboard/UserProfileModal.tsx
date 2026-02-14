// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * UserProfileModal - Glass modal for leaderboard long-press
 * Shows user profile with "Chatta" CTA
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, User, Calendar, Trophy, Zap, Flame, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hapticLight, hapticMedium } from '@/utils/haptics';
import { useLocation } from 'wouter';

interface LeaderboardUser {
  id: string;
  full_name?: string;
  agent_code?: string;
  avatar_url?: string;
  total_score: number;
  rank: number;
  streak_days: number;
  clues_unlocked?: number;
  pulse_energy?: number;
  subscription_plan?: string;
  city?: string;
  country?: string;
  created_at?: string;
  hierarchy_rank?: string;
}

interface UserProfileModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
}

// Hierarchy rank badges - keys for i18n
const HIERARCHY_KEYS: Record<string, string> = {
  'recruit': 'leaderboard_hierarchy_recruit',
  'agent': 'leaderboard_hierarchy_agent',
  'operative': 'leaderboard_hierarchy_operative',
  'specialist': 'leaderboard_hierarchy_specialist',
  'commander': 'leaderboard_hierarchy_commander',
  'director': 'leaderboard_hierarchy_director',
  'elite': 'leaderboard_hierarchy_elite',
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const locale = i18n.language === 'it' ? 'it-IT' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
      return new Date(dateString).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const getHierarchyBadge = (rank?: string) => {
    const key = HIERARCHY_KEYS[rank?.toLowerCase() || ''];
    const label = key ? t(key) : (rank || t('leaderboard_hierarchy_agent'));
    const colors: Record<string, string> = {
      'recruit': 'bg-gray-500',
      'agent': 'bg-blue-500',
      'operative': 'bg-green-500',
      'specialist': 'bg-purple-500',
      'commander': 'bg-orange-500',
      'director': 'bg-pink-500',
      'elite': 'bg-yellow-500',
    };
    return { label, color: colors[rank?.toLowerCase() || ''] || 'bg-cyan-500' };
  };

  const handleChat = () => {
    hapticMedium();
    onClose();
    // Navigate to chat with user - uses existing chat infrastructure
    // For now, open AION/Intelligence page with a message intent
    navigate(`/intelligence?chat_with=${user?.id}&name=${encodeURIComponent(user?.full_name || 'Agente')}`);
  };

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  if (!user) return null;

  const hierarchyBadge = getHierarchyBadge(user.hierarchy_rank);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />

          {/* Modal - 🔧 FIX 23/01/2026: Proper centering with safe-area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-full max-w-md max-h-[calc(100vh-120px)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,209,255,0.2)]">
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl" />

              {/* Content */}
              <div className="relative p-5 space-y-4">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-3 border-cyan-500/50 shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-purple-600 text-white text-2xl font-bold">
                        {user.full_name?.charAt(0) || user.agent_code?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Rank badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-sm shadow-lg">
                      #{user.rank}
                    </div>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-white">
                    {user.full_name || t('leaderboard_agent_anonymous')}
                  </h2>

                  {/* Agent code */}
                  <p className="text-sm text-gray-400 font-mono">
                    {user.agent_code || '—'}
                  </p>

                  {/* Hierarchy badge */}
                  <Badge className={`mt-2 ${hierarchyBadge.color} text-white text-xs px-3 py-1`}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {hierarchyBadge.label}
                  </Badge>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1 text-cyan-400">
                      <Star className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {user.total_score?.toLocaleString() || '0'}
                    </div>
                    <div className="text-[10px] text-gray-500">{t('leaderboard_profile_points')}</div>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {user.streak_days || 0}d
                    </div>
                    <div className="text-[10px] text-gray-500">{t('leaderboard_profile_streak')}</div>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-1 text-green-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {user.clues_unlocked || user.pulse_energy || 0}
                    </div>
                    <div className="text-[10px] text-gray-500">{t('leaderboard_profile_clues')}</div>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{t('leaderboard_profile_joined')} {formatDate(user.created_at)}</span>
                  </div>
                  {user.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>{user.city}{user.country ? `, ${user.country}` : ''}</span>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 pt-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {t('leaderboard_profile_close')}
                  </Button>
                  <Button
                    onClick={handleChat}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('leaderboard_profile_chat')}
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;
