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

export default function BattleLobby() {
  const navigate = useSafeNavigate(); // Safe navigation compatible with embedded contexts
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [stakeType, setStakeType] = useState<'buzz' | 'clue' | 'energy'>('energy');
  const [stakePercentage, setStakePercentage] = useState<25 | 50 | 75>(25);
  const [pendingBattles, setPendingBattles] = useState<any[]>([]);
  const [myBattles, setMyBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

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
    if (!userId) return;
    setLoading(true);

    // For demo: create battle against random user (in production, select opponent)
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', userId)
      .limit(1)
      .single();

    if (!users) {
      toast({ title: 'No opponents available', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('battle-create', {
      body: {
        opponent_id: users.id,
        stake_type: stakeType,
        stake_percentage: stakePercentage,
      },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '⚔️ Battle Created!', description: `Waiting for opponent...` });
    navigate(`/battle/${data.battle_id}`);
  };

  const handleAcceptBattle = async (battleId: string) => {
    setLoading(true);

    const { error } = await supabase.functions.invoke('battle-accept', {
      body: { battle_id: battleId },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '✅ Battle Accepted!', description: 'Entering arena...' });
    navigate(`/battle/${battleId}`);
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
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Stake Type</label>
                  <Select value={stakeType} onValueChange={(v: any) => setStakeType(v)}>
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

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Stake Amount (%)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[25, 50, 75].map((pct) => (
                      <Button
                        key={pct}
                        variant={stakePercentage === pct ? 'default' : 'outline'}
                        onClick={() => setStakePercentage(pct as 25 | 50 | 75)}
                        className={stakePercentage === pct ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateBattle}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Swords className="mr-2" />
                  Create Battle
                </Button>
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
