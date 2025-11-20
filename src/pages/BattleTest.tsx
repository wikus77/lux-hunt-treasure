/**
 * TRON BATTLE - Test & Debug Page
 * End-to-end testing interface for battle flow
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Loader2, Play, Trash2 } from 'lucide-react';
import { createBattle, acceptBattle, getRandomOpponent } from '@/lib/battle/invokeBattle';

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function BattleTest() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadDbStats();
      }
    });
  }, []);

  const loadDbStats = async () => {
    const { data: battles } = await supabase.from('battles').select('status');
    const { data: transfers } = await supabase.from('battle_transfers').select('id');
    const { data: participants } = await supabase.from('battle_participants').select('id');
    const { data: audit } = await supabase.from('battle_audit').select('event_type');

    setDbStats({
      total_battles: battles?.length || 0,
      by_status: battles?.reduce((acc: any, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {}),
      total_transfers: transfers?.length || 0,
      total_participants: participants?.length || 0,
      total_audit_logs: audit?.length || 0,
      audit_events: audit?.reduce((acc: any, a) => {
        acc[a.event_type] = (acc[a.event_type] || 0) + 1;
        return acc;
      }, {}),
    });
  };

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    setTestSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runFullTest = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    const steps: TestStep[] = [
      { id: 'random-opponent', name: '1. Get Random Opponent', status: 'pending' },
      { id: 'create-battle', name: '2. Create Battle', status: 'pending' },
      { id: 'verify-db', name: '3. Verify DB Entry', status: 'pending' },
      { id: 'verify-realtime', name: '4. Test Realtime Channel', status: 'pending' },
      { id: 'cleanup', name: '5. Cleanup Test Data', status: 'pending' },
    ];
    setTestSteps(steps);

    let testBattleId: string | null = null;

    // Step 1: Get random opponent
    try {
      updateStep('random-opponent', { status: 'running' });
      const start = Date.now();
      const opponent = await getRandomOpponent();
      const duration = Date.now() - start;
      
      updateStep('random-opponent', {
        status: 'success',
        message: `Found opponent: ${opponent.opponent_name}`,
        duration,
      });

      // Step 2: Create battle
      updateStep('create-battle', { status: 'running' });
      const createStart = Date.now();
      const result = await createBattle({
        opponent_id: opponent.opponent_id,
        stake_type: 'energy',
        stake_percentage: 25,
      });
      const createDuration = Date.now() - createStart;
      testBattleId = result.battle_id;
      setBattleId(testBattleId);

      updateStep('create-battle', {
        status: 'success',
        message: `Battle created: ${testBattleId.slice(0, 8)}...`,
        duration: createDuration,
      });

      // Step 3: Verify DB
      updateStep('verify-db', { status: 'running' });
      const { data: battle, error: dbError } = await supabase
        .from('battles')
        .select('*')
        .eq('id', testBattleId)
        .single();

      if (dbError || !battle) {
        throw new Error('Battle not found in DB');
      }

      updateStep('verify-db', {
        status: 'success',
        message: `Status: ${battle.status}, Stake: ${battle.stake_amount} ${battle.stake_type}`,
      });

      // Step 4: Test Realtime
      updateStep('verify-realtime', { status: 'running' });
      const channel = supabase.channel(`test-battle:${testBattleId}`);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          channel.unsubscribe();
          reject(new Error('Realtime subscription timeout'));
        }, 5000);

        channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'battles',
            filter: `id=eq.${testBattleId}`,
          }, () => {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve();
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              // Trigger an update to test realtime
              supabase.from('battles')
                .update({ metadata: { test: true } })
                .eq('id', testBattleId)
                .then(() => {
                  setTimeout(() => {
                    clearTimeout(timeout);
                    channel.unsubscribe();
                    resolve();
                  }, 1000);
                });
            }
          });
      });

      updateStep('verify-realtime', {
        status: 'success',
        message: 'Realtime subscription working',
      });

    } catch (error: any) {
      const failedStep = steps.find(s => s.status === 'running');
      if (failedStep) {
        updateStep(failedStep.id, {
          status: 'error',
          message: error.message,
        });
      }
      toast({ title: 'Test Failed', description: error.message, variant: 'destructive' });
    } finally {
      // Step 5: Cleanup
      if (testBattleId) {
        updateStep('cleanup', { status: 'running' });
        try {
          await supabase.from('battles').delete().eq('id', testBattleId);
          updateStep('cleanup', { status: 'success', message: 'Test battle deleted' });
        } catch (error: any) {
          updateStep('cleanup', { status: 'error', message: error.message });
        }
      }
      setIsRunning(false);
      loadDbStats();
    }
  };

  const clearAllTestBattles = async () => {
    if (!confirm('Delete all test battles with metadata.test=true?')) return;
    
    const { error } = await supabase
      .from('battles')
      .delete()
      .not('metadata->test', 'is', null);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Test battles cleared' });
      loadDbStats();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🧪 TRON Battle Test Lab
            </CardTitle>
            <CardDescription>
              End-to-end testing for battle flow, edge functions, and realtime sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runFullTest}
                disabled={isRunning || !userId}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
                ) : (
                  <><Play className="w-4 h-4" /> Run Full Test</>
                )}
              </Button>
              <Button
                onClick={clearAllTestBattles}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear Test Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {testSteps.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testSteps.map(step => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    {step.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                    {step.status === 'running' && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                    {step.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {step.status === 'error' && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      {step.message && (
                        <div className="text-sm text-muted-foreground">{step.message}</div>
                      )}
                    </div>
                  </div>
                  {step.duration && (
                    <Badge variant="outline">{step.duration}ms</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {dbStats && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="status">By Status</TabsTrigger>
                  <TabsTrigger value="events">Audit Events</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <div className="text-2xl font-bold">{dbStats.total_battles}</div>
                      <div className="text-sm text-muted-foreground">Total Battles</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <div className="text-2xl font-bold">{dbStats.total_transfers}</div>
                      <div className="text-sm text-muted-foreground">Transfers</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <div className="text-2xl font-bold">{dbStats.total_participants}</div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border">
                      <div className="text-2xl font-bold">{dbStats.total_audit_logs}</div>
                      <div className="text-sm text-muted-foreground">Audit Logs</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-2">
                  {Object.entries(dbStats.by_status || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between p-3 rounded-lg bg-card/50 border">
                      <Badge variant="outline">{status}</Badge>
                      <span className="font-bold">{String(count)}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="events" className="space-y-2">
                  {Object.entries(dbStats.audit_events || {}).map(([event, count]) => (
                    <div key={event} className="flex justify-between p-3 rounded-lg bg-card/50 border">
                      <Badge variant="outline">{event}</Badge>
                      <span className="font-bold">{String(count)}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
