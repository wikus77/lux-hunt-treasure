/**
 * The Pulse™ — Admin Pulse Lab (Sandbox Test Page)
 * Admin-only page to test ritual orchestration in isolated sandbox
 * Does NOT affect production pulse_state
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRitualChannel } from '@/features/pulse/ritual';
import { RitualOrchestrator } from '@/features/pulse/ritual/RitualOrchestrator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Sparkles, RotateCcw, PlayCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAILS = [
  'joseph@m1ssion.io',
  'wikus77@hotmail.it'
];

export default function PulseLab() {
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [mockValue, setMockValue] = useState(45);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFiring, setIsFiring] = useState(false);

  // Listen to test channel
  const { phase, ritualId, isConnected } = useRitualChannel({ mode: 'test' });

  // Check authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setAuthStatus('denied');
          return;
        }

        // Check if user email is in admin whitelist
        const isAdmin = ADMIN_EMAILS.includes(user.email || '');
        
        if (!isAdmin) {
          setAuthStatus('denied');
          setUserEmail(user.email || 'unknown');
          return;
        }

        setAuthStatus('authorized');
        setUserEmail(user.email || '');
        addLog(`✅ Authorized: ${user.email}`);
      } catch (error) {
        console.error('[PulseLab] Auth check error:', error);
        setAuthStatus('denied');
      }
    };

    checkAuth();
  }, []);

  // Log phase changes
  useEffect(() => {
    if (phase !== 'idle') {
      addLog(`🌟 Phase: ${phase} (ritual_id: ${ritualId})`);
    }
  }, [phase, ritualId]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const handleSimulate100 = () => {
    setMockValue(100);
    addLog('🎯 Pulse simulated at 100%');
  };

  const handlePingEdge = async () => {
    addLog('🏓 Pinging edge function...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session - please refresh');
      }
      
      addLog(`🔑 Using bearer token: ${session.access_token.substring(0, 20)}...`);
      
      const { data, error } = await supabase.functions.invoke('ritual-test-fire', {
        body: { mode: 'ping' }
      });
      
      if (error) throw error;
      
      addLog(`✅ Ping successful: ${JSON.stringify(data)}`);
      toast({ 
        title: "Edge Function Online",
        description: `Connected as ${userEmail}` 
      });
    } catch (error: any) {
      const hint = error.message || 'Unknown error';
      addLog(`❌ Ping failed: ${hint}`);
      toast({ 
        title: "Edge Function Error",
        description: hint,
        variant: "destructive"
      });
    }
  };

  const handleFireRitual = async () => {
    setIsFiring(true);
    addLog('🚀 Firing test ritual...');
    
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      addLog('❌ No active session - please refresh page');
      toast({ 
        title: "Session Required",
        description: "Please refresh the page to restore your session",
        variant: "destructive"
      });
      setIsFiring(false);
      return;
    }
    
    addLog(`🔑 Authenticated as: ${userEmail}`);
    
    let attempt = 0;
    const maxAttempts = 2;
    
    while (attempt < maxAttempts) {
      try {
        attempt++;
        
        const { data, error } = await supabase.functions.invoke('ritual-test-fire', {
          body: { 
            mode: 'start',
            channel: 'pulse:ritual:test' 
          }
        });
        
        if (error) {
          addLog(`❌ Invocation error (attempt ${attempt}/${maxAttempts}): ${error.message}`);
          
          if (attempt < maxAttempts) {
            const backoff = Math.pow(2, attempt) * 1000;
            addLog(`⏳ Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }
          
          throw error;
        }
        
        if (!data?.ok) {
          const code = data?.code || 'unknown';
          const hint = data?.hint || 'No details provided';
          const details = data?.details ? ` (${data.details})` : '';
          addLog(`❌ Server error [${code}]: ${hint}${details}`);
          
          if (code === 'FORBIDDEN' || code === 'forbidden') {
            toast({ 
              title: "Access Denied",
              description: `Admin whitelist required. Your email: ${data?.user_email || userEmail}`,
              variant: "destructive"
            });
          } else if (code === 'auth') {
            toast({ 
              title: "Authentication Error",
              description: hint,
              variant: "destructive"
            });
          } else {
            toast({ 
              title: "Edge Function Error",
              description: hint,
              variant: "destructive"
            });
          }
          
          setIsFiring(false);
          return;
        }
        
        addLog(`✅ Test ritual fired successfully`);
        addLog(`📊 Ritual ID: ${data.test_ritual_id}`);
        addLog(`📡 Phases: ${data.phases?.length || 0}`);
        
        toast({ 
          title: "Ritual Started",
          description: "Watch for phase broadcasts in the log below" 
        });
        
        setIsFiring(false);
        return;
        
      } catch (error: any) {
        const hint = error.message?.includes('aborted') 
          ? 'Timeout after 10s — edge function might be cold-starting'
          : error.message || 'Unknown error';
        
        addLog(`❌ Fatal error (attempt ${attempt}/${maxAttempts}): ${hint}`);
        
        if (attempt < maxAttempts) {
          const backoff = Math.pow(2, attempt) * 1000;
          addLog(`⏳ Retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
        } else {
          toast({ 
            title: "Ritual Failed",
            description: "Check logs and Edge Function status",
            variant: "destructive"
          });
        }
      }
    }
    
    setIsFiring(false);
  };

  const handleReset = () => {
    setMockValue(45);
    setLogs([]);
    addLog('🔄 Lab reset');
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Authorizing...</div>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Admin Pulse Lab — Restricted Area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You do not have permission to access this page.
            </p>
            {userEmail && (
              <p className="text-xs text-muted-foreground font-mono">
                Current user: {userEmail}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This area is restricted to authorized M1SSION™ administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-safe">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-technovier font-bold text-foreground">
            Admin Pulse Lab
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Isolated sandbox for testing The Pulse™ ritual orchestration
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
        {/* Mock Pulse Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Mock Pulse State
            </CardTitle>
            <CardDescription>
              Simulated pulse value (sandbox only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mock Bar */}
            <div className="relative w-full h-[14px] rounded-full overflow-hidden bg-card border border-border">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary"
                style={{ width: `${mockValue}%` }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>

            {/* Value Display */}
            <div className="text-center">
              <span className="text-3xl font-technovier font-bold text-foreground">
                {mockValue}%
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                onClick={handleSimulate100}
                className="flex-1"
                variant="default"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Simula 100%
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ritual Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" />
              Ritual Controls
            </CardTitle>
            <CardDescription>
              Test channel: pulse:ritual:test • Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Phase */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="text-xs text-muted-foreground mb-1">Current Phase</div>
              <div className="text-lg font-technovier font-bold text-foreground">
                {phase.toUpperCase()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handlePingEdge}
                variant="outline"
                className="w-full"
              >
                <Activity className="w-4 h-4 mr-2" />
                Ping Edge
              </Button>
              <Button
                onClick={handleFireRitual}
                disabled={isFiring}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isFiring ? 'Firing...' : 'Avvia Ritual'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Triggers complete ritual sequence on test channel. Safe, no DB writes to production.
            </p>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>
              Real-time ritual events from test channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card border border-border rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-muted-foreground">No events yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-foreground mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render Test Orchestrator */}
      <RitualOrchestrator 
        phase={phase} 
        ritualId={ritualId}
        mode="test"
      />
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
