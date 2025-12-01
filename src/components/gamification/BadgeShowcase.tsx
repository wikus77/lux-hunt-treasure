/**
 * BADGE SHOWCASE - Premium M1SSION Style
 * Animated badges with categories and rarities
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { Lock, Sparkles, Trophy, Map as MapIcon, Users, Clock, Star } from 'lucide-react';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface Badge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}

interface CategoryProgress {
  category: string;
  total: number;
  unlocked: number;
}

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  exploration: { label: 'Esplorazione', icon: <MapIcon className="w-4 h-4" />, color: '#00D1FF' },
  social: { label: 'Social', icon: <Users className="w-4 h-4" />, color: '#FF59F8' },
  missions: { label: 'Missioni', icon: <Trophy className="w-4 h-4" />, color: '#FFD700' },
  time: { label: 'Tempo', icon: <Clock className="w-4 h-4" />, color: '#00FF88' },
  special: { label: 'Speciali', icon: <Star className="w-4 h-4" />, color: '#9B59B6' },
};

const RARITY_STYLES: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  common: {
    bg: 'from-gray-600/30 to-gray-700/30',
    border: 'border-gray-500/40',
    glow: '',
    text: 'text-gray-300'
  },
  rare: {
    bg: 'from-blue-600/30 to-cyan-600/30',
    border: 'border-blue-400/50',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    text: 'text-blue-400'
  },
  epic: {
    bg: 'from-purple-600/30 to-pink-600/30',
    border: 'border-purple-400/50',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    text: 'text-purple-400'
  },
  legendary: {
    bg: 'from-yellow-500/30 to-orange-500/30',
    border: 'border-yellow-400/60',
    glow: 'shadow-[0_0_25px_rgba(250,204,21,0.5)]',
    text: 'text-yellow-400'
  }
};

export function BadgeShowcase() {
  const { user } = useAuthContext();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBadges();
    }
  }, [user?.id]);

  const fetchBadges = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true });

      if (badgesError) throw badgesError;

      // Fetch user's unlocked badges
      const { data: userBadges, error: userError } = await supabase
        .from('user_badges')
        .select('badge_id, created_at')
        .eq('user_id', user.id);

      if (userError) throw userError;

      const unlockedMap = new Map(
        userBadges?.map(ub => [ub.badge_id, ub.created_at]) || []
      );

      // Merge data
      const mergedBadges: Badge[] = (allBadges || []).map(badge => ({
        badge_id: badge.badge_id,
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon || '🏅',
        category: badge.category || 'general',
        rarity: badge.rarity || 'common',
        xp_reward: badge.xp_reward || 10,
        unlocked: unlockedMap.has(badge.badge_id),
        unlocked_at: unlockedMap.get(badge.badge_id)
      }));

      setBadges(mergedBadges);

      // Calculate category progress
      const progressMap = new Map<string, { total: number; unlocked: number }>();
      mergedBadges.forEach(badge => {
        const cat = badge.category;
        const current = progressMap.get(cat) || { total: 0, unlocked: 0 };
        current.total++;
        if (badge.unlocked) current.unlocked++;
        progressMap.set(cat, current);
      });

      setCategoryProgress(
        Array.from(progressMap.entries()).map(([category, { total, unlocked }]) => ({
          category,
          total,
          unlocked
        }))
      );

    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(b => b.category === selectedCategory);

  const totalUnlocked = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Collezione Badge
          </h3>
          <p className="text-sm text-gray-400">
            {totalUnlocked} / {totalBadges} sbloccati
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">
            {Math.round((totalUnlocked / totalBadges) * 100)}%
          </div>
          <p className="text-xs text-gray-500">Completamento</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(totalUnlocked / totalBadges) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { hapticLight(); setSelectedCategory('all'); }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
              : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
          }`}
        >
          Tutti ({totalBadges})
        </motion.button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
          const progress = categoryProgress.find(p => p.category === key);
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticLight(); setSelectedCategory(key); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === key
                  ? 'text-white'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
              style={selectedCategory === key ? { 
                background: `linear-gradient(135deg, ${info.color}40, ${info.color}20)`,
                borderColor: `${info.color}60`
              } : {}}
            >
              <span style={{ color: selectedCategory === key ? info.color : 'inherit' }}>
                {info.icon}
              </span>
              {info.label}
              {progress && (
                <span className="text-xs opacity-60">
                  {progress.unlocked}/{progress.total}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge, index) => {
            const rarityStyle = RARITY_STYLES[badge.rarity];
            
            return (
              <motion.div
                key={badge.badge_id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { hapticLight(); setSelectedBadge(badge); }}
                className={`relative aspect-square rounded-xl border cursor-pointer overflow-hidden transition-all
                  bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border} ${badge.unlocked ? rarityStyle.glow : 'opacity-40'}
                `}
              >
                {/* Animated glow for legendary */}
                {badge.unlocked && badge.rarity === 'legendary' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {/* Lock overlay */}
                {!badge.unlocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                )}

                {/* Badge content */}
                <div className="relative z-5 h-full flex flex-col items-center justify-center p-2">
                  <motion.span
                    className="text-2xl sm:text-3xl"
                    animate={badge.unlocked && badge.rarity !== 'common' ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {badge.icon}
                  </motion.span>
                  
                  {/* Rarity indicator */}
                  <div className={`absolute bottom-1 left-1 right-1 text-center`}>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${rarityStyle.text}`}>
                      {badge.rarity}
                    </span>
                  </div>
                </div>

                {/* XP reward indicator */}
                {badge.unlocked && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-[8px] font-bold text-yellow-400">
                    +{badge.xp_reward}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm p-6 rounded-2xl border overflow-hidden
                bg-gradient-to-br ${RARITY_STYLES[selectedBadge.rarity].bg}
                ${RARITY_STYLES[selectedBadge.rarity].border}
                ${RARITY_STYLES[selectedBadge.rarity].glow}
              `}
            >
              {/* Animated background for legendary */}
              {selectedBadge.rarity === 'legendary' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}

              <div className="relative z-10 text-center">
                {/* Badge Icon */}
                <motion.div
                  animate={selectedBadge.unlocked ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {selectedBadge.icon}
                </motion.div>

                {/* Badge Name */}
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                  {selectedBadge.name}
                </h3>

                {/* Rarity Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${RARITY_STYLES[selectedBadge.rarity].text} bg-black/30`}>
                  {selectedBadge.rarity}
                </span>

                {/* Description */}
                <p className="text-sm text-gray-300 mt-4">
                  {selectedBadge.description}
                </p>

                {/* XP Reward */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">+{selectedBadge.xp_reward} PE</span>
                </div>

                {/* Status */}
                <div className="mt-4">
                  {selectedBadge.unlocked ? (
                    <div className="text-green-400 text-sm">
                      ✓ Sbloccato {selectedBadge.unlocked_at && (
                        <span className="text-gray-500">
                          il {new Date(selectedBadge.unlocked_at).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Non ancora sbloccato
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="mt-4 text-xs text-gray-500">
                  Categoria: {CATEGORY_INFO[selectedBadge.category]?.label || selectedBadge.category}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nessun badge in questa categoria
        </div>
      )}
    </div>
  );
}

export default BadgeShowcase;

