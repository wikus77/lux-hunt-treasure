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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Swords, Trophy, Zap, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { createBattle, acceptBattle } from '@/lib/battle/invokeBattle';
import { ErrorBoundary } from '@/components/utils/ErrorBoundary';
import { Input } from '@/components/ui/input';

// Safe stake options with type guard
const STAKE_OPTIONS = ['energy', 'buzz', 'clue'] as const;
type StakeType = typeof STAKE_OPTIONS[number];
const STAKE_PERCENTAGES = [25, 50, 75] as const;
type StakePercentage = typeof STAKE_PERCENTAGES[number];

export default function BattleLobby() {
  const navigate = useSafeNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Battle creation state with safe defaults
  const [stakeType, setStakeType] = useState<StakeType>('energy');
  const [stakePercentage, setStakePercentage] = useState<StakePercentage>(25);
  const [opponentHandle, setOpponentHandle] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Battle lists
  const [pendingBattles, setPendingBattles] = useState<any[]>([]);
  const [myBattles, setMyBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Form validation
  const stakeValid = STAKE_OPTIONS.includes(stakeType);
  const percentValid = STAKE_PERCENTAGES.includes(stakePercentage);
  const opponentValid = opponentHandle.trim().length > 0;
  const canCreate = stakeValid && percentValid && opponentValid && !submitting;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadBattles(data.user.id);
        loadStats(data.user.id);
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
    const { data } = await supabase
      .from('battle_metrics')
      .select('*')
      .eq('user_id', uid)
      .single();

    setStats(data);
  };

  const handleCreateBattle = async () => {
    if (!canCreate || !userId) return;

    setSubmitting(true);

    try {
      const payload = {
        opponent_handle: opponentHandle.trim(),
        stake_type: stakeType,
        stake_percentage: stakePercentage,
      };

      const result = await createBattle(payload);

      toast({
        title: '⚔️ Battle Created!',
        description: `Arena: ${result.arena_name} | Stake: ${result.stake_amount} ${stakeType}`,
      });

      // Reset form
      setOpponentHandle('');
      
      // Navigate to arena or refresh battles list
      if (result.battle_id) {
        navigate(`/battle/${result.battle_id}`);
      } else {
        loadBattles(userId);
      }
    } catch (error: any) {
      console.error('⚠️ Battle creation error:', error?.message);
      
      // Surface explicit backend errors
      toast({
        title: 'Battle Creation Failed',
        description: error?.message || 'Unknown error occurred',
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

  // Safe stake type change handler with guard rail
  const handleStakeTypeChange = (value: string) => {
    try {
      if (!value || !STAKE_OPTIONS.includes(value as StakeType)) {
        console.warn('⚠️ Invalid stake type:', value);
        return;
      }
      setStakeType(value as StakeType);
    } catch (error) {
      console.error('⚠️ Stake type change error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            TRON BATTLE ARENA
          </h1>
          <p className="text-cyan-400 text-lg">Enter the grid. Test your reaction.</p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <Card className="bg-gray-800/50 border-cyan-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.win_rate_percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Battles</p>
                  <p className="text-2xl font-bold text-white">{stats.total_battles}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Avg Reaction</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats.avg_reaction_ms}ms</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Fastest</p>
                  <p className="text-2xl font-bold text-green-400">{stats.fastest_reaction_ms}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="create">Create Battle</TabsTrigger>
            <TabsTrigger value="pending">
              Challenges ({pendingBattles.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({myBattles.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Battle */}
          <TabsContent value="create">
            <Card className="bg-gray-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">Create New Battle</CardTitle>
                <CardDescription>Challenge an opponent with your stake</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ErrorBoundary>
                  {/* Opponent Selector */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Opponent Handle or Agent Code
                    </label>
                    <Input
                      placeholder="e.g., AGENT-001 or @username"
                      className="bg-gray-700 border-cyan-500/30 text-white placeholder:text-gray-500"
                      value={opponentHandle}
                      onChange={(e) => setOpponentHandle(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {/* Stake Type */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Stake Type</label>
                    <Select value={stakeType} onValueChange={handleStakeTypeChange}>
                      <SelectTrigger className="bg-gray-700 border-cyan-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energy">⚡ Energy Fragments</SelectItem>
                        <SelectItem value="buzz">📡 Buzz Points</SelectItem>
                        <SelectItem value="clue">🔍 Clues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stake Percentage */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Stake Amount (%)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {STAKE_PERCENTAGES.map((pct) => (
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
                      {!opponentValid && 'Enter opponent handle • '}
                      {!stakeValid && 'Select stake type • '}
                      {!percentValid && 'Select stake percentage'}
                    </p>
                  )}
                </ErrorBoundary>
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
