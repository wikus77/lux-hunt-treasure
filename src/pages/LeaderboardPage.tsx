// M1SSION™ - Leaderboard Page for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Target, 
  Star,
  TrendingUp,
  Users,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

interface LeaderboardUser {
  id: string;
  full_name: string;
  agent_code: string;
  avatar_url?: string;
  credits: number;
  subscription_tier: string;
  clues_unlocked: number;
  buzz_used: number;
  rank: number;
  change: number; // Position change from last week
}

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('credits');
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();

  // Load leaderboard data
  const loadLeaderboard = preserveFunctionName(async (sortBy: string = 'credits') => {
    try {
      setLoading(true);

      // Get profiles with stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, agent_code, avatar_url, credits, subscription_tier')
        .not('agent_code', 'is', null)
        .order(sortBy, { ascending: false })
        .limit(50);

      if (profilesError) {
        console.error('Error loading leaderboard:', profilesError);
        toast.error('Errore nel caricamento della classifica');
        return;
      }

      // Get clues count for each user
      const userIds = profiles?.map(p => p.id) || [];
      
      const [cluesResult, buzzResult] = await Promise.all([
        supabase
          .from('user_clues')
          .select('user_id')
          .in('user_id', userIds),
        supabase
          .from('user_buzz_counter')
          .select('user_id, buzz_count')
          .in('user_id', userIds)
      ]);

      // Count clues per user
      const cluesCount = cluesResult.data?.reduce((acc, clue) => {
        acc[clue.user_id] = (acc[clue.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Count buzz per user
      const buzzCount = buzzResult.data?.reduce((acc, buzz) => {
        acc[buzz.user_id] = (acc[buzz.user_id] || 0) + buzz.buzz_count;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine data and add rankings
      const enrichedData = profiles?.map((profile, index) => ({
        ...profile,
        clues_unlocked: cluesCount[profile.id] || 0,
        buzz_used: buzzCount[profile.id] || 0,
        rank: index + 1,
        change: Math.floor(Math.random() * 21) - 10 // Mock change data
      })) || [];

      // Sort by selected criteria
      const sortedData = enrichedData.sort((a, b) => {
        switch (sortBy) {
          case 'clues_unlocked':
            return b.clues_unlocked - a.clues_unlocked;
          case 'buzz_used':
            return b.buzz_used - a.buzz_used;
          default:
            return b.credits - a.credits;
        }
      }).map((user, index) => ({ ...user, rank: index + 1 }));

      setLeaderboard(sortedData);

      // Find current user
      if (user) {
        const currentUser = sortedData.find(u => u.id === user.id);
        setCurrentUserRank(currentUser || null);
      }

    } catch (err) {
      console.error('Error in loadLeaderboard:', err);
      toast.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, 'loadLeaderboard');

  useEffect(() => {
    loadLeaderboard(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = preserveFunctionName(async (tab: string) => {
    await vibrate(30);
    setActiveTab(tab);
  }, 'handleTabChange');

  // Get rank styling
  const getRankStyling = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <Crown className="w-6 h-6 text-yellow-400" />,
          bgColor: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
          borderColor: 'border-yellow-500/50'
        };
      case 2:
        return {
          icon: <Medal className="w-6 h-6 text-gray-300" />,
          bgColor: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20',
          borderColor: 'border-gray-400/50'
        };
      case 3:
        return {
          icon: <Award className="w-6 h-6 text-amber-600" />,
          bgColor: 'bg-gradient-to-r from-amber-600/20 to-amber-700/20',
          borderColor: 'border-amber-600/50'
        };
      default:
        return {
          icon: <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>,
          bgColor: 'bg-gray-800/30',
          borderColor: 'border-gray-600/30'
        };
    }
  };

  // Get tier badge
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-purple-500 text-white text-xs">Premium</Badge>;
      case 'gold':
        return <Badge className="bg-yellow-500 text-black text-xs">Gold</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400 text-black text-xs">Silver</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Free</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden p-4 space-y-6" style={{
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
      paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
      paddingRight: 'max(16px, env(safe-area-inset-right, 16px))'
    }}>
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-[#00D1FF]" />
          <h1 className="text-3xl font-bold text-white">Classifica</h1>
        </div>
        <p className="text-gray-400">
          Competi con altri agenti per salire in classifica
        </p>
      </motion.div>

      {/* Current User Rank */}
      {currentUserRank && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card bg-[#00D1FF]/10 border-[#00D1FF]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-[#00D1FF]">
                    #{currentUserRank.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-white">La tua posizione</p>
                    <p className="text-sm text-gray-400">
                      {currentUserRank.agent_code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#00D1FF]">
                    {activeTab === 'credits' && `${currentUserRank.credits} crediti`}
                    {activeTab === 'clues_unlocked' && `${currentUserRank.clues_unlocked} indizi`}
                    {activeTab === 'buzz_used' && `${currentUserRank.buzz_used} BUZZ`}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {currentUserRank.change > 0 ? (
                      <>
                        <ChevronUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">+{currentUserRank.change}</span>
                      </>
                    ) : currentUserRank.change < 0 ? (
                      <>
                        <ChevronDown className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{currentUserRank.change}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="credits" className="text-sm">
              <Target className="w-4 h-4 mr-1" />
              Crediti
            </TabsTrigger>
            <TabsTrigger value="clues_unlocked" className="text-sm">
              <Star className="w-4 h-4 mr-1" />
              Indizi
            </TabsTrigger>
            <TabsTrigger value="buzz_used" className="text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              BUZZ
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-3">
              {leaderboard.map((user, index) => {
                const rankStyle = getRankStyling(user.rank);
                const isCurrentUser = user.id === currentUserRank?.id;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`${rankStyle.bgColor} ${rankStyle.borderColor} ${
                      isCurrentUser ? 'ring-2 ring-[#00D1FF]' : ''
                    } transition-all duration-300`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Rank & User Info */}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {rankStyle.icon}
                            </div>
                            
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="bg-gray-700 text-white">
                                {user.full_name?.charAt(0) || user.agent_code?.charAt(0) || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white truncate">
                                  {user.full_name || 'Agente Anonimo'}
                                </p>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">
                                    Tu
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-400 font-mono">
                                  {user.agent_code}
                                </p>
                                {getTierBadge(user.subscription_tier)}
                              </div>
                            </div>
                          </div>

                          {/* Stats & Change */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {activeTab === 'credits' && user.credits.toLocaleString()}
                              {activeTab === 'clues_unlocked' && user.clues_unlocked}
                              {activeTab === 'buzz_used' && user.buzz_used}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {user.change > 0 ? (
                                <>
                                  <ChevronUp className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">+{user.change}</span>
                                </>
                              ) : user.change < 0 ? (
                                <>
                                  <ChevronDown className="w-3 h-3 text-red-400" />
                                  <span className="text-red-400">{user.change}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-[#00D1FF]" />
            <div className="text-lg font-bold text-white">{leaderboard.length}</div>
            <div className="text-xs text-gray-400">Agenti Attivi</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-lg font-bold text-white">
              {leaderboard[0]?.credits.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-400">Record Crediti</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-[#F059FF]" />
            <div className="text-lg font-bold text-white">
              {Math.max(...leaderboard.map(u => u.clues_unlocked), 0)}
            </div>
            <div className="text-xs text-gray-400">Max Indizi</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Update Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-4"
      >
        <p className="text-sm text-gray-500">
          La classifica si aggiorna ogni ora
        </p>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;