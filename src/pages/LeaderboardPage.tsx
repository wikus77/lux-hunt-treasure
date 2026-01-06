// @ts-nocheck
/**
 * REALTIME LEADERBOARD PAGE
 * Live updates, geographic filters, Top 10 effects, overtake notifications
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Star, TrendingUp, TrendingDown,
  Users, ChevronUp, ChevronDown, Globe, MapPin, Map, 
  Zap, Flame, RefreshCw, AlertTriangle, Circle, MessageSquare
} from 'lucide-react';
import { useLocation } from 'wouter';

// Custom Icons for M1SSION style
const TriangleDownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className={className}>
    <polygon points="12,20 3,6 21,6" />
  </svg>
);

const TriangleUpIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className={className}>
    <polygon points="12,4 3,18 21,18" />
  </svg>
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useRealtimeLeaderboard, LeaderboardScope } from '@/hooks/useRealtimeLeaderboard';
import { hapticLight } from '@/utils/haptics';
import { notifyShadowContext } from '@/stores/entityOverlayStore'; // 🌑 Shadow Protocol v3
import { MotivationalPopup } from '@/components/feedback';

// Forum Quick Link Component
const ForumQuickLink: React.FC = () => {
  const [, navigate] = useLocation();
  
  return (
    <motion.button
      onClick={() => {
        hapticLight();
        navigate('/forum');
      }}
      className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 hover:border-purple-400/60 transition-all"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <MessageSquare className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-purple-300 font-medium">Entra nel Forum</span>
    </motion.button>
  );
};

export const LeaderboardPage: React.FC = () => {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('score');

  const { 
    leaderboard, 
    loading, 
    error,
    currentUserRank, 
    lastOvertake,
    refetch,
    getFilterOptions 
  } = useRealtimeLeaderboard({
    scope,
    filterValue: filterValue || undefined,
    limit: 50,
    enableNotifications: true
  });

  // 🌑 Shadow Protocol v3 - Trigger contestuale LEADERBOARD al mount
  useEffect(() => {
    notifyShadowContext('leaderboard');
  }, []);

  // Load filter options when scope changes
  useEffect(() => {
    if (scope !== 'global') {
      getFilterOptions(scope as 'city' | 'region' | 'country').then(setFilterOptions);
    } else {
      setFilterOptions([]);
      setFilterValue('');
    }
  }, [scope, getFilterOptions]);

  const handleScopeChange = (newScope: LeaderboardScope) => {
    hapticLight();
    setScope(newScope);
    setFilterValue('');
  };

  // Get rank styling with special effects for Top 10 - M1SSION STYLE
  const getRankStyling = (rank: number, isTop10: boolean) => {
    if (rank === 1) {
      // 1° POSTO: Viola → Rosa + Triangolo Rovesciato
      return {
        icon: <TriangleDownIcon className="w-7 h-7 text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)]" />,
        bgClass: 'bg-gradient-to-r from-purple-600/40 to-pink-500/40',
        borderClass: 'border-pink-500/60',
        glowClass: 'shadow-[0_0_25px_rgba(236,72,153,0.5)]',
        textClass: 'text-pink-400'
      };
    }
    if (rank === 2) {
      // 2° POSTO: Viola → Blu + Triangolo Normale
      return {
        icon: <TriangleUpIcon className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />,
        bgClass: 'bg-gradient-to-r from-purple-600/35 to-blue-500/35',
        borderClass: 'border-blue-500/50',
        glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
        textClass: 'text-blue-400'
      };
    }
    if (rank === 3) {
      // 3° POSTO: Viola → Verde + Cerchio
      return {
        icon: <Circle className="w-6 h-6 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />,
        bgClass: 'bg-gradient-to-r from-purple-600/30 to-emerald-500/30',
        borderClass: 'border-emerald-500/50',
        glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
        textClass: 'text-emerald-400'
      };
    }
    if (isTop10) {
      return {
        icon: <span className="w-6 h-6 flex items-center justify-center text-cyan-400 font-bold text-lg">#{rank}</span>,
        bgClass: 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10',
        borderClass: 'border-cyan-500/30',
        glowClass: 'shadow-[0_0_10px_rgba(0,209,255,0.2)]',
        textClass: 'text-cyan-400'
      };
    }
    return {
      icon: <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</span>,
      bgClass: 'bg-gray-800/30',
      borderClass: 'border-gray-700/30',
      glowClass: '',
      textClass: 'text-gray-400'
    };
  };

  // Get tier badge
  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'premium':
      case 'gold':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] px-1.5">GOLD</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400 text-black text-[10px] px-1.5">SILVER</Badge>;
      case 'black':
      case 'titanium':
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-1.5">VIP</Badge>;
      default:
        return null;
    }
  };

  // Scope icons
  const scopeIcons = {
    global: <Globe className="w-4 h-4" />,
    country: <Map className="w-4 h-4" />,
    region: <MapPin className="w-4 h-4" />,
    city: <MapPin className="w-4 h-4" />
  };

  return (
    <div 
      className="min-h-[100dvh] w-full overflow-x-hidden p-4 space-y-4" 
      data-onboarding="leaderboard"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TriangleDownIcon className="w-8 h-8 text-[#00D1FF] drop-shadow-[0_0_10px_rgba(0,209,255,0.6)]" />
          </motion.div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            <span className="text-[#00D1FF]">LIVE</span> Classifica
          </h1>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-green-500"
          />
        </div>
        <p className="text-gray-400 text-sm">
          Aggiornamenti in tempo reale
        </p>
        {/* Forum Quick Link */}
        <ForumQuickLink />
      </motion.div>

      {/* Overtake Alert */}
      <AnimatePresence>
        {lastOvertake && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 text-sm">
                <strong>{lastOvertake.name}</strong> ti ha superato! Ora è #{lastOvertake.rank}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scope Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['global', 'country', 'region', 'city'] as LeaderboardScope[]).map((s) => (
            <Button
              key={s}
              variant={scope === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleScopeChange(s)}
              className={`flex-shrink-0 ${scope === s ? 'bg-[#00D1FF] text-black' : 'border-gray-600'}`}
            >
              {scopeIcons[s]}
              <span className="ml-1.5 capitalize">{s === 'global' ? 'Globale' : s === 'country' ? 'Nazione' : s === 'region' ? 'Regione' : 'Città'}</span>
            </Button>
          ))}
        </div>

        {scope !== 'global' && filterOptions.length > 0 && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600">
              <SelectValue placeholder={`Seleziona ${scope === 'country' ? 'nazione' : scope === 'region' ? 'regione' : 'città'}`} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* Current User Rank */}
      {currentUserRank && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-gradient-to-r from-[#00D1FF]/20 to-[#7B5CFF]/20 border-[#00D1FF]/40 shadow-[0_0_20px_rgba(0,209,255,0.2)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="text-3xl font-orbitron font-bold text-[#00D1FF]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    #{currentUserRank.rank}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white">La tua posizione</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">{currentUserRank.agent_code}</p>
                      {currentUserRank.change !== undefined && currentUserRank.change !== 0 && (
                        <span className={`text-xs flex items-center ${currentUserRank.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {currentUserRank.change > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {Math.abs(currentUserRank.change)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#00D1FF]">
                    {currentUserRank.total_score.toLocaleString()} pts
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {currentUserRank.streak_days}d streak
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { hapticLight(); refetch(); }}
          disabled={loading}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      {/* Leaderboard List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {loading && leaderboard.length === 0 ? (
          <div className="flex justify-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-[#00D1FF] border-t-transparent rounded-full"
            />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">
            <p>{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">Riprova</Button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessun agente trovato</p>
          </div>
        ) : (
          <AnimatePresence>
            {leaderboard.map((user, index) => {
              const isTop10 = user.rank <= 10;
              const style = getRankStyling(user.rank, isTop10);
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                >
                  <Card className={`${style.bgClass} ${style.borderClass} ${style.glowClass} ${
                    user.isCurrentUser ? 'ring-2 ring-[#00D1FF]' : ''
                  } transition-all duration-300 overflow-hidden`}>
                    {/* Top 3 animated glow bar */}
                    {user.rank <= 3 && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            user.rank === 1 ? 'bg-yellow-400' : 
                            user.rank === 2 ? 'bg-gray-300' : 'bg-amber-500'
                          }`}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          style={{ width: '50%' }}
                        />
                      </div>
                    )}

                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        {/* Rank & User Info */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <motion.div 
                            className="flex-shrink-0"
                            animate={user.rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {style.icon}
                          </motion.div>
                          
                          <Avatar className={`w-10 h-10 sm:w-12 sm:h-12 border-2 ${style.borderClass}`}>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-gray-700 text-white text-sm">
                              {user.full_name?.charAt(0) || user.agent_code?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={`font-semibold truncate ${user.isCurrentUser ? 'text-[#00D1FF]' : 'text-white'}`}>
                                {user.full_name || 'Agente'}
                              </p>
                              {user.isCurrentUser && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">Tu</Badge>
                              )}
                              {getTierBadge(user.subscription_plan)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="font-mono">{user.agent_code}</span>
                              {user.city && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {user.city}
                                </span>
                              )}
                            </div>
                            {/* Stats row for Top 10 */}
                            {isTop10 && (
                              <div className="flex items-center gap-2 mt-1 text-[10px]">
                                <span className="flex items-center gap-0.5 text-cyan-400">
                                  <Zap className="w-3 h-3" />
                                  {user.pulse_energy}
                                </span>
                                <span className="flex items-center gap-0.5 text-green-400">
                                  <Star className="w-3 h-3" />
                                  {user.clues_unlocked}
                                </span>
                                <span className="flex items-center gap-0.5 text-orange-400">
                                  <Flame className="w-3 h-3" />
                                  {user.streak_days}d
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score & Change */}
                        <div className="text-right flex-shrink-0 ml-2">
                          <motion.div 
                            className={`text-lg sm:text-xl font-bold ${style.textClass}`}
                            animate={isTop10 ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {user.total_score.toLocaleString()}
                          </motion.div>
                          {user.change !== undefined && user.change !== 0 && (
                            <div className={`flex items-center justify-end gap-0.5 text-xs ${
                              user.change > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {user.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {user.change > 0 ? '+' : ''}{user.change}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 pt-4"
      >
        <Card className="bg-gray-800/30 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[#00D1FF]" />
            <div className="text-lg font-bold text-white">{leaderboard.length}</div>
            <div className="text-[10px] text-gray-400">Agenti</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/30 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <TriangleDownIcon className="w-5 h-5 mx-auto mb-1 text-pink-400" />
            <div className="text-lg font-bold text-white">
              {leaderboard[0]?.total_score.toLocaleString() || '0'}
            </div>
            <div className="text-[10px] text-gray-400">Top Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/30 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <div className="text-lg font-bold text-white">
              {Math.max(...leaderboard.map(u => u.streak_days), 0)}d
            </div>
            <div className="text-[10px] text-gray-400">Max Streak</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-2"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          Classifica live • Aggiornamento automatico
        </div>
      </motion.div>
      
      {/* 🎯 Motivational Popup - Shows once per session */}
      <MotivationalPopup pageType="leaderboard" />
    </div>
  );
};

export default LeaderboardPage;
