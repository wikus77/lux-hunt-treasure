/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Advanced Leaderboard System - Complete Implementation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Star, TrendingUp, TrendingDown, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface AdvancedUserRanking {
  id: string;
  name: string;
  avatar?: string;
  totalScore: number;
  weeklyScore: number;
  monthlyScore: number;
  cluesFound: number;
  areasExplored: number;
  buzzUsed: number;
  premiumActivities: number;
  reputation: number;
  tier: string;
  achievements: string[];
  rankChange: number;
  streakDays: number;
  lastActiveDate: string;
}

interface LeaderboardFilters {
  timeframe: 'weekly' | 'monthly' | 'alltime';
  tier: 'all' | 'free' | 'premium' | 'vip';
  sortBy: 'score' | 'activity' | 'reputation';
  ascending: boolean;
}

export function AdvancedLeaderboard() {
  const [rankings, setRankings] = useState<AdvancedUserRanking[]>([]);
  const [filteredRankings, setFilteredRankings] = useState<AdvancedUserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: 'weekly',
    tier: 'all',
    sortBy: 'score',
    ascending: false
  });
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const { user } = useAuthContext();

  // Advanced scoring algorithm
  const calculateComplexScore = (user: AdvancedUserRanking, timeframe: string): number => {
    const baseMultipliers = {
      weekly: 1,
      monthly: 1.5,
      alltime: 2
    };

    const multiplier = baseMultipliers[timeframe as keyof typeof baseMultipliers] || 1;

    // Complex scoring formula considering multiple factors
    const activityScore = (user.cluesFound * 10 + user.areasExplored * 15) * multiplier;
    const engagementScore = (user.buzzUsed * 5 + user.premiumActivities * 20) * multiplier;
    const socialScore = user.reputation * 25 * multiplier;
    const consistencyBonus = user.streakDays * 2 * multiplier;
    const tierBonus = user.tier === 'vip' ? 100 : user.tier === 'premium' ? 50 : 0;

    return Math.floor(activityScore + engagementScore + socialScore + consistencyBonus + tierBonus);
  };

  // Fetch leaderboard data from Supabase - REAL DATA
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // 🔥 REAL DATA: Fetch from Supabase profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          agent_code,
          full_name,
          avatar_url,
          subscription_plan,
          current_streak_days,
          pulse_energy,
          m1_units
        `)
        .not('agent_code', 'is', null)
        .order('pulse_energy', { ascending: false })
        .limit(50);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('[AdvancedLeaderboard] No profiles found');
        setRankings([]);
        return;
      }

      // Get user IDs for additional queries
      const userIds = profiles.map(p => p.id);

      // Get clues count for each user
      const { data: cluesData } = await supabase
        .from('user_clues')
        .select('user_id')
        .in('user_id', userIds);

      const cluesCount: Record<string, number> = {};
      cluesData?.forEach(c => {
        cluesCount[c.user_id] = (cluesCount[c.user_id] || 0) + 1;
      });

      // Get buzz count for each user
      const { data: buzzData } = await supabase
        .from('user_buzz_counter')
        .select('user_id, buzz_count')
        .in('user_id', userIds);

      const buzzCount: Record<string, number> = {};
      buzzData?.forEach(b => {
        buzzCount[b.user_id] = (buzzCount[b.user_id] || 0) + (b.buzz_count || 0);
      });

      // Map subscription_plan to tier
      const mapTier = (plan: string | null): string => {
        if (!plan) return 'free';
        const planLower = plan.toLowerCase();
        if (planLower.includes('titanium') || planLower.includes('black')) return 'vip';
        if (planLower.includes('gold') || planLower.includes('silver')) return 'premium';
        return 'free';
      };

      // Calculate reputation based on activity (0-5 scale)
      const calculateReputation = (clues: number, buzz: number, streak: number): number => {
        const activityScore = (clues * 2 + buzz + streak * 3) / 100;
        return Math.min(5, Math.max(0, Math.round(activityScore * 10) / 10));
      };

      // Build real data array
      const realData: AdvancedUserRanking[] = profiles.map((profile) => {
        const clues = cluesCount[profile.id] || 0;
        const buzz = buzzCount[profile.id] || 0;
        const streak = profile.current_streak_days || 0;
        const tier = mapTier(profile.subscription_plan);
        const reputation = calculateReputation(clues, buzz, streak);

        return {
          id: profile.id,
          name: profile.full_name || profile.agent_code || 'Agent',
          avatar: profile.avatar_url || '',
          totalScore: 0, // Will be calculated
          weeklyScore: 0, // Will be calculated
          monthlyScore: 0, // Will be calculated
          cluesFound: clues,
          areasExplored: Math.floor((profile.pulse_energy || 0) / 50), // Estimate from pulse energy
          buzzUsed: buzz,
          premiumActivities: profile.m1_units || 0,
          reputation: reputation,
          tier: tier,
          achievements: streak >= 7 ? ['streak_master'] : streak >= 3 ? ['active'] : [],
          rankChange: 0, // Real change tracking requires position history
          streakDays: streak,
          lastActiveDate: new Date().toISOString().split('T')[0]
        };
      });

      // Calculate scores for each timeframe
      const enhancedData = realData.map(userData => ({
        ...userData,
        weeklyScore: calculateComplexScore(userData, 'weekly'),
        monthlyScore: calculateComplexScore(userData, 'monthly'),
        totalScore: calculateComplexScore(userData, 'alltime')
      }));

      // Sort by total score (default)
      enhancedData.sort((a, b) => b.totalScore - a.totalScore);

      console.log('[AdvancedLeaderboard] Loaded', enhancedData.length, 'real users');
      setRankings(enhancedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...rankings];

    // Filter by tier
    if (filters.tier !== 'all') {
      filtered = filtered.filter(user => user.tier === filters.tier);
    }

    // Sort by selected criteria
    filtered.sort((a, b) => {
      let valueA: number, valueB: number;

      switch (filters.sortBy) {
        case 'activity':
          valueA = a.cluesFound + a.areasExplored;
          valueB = b.cluesFound + b.areasExplored;
          break;
        case 'reputation':
          valueA = a.reputation;
          valueB = b.reputation;
          break;
        case 'score':
        default:
          valueA = filters.timeframe === 'weekly' ? a.weeklyScore :
                   filters.timeframe === 'monthly' ? a.monthlyScore : a.totalScore;
          valueB = filters.timeframe === 'weekly' ? b.weeklyScore :
                   filters.timeframe === 'monthly' ? b.monthlyScore : b.totalScore;
      }

      return filters.ascending ? valueA - valueB : valueB - valueA;
    });

    setFilteredRankings(filtered);

    // Find user position
    if (user) {
      const position = filtered.findIndex(u => u.id === user.id);
      setUserPosition(position >= 0 ? position + 1 : null);
    }
  }, [rankings, filters, user]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 1) return <Trophy className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-[hsl(var(--foreground))]">{rank + 1}</span>;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <span className="w-4 h-4 bg-[hsl(var(--muted))] rounded-full" />;
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-yellow-400 text-black';
      case 'premium': return 'bg-m1ssion-blue text-white';
      default: return 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]';
    }
  };

  const renderAdvancedLeaderboardRow = (user: AdvancedUserRanking, index: number) => {
    const score = filters.timeframe === 'weekly' ? user.weeklyScore :
                  filters.timeframe === 'monthly' ? user.monthlyScore : user.totalScore;

    return (
      <div
        key={user.id}
        className={`flex items-center justify-between p-4 border-b border-[hsl(var(--border))] transition-all duration-300 ${
          index < 3 ? 'bg-[hsl(var(--accent))]/20' : 'hover:bg-[hsl(var(--accent))]/10'
        } ${userPosition === index + 1 ? 'ring-2 ring-m1ssion-blue bg-m1ssion-blue/5' : ''}`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            {getRankIcon(index)}
            {getRankChangeIcon(user.rankChange)}
          </div>
          
          <Avatar className="h-12 w-12 border-2 border-[hsl(var(--border))]">
            <img
              src={user.avatar || `https://avatar.vercel.sh/${user.name}`}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-[hsl(var(--foreground))]">{user.name}</p>
              <Badge className={`text-xs ${getTierBadgeColor(user.tier)}`}>
                {user.tier.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{user.reputation}</span>
              </div>
              <span>{user.cluesFound} indizi</span>
              <span>{user.areasExplored} aree</span>
              <span>{user.streakDays}d streak</span>
            </div>

            {user.achievements.length > 0 && (
              <div className="flex gap-1 mt-2">
                {user.achievements.slice(0, 3).map((achievement, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-m1ssion-blue">
            {score.toLocaleString()}
          </p>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {user.rankChange !== 0 && (
              <span className={user.rankChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {user.rankChange > 0 ? '+' : ''}{user.rankChange}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            Classifica Avanzata
          </CardTitle>
          {userPosition && (
            <Badge variant="outline" className="text-m1ssion-blue">
              La tua posizione: #{userPosition}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filters.timeframe} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, timeframe: value as any }))
        }>
          <TabsList className="w-full bg-[hsl(var(--muted))]">
            <TabsTrigger value="weekly" className="flex-1">Settimanale</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Mensile</TabsTrigger>
            <TabsTrigger value="alltime" className="flex-1">All Time</TabsTrigger>
          </TabsList>

          {/* Advanced Filters */}
          <div className="flex gap-2 mt-4 mb-4 flex-wrap">
            <select
              value={filters.tier}
              onChange={(e) => setFilters(prev => ({ ...prev, tier: e.target.value as any }))}
              className="px-3 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
            >
              <option value="all">Tutti i Tier</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
            >
              <option value="score">Punteggio</option>
              <option value="activity">Attività</option>
              <option value="reputation">Reputazione</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, ascending: !prev.ascending }))}
            >
              {filters.ascending ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <TabsContent value="weekly" className="mt-4">
            <div className="space-y-1">
               {loading ? (
                <div className="flex justify-center py-4">
                  <div className="text-white/60 text-sm">Caricamento...</div>
                </div>
               ) : (
                filteredRankings.map((user, index) => renderAdvancedLeaderboardRow(user, index))
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <div className="space-y-1">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-m1ssion-blue"></div>
                </div>
              ) : (
                filteredRankings.map((user, index) => renderAdvancedLeaderboardRow(user, index))
              )}
            </div>
          </TabsContent>

          <TabsContent value="alltime" className="mt-4">
            <div className="space-y-1">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-m1ssion-blue"></div>
                </div>
              ) : (
                filteredRankings.map((user, index) => renderAdvancedLeaderboardRow(user, index))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */