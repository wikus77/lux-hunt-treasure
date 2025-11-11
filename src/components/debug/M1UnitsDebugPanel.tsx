/**
 * M1 UNITS™ Debug Panel — Realtime Smoke Test
 * Developer-only tool for testing M1 Units Realtime subscriptions
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { useM1UnitsRealtime, type M1UnitsConnectionState } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CONNECTION_STATE_COLORS: Record<M1UnitsConnectionState, string> = {
  INIT: 'bg-gray-500',
  CONNECTING: 'bg-yellow-500',
  SUBSCRIBED: 'bg-green-500',
  HEARTBEAT: 'bg-blue-500 animate-pulse',
  ERROR: 'bg-red-500',
  CLOSED: 'bg-gray-700',
};

const CONNECTION_STATE_LABELS: Record<M1UnitsConnectionState, string> = {
  INIT: 'Initializing',
  CONNECTING: 'Connecting...',
  SUBSCRIBED: 'Connected',
  HEARTBEAT: 'Heartbeat ♥',
  ERROR: 'Error',
  CLOSED: 'Disconnected',
};

export const M1UnitsDebugPanel = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  // Check if dev mode enabled
  useEffect(() => {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
    const devAccess = localStorage.getItem('developer_access') === 'true';
    setShowPanel(isDev || devAccess);
  }, []);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        addLog(`User ID: ${data.user.id}`);
      } else {
        addLog('No authenticated user');
      }
    };
    getUser();
  }, []);

  const { unitsData, connectionState, isLoading, error, ping, refetch } = useM1UnitsRealtime(userId);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  // Log connection state changes
  useEffect(() => {
    if (connectionState !== 'INIT') {
      addLog(`Connection: ${CONNECTION_STATE_LABELS[connectionState]}`);
    }
  }, [connectionState]);

  // Log data updates
  useEffect(() => {
    if (unitsData) {
      addLog(`Balance updated: ${unitsData.balance} M1U`);
    }
  }, [unitsData?.balance]);

  // Log errors
  useEffect(() => {
    if (error) {
      addLog(`❌ Error: ${error.message}`);
    }
  }, [error]);

  const handlePing = async () => {
    addLog('🏓 Sending ping...');
    await ping();
  };

  const handleFakeUpdate = async () => {
    if (!userId) return;
    addLog('🎭 Triggering fake update...');
    
    // Trigger a database update (increment balance by 1, just for testing)
    const { error: updateError } = await (supabase as any)
      .from('user_m1_units')
      .update({ 
        balance: (unitsData?.balance || 0) + 1,
        total_earned: (unitsData?.total_earned || 0) + 1,
      })
      .eq('user_id', userId);

    if (updateError) {
      addLog(`❌ Fake update failed: ${updateError.message}`);
    } else {
      addLog('✅ Fake update sent (check realtime pill)');
    }
  };

  const handleRefetch = async () => {
    addLog('🔄 Refetching data...');
    await refetch();
  };

  if (!showPanel) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <Card className="bg-black/90 border-cyan-500/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 text-sm font-mono flex items-center justify-between">
            M1U DEBUG PANEL
            <Badge className={CONNECTION_STATE_COLORS[connectionState]}>
              {CONNECTION_STATE_LABELS[connectionState]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Balance Display */}
          <div className="bg-cyan-950/30 p-3 rounded border border-cyan-500/30">
            <div className="text-xs text-cyan-300/70 mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-cyan-400">
              {isLoading ? '...' : unitsData ? `${unitsData.balance} M1U` : 'No data'}
            </div>
            {unitsData && (
              <div className="text-xs text-cyan-300/50 mt-1">
                Earned: {unitsData.total_earned} | Spent: {unitsData.total_spent}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handlePing}
              disabled={!userId || connectionState === 'ERROR'}
              size="sm"
              variant="outline"
              className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30"
            >
              Ping
            </Button>
            <Button 
              onClick={handleFakeUpdate}
              disabled={!userId || connectionState === 'ERROR'}
              size="sm"
              variant="outline"
              className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-950/30"
            >
              Fake Update
            </Button>
            <Button 
              onClick={handleRefetch}
              disabled={!userId}
              size="sm"
              variant="outline"
              className="flex-1 border-gray-500/50 text-gray-400 hover:bg-gray-950/30"
            >
              Refetch
            </Button>
          </div>

          {/* Console Logs */}
          <div className="bg-black/50 p-2 rounded border border-cyan-500/20 max-h-40 overflow-y-auto">
            <div className="text-xs text-cyan-300/70 mb-1">Console Log</div>
            <div className="space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">Waiting for events...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-cyan-300/80">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Channel Info */}
          <div className="text-xs text-cyan-300/50 text-center font-mono">
            {userId ? `Channel: m1_units_user_${userId.slice(0, 8)}...` : 'Not authenticated'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
