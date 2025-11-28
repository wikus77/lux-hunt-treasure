// @ts-nocheck
/**
 * TRON BATTLE - Battle Lobby
 * Create/Accept battles with stake selection
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { useSafeNavigate } from '@/lib/navigation/safeNavigate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeSelect } from '@/components/ui/SafeSelect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Swords, Trophy, Zap, Users, Clock, Shuffle, Crown, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { createBattle, acceptBattle, getRandomOpponent } from '@/lib/battle/invokeBattle';
import { ErrorBoundary } from '@/components/utils/ErrorBoundary';
import { Input } from '@/components/ui/input';
import { STAKE_TYPES, STAKE_PERCENTS, StakeType, StakePercent } from '@/lib/battle/constants';
import { PracticeMode } from '@/components/battle/PracticeMode';

export default function BattleLobby() {
  const navigate = useSafeNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Battle creation state with safe defaults
  const [stakeType, setStakeType] = useState<StakeType>('m1u');
  const [stakePercentage, setStakePercentage] = useState<StakePercent>(25);
  const [opponentHandle, setOpponentHandle] = useState<string>('');
  const [opponentId, setOpponentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(false);
  
  // Battle lists
  const [pendingBattles, setPendingBattles] = useState<any[]>([]);
  const [myBattles, setMyBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [topAgents, setTopAgents] = useState<any[]>([]);

  // Form validation
  const stakeValid = STAKE_TYPES.some(t => t.value === stakeType);
  const percentValid = STAKE_PERCENTS.includes(stakePercentage);
  const opponentValid = opponentHandle.trim().length > 0 || opponentId.trim().length > 0;
  const canCreate = stakeValid && percentValid && opponentValid && !submitting;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadBattles(data.user.id);
        loadStats(data.user.id);
        loadTopAgents();
      }
    });

    // Subscribe to battle updates
    const channel = supabase
      .channel('battles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battles' }, () => {
        if (userId) loadBattles(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadBattles = async (uid: string) => {
    const { data: pending } = await supabase
      .from('battles')
      .select('*, creator:profiles!battles_creator_id_fkey(agent_code), opponent:profiles!battles_opponent_id_fkey(agent_code)')
      .eq('status', 'pending')
      .eq('opponent_id', uid);

    const { data: myActive } = await supabase
      .from('battles')
      .select('*, creator:profiles!battles_creator_id_fkey(agent_code), opponent:profiles!battles_opponent_id_fkey(agent_code)')
      .or(`creator_id.eq.${uid},opponent_id.eq.${uid}`)
      .in('status', ['pending', 'accepted', 'countdown', 'active'])
      .order('created_at', { ascending: false });

    setPendingBattles(pending || []);
    setMyBattles(myActive || []);
  };

  const loadStats = async (uid: string) => {
    try {
      // Calculate stats from battles table directly
      const { data: battles } = await supabase
        .from('battles')
        .select('*')
        .or(`creator_id.eq.${uid},opponent_id.eq.${uid}`)
        .eq('status', 'resolved');

      if (battles) {
        const total = battles.length;
        const wins = battles.filter(b => b.winner_id === uid).length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        
        // Calculate reaction times
        const reactions = battles
          .map(b => b.creator_id === uid ? b.creator_reaction_ms : b.opponent_reaction_ms)
          .filter((ms): ms is number => ms !== null && ms !== undefined);
        
        const avgReaction = reactions.length > 0 
          ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
          : 0;
        const fastest = reactions.length > 0 ? Math.min(...reactions) : 0;

        setStats({
          total_battles: total,
          win_rate_percentage: winRate,
          avg_reaction_ms: avgReaction,
          fastest_reaction_ms: fastest,
        });
      }
    } catch (error) {
      console.error('⚠️ Stats calculation error:', error);
      setStats(null);
    }
  };

  const loadTopAgents = async () => {
    try {
      // Direct query using PostgreSQL function (types will be regenerated on next deploy)
      const { data, error } = await supabase.rpc('get_top_agents' as any);
      if (error) throw error;
      setTopAgents(data || []);
    } catch (error) {
      console.error('⚠️ Failed to load top agents:', error);
      setTopAgents([]);
    }
  };

  const handleRandomOpponent = async () => {
    setLoadingRandom(true);

    try {
      const opponent = await getRandomOpponent();
      
      setOpponentId(opponent.opponent_id);
      setOpponentHandle(opponent.opponent_name);

      toast({
        title: '🎲 Random Opponent Found',
        description: `Matched with ${opponent.opponent_name}`,
      });
    } catch (error: any) {
      console.error('⚠️ Random opponent error:', error?.message);
      
      toast({
        title: 'No Opponent Found',
        description: error?.message || 'Try again later',
        variant: 'destructive',
      });
    } finally {
      setLoadingRandom(false);
    }
  };

  const handleSelectTopAgent = (agent: any) => {
    setOpponentId(agent.id);
    setOpponentHandle(agent.username || agent.agent_code);
    
    toast({
      title: '👑 Top Agent Selected',
      description: `Challenge ${agent.username || agent.agent_code}`,
    });
  };

  const handleCreateBattle = async () => {
    if (!canCreate || !userId) return;

    setSubmitting(true);

    try {
      const payload: any = {
        stake_type: stakeType,
        stake_percentage: stakePercentage,
      };

      // Prefer opponent_id if available, fallback to opponent_handle
      if (opponentId) {
        payload.opponent_id = opponentId;
      } else {
        payload.opponent_handle = opponentHandle.trim();
      }

      const result = await createBattle(payload);

      toast({
        title: '⚔️ Battle Created!',
        description: `Arena: ${result.arena_name} | Stake: ${result.stake_amount} ${stakeType}`,
      });

      // Reset form
      setOpponentHandle('');
      setOpponentId('');
      
      // Navigate to arena or refresh battles list
      if (result.battle_id) {
        navigate(`/battle/${result.battle_id}`);
      } else {
        loadBattles(userId);
      }
    } catch (error: any) {
      console.error('⚠️ Battle creation error:', error);
      
      // Parse error code and hint from backend
      let errorMsg = 'Unknown error occurred';
      if (error?.message) {
        // Extract error_code and hint from message if present
        const match = error.message.match(/([A-Z_]+)\s*\[(\d+)\]:\s*(.+)/);
        if (match) {
          errorMsg = `${match[1]}: ${match[3]}`;
        } else {
          errorMsg = error.message;
        }
      }
      
      toast({
        title: 'Battle Creation Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBattle = async (battleId: string) => {
    setLoading(true);

    try {
      await acceptBattle(battleId);

      toast({
        title: '✅ Battle Accepted!',
        description: 'Entering arena...',
      });

      navigate(`/battle/${battleId}`);
    } catch (error: any) {
      console.error('⚠️ Battle accept error:', error?.message);
      
      toast({
        title: 'Accept Failed',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

        {/* Stats Overview */}
        {stats && (
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
                  <p className="text-xl font-bold text-white">{stats.win_rate_percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Battles</p>
                  <p className="text-xl font-bold text-white">{stats.total_battles}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Avg Reaction</p>
                  <p className="text-xl font-bold text-cyan-400">{stats.avg_reaction_ms}ms</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Fastest</p>
                  <p className="text-xl font-bold text-green-400">{stats.fastest_reaction_ms}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="practice" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="practice" className="gap-1">
              <Target className="w-3 h-3" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="top">
              <Crown className="w-3 h-3 mr-1" />
              Top
            </TabsTrigger>
            <TabsTrigger value="pending">
              ({pendingBattles.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              ({myBattles.length})
            </TabsTrigger>
          </TabsList>

          {/* Practice Mode - Train against AI */}
          <TabsContent value="practice">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5" />
                  Training Arena
                </CardTitle>
                <CardDescription className="text-sm">
                  Practice your reaction time against AI opponents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userId && <PracticeMode userId={userId} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Battle */}
          <TabsContent value="create">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-lg">Create New Battle</CardTitle>
                <CardDescription className="text-sm">Challenge an opponent with your stake</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorBoundary>
                  {/* Opponent Selector with Random Button */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Opponent Handle or Agent Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., AGENT-001 or @username"
                        className="bg-gray-700 border-cyan-500/30 text-white placeholder:text-gray-500 flex-1"
                        value={opponentHandle}
                        onChange={(e) => {
                          setOpponentHandle(e.target.value);
                          setOpponentId(''); // Clear ID when typing manually
                        }}
                        disabled={submitting || loadingRandom}
                      />
                      <Button
                        onClick={handleRandomOpponent}
                        disabled={loadingRandom || submitting}
                        variant="outline"
                        className="bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/40"
                      >
                        <Shuffle className="w-4 h-4 mr-1" />
                        Random
                      </Button>
                    </div>
                  </div>

                  {/* Stake Type */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Stake Type</label>
                    <SafeSelect 
                      value={stakeType} 
                      onChange={setStakeType}
                      disabled={submitting || loadingRandom}
                    />
                  </div>

                  {/* Stake Percentage */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Stake Amount (%)</label>
                    <div className="grid grid-cols-3 gap-3">
                      {STAKE_PERCENTS.map((pct) => (
                        <Button
                          key={pct}
                          variant={stakePercentage === pct ? 'default' : 'outline'}
                          onClick={() => setStakePercentage(pct)}
                          disabled={submitting}
                          className={stakePercentage === pct ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Create Button */}
                  <Button
                    onClick={handleCreateBattle}
                    disabled={!canCreate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Swords className="mr-2" />
                    {submitting ? 'Creating Battle...' : 'Create Battle'}
                  </Button>

                  {/* Validation hints */}
                  {!canCreate && !submitting && (
                    <p className="text-xs text-gray-500 text-center">
                      {!opponentValid && 'Enter opponent or pick random • '}
                      {!stakeValid && 'Select stake type • '}
                      {!percentValid && 'Select stake percentage'}
                    </p>
                  )}
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Agents */}
          <TabsContent value="top">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2 text-lg">
                  <Crown className="w-5 h-5" />
                  Top Agents
                </CardTitle>
                <CardDescription className="text-sm">Challenge the best players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topAgents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No rankings yet</p>
                    </div>
                  ) : (
                    topAgents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-600/30 hover:border-yellow-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {agent.username || agent.agent_code || 'Agent'}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {agent.wins} wins • ELO {agent.elo}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSelectTopAgent(agent)}
                          size="sm"
                          variant="outline"
                          className="bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/40 text-yellow-400"
                        >
                          Challenge
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Challenges */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingBattles.length === 0 ? (
                <Card className="bg-gray-800/50 border-cyan-500/30">
                  <CardContent className="py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No pending challenges
                  </CardContent>
                </Card>
              ) : (
                pendingBattles.map((battle) => (
                  <Card key={battle.id} className="bg-gray-800/50 border-cyan-500/30">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">
                            Challenge from {battle.creator?.agent_code || 'Unknown'}
                          </p>
                          <p className="text-cyan-400 text-sm">
                            Stake: {battle.stake_amount} {battle.stake_type} ({battle.stake_percentage}%)
                          </p>
                          {battle.arena_name && (
                            <p className="text-gray-400 text-xs">{battle.arena_name}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAcceptBattle(battle.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Zap className="mr-2 w-4 h-4" />
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Battles */}
          <TabsContent value="active">
            <div className="space-y-4">
              {myBattles.length === 0 ? (
                <Card className="bg-gray-800/50 border-cyan-500/30">
                  <CardContent className="py-12 text-center text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No active battles
                  </CardContent>
                </Card>
              ) : (
                myBattles.map((battle) => (
                  <Card key={battle.id} className="bg-gray-800/50 border-cyan-500/30">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">
                            {battle.creator_id === userId ? 'vs ' + (battle.opponent?.agent_code || 'Opponent') : 'vs ' + (battle.creator?.agent_code || 'Creator')}
                          </p>
                          <p className="text-cyan-400 text-sm capitalize">
                            Status: {battle.status}
                          </p>
                        </div>
                        <Button
                          onClick={() => navigate(`/battle/${battle.id}`)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Enter Arena
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
