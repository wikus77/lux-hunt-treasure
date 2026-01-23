// © 2025 Joseph MULÉ – M1SSION™ - Native Push Diagnostic Panel
// Diagnostic UI for verifying native push notifications

import React, { useState, useEffect } from 'react';
import { useNativePush } from '@/hooks/useNativePush';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  RefreshCw, 
  Send, 
  Copy, 
  Database,
  Smartphone,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticRow {
  label: string;
  value: string | React.ReactNode;
  status: 'ok' | 'warning' | 'error' | 'neutral';
}

export const NativePushDiagnostic: React.FC = () => {
  const {
    state,
    isNative,
    platform,
    isInitialized,
    isRegistered,
    hasPermission,
    requestPermission,
    sendTest,
    checkDatabaseToken,
    refresh,
    isLoading,
    error,
  } = useNativePush();

  const [dbToken, setDbToken] = useState<any>(null);
  const [dbChecking, setDbChecking] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Check database token on mount and after registration
  useEffect(() => {
    if (isInitialized && state.token) {
      checkDb();
    }
  }, [isInitialized, state.token]);

  const checkDb = async () => {
    setDbChecking(true);
    const result = await checkDatabaseToken();
    setDbToken(result);
    setDbChecking(false);
  };

  const handleSendTest = async () => {
    const result = await sendTest();
    setTestResult(result);
  };

  const copyToken = () => {
    if (state.token) {
      navigator.clipboard.writeText(state.token);
      toast.success('Token copied!');
    }
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'error' | 'neutral') => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Check className="w-3 h-3 mr-1" />OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" />WARN</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><X className="w-3 h-3 mr-1" />FAIL</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">—</Badge>;
    }
  };

  const diagnostics: DiagnosticRow[] = [
    {
      label: 'Environment',
      value: isNative ? `Native (${platform.toUpperCase()})` : 'Web/PWA',
      status: isNative ? 'ok' : 'warning',
    },
    {
      label: 'Platform',
      value: platform.toUpperCase(),
      status: platform === 'ios' ? 'ok' : platform === 'android' ? 'ok' : 'neutral',
    },
    {
      label: 'Initialized',
      value: isInitialized ? 'Yes' : 'No',
      status: isInitialized ? 'ok' : 'error',
    },
    {
      label: 'Permission',
      value: state.permission || 'Unknown',
      status: state.permission === 'granted' ? 'ok' : state.permission === 'denied' ? 'error' : 'warning',
    },
    {
      label: 'Token',
      value: state.token 
        ? (
          <span className="flex items-center gap-2">
            <code className="text-xs bg-black/20 px-2 py-1 rounded">
              {state.token.substring(0, 20)}...
            </code>
            <button onClick={copyToken} className="p-1 hover:bg-white/10 rounded">
              <Copy className="w-3 h-3" />
            </button>
          </span>
        )
        : 'Not registered',
      status: state.token ? 'ok' : 'error',
    },
    {
      label: 'Token in DB',
      value: dbChecking 
        ? 'Checking...' 
        : dbToken?.exists 
          ? 'Yes ✓' 
          : 'No',
      status: dbToken?.exists ? 'ok' : 'error',
    },
    {
      label: 'Last Received',
      value: state.lastReceived 
        ? state.lastReceived.toLocaleTimeString() 
        : 'Never',
      status: state.lastReceived ? 'ok' : 'neutral',
    },
    {
      label: 'Last Error',
      value: state.lastError || 'None',
      status: state.lastError ? 'error' : 'ok',
    },
    // 🛡️ HARDENING: Show last push result details
    ...(state.lastPushResult ? [
      {
        label: 'Last Push Status',
        value: state.lastPushResult.success 
          ? `✅ ${state.lastPushResult.status || 200}` 
          : `❌ ${state.lastPushResult.error || 'Failed'}`,
        status: state.lastPushResult.success ? 'ok' as const : 'error' as const,
      },
      {
        label: 'APNs Environment',
        value: state.lastPushResult.apns_env || 'Unknown',
        status: 'neutral' as const,
      },
      {
        label: 'APNs ID',
        value: state.lastPushResult.apns_id 
          ? state.lastPushResult.apns_id.substring(0, 16) + '...'
          : 'N/A',
        status: state.lastPushResult.apns_id ? 'ok' as const : 'neutral' as const,
      },
    ] : []),
  ];

  // Non-native warning
  if (!isNative) {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            Push Diagnostics (Web Mode)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-yellow-300/80 mb-3">
            Native push notifications require the Capacitor iOS/Android app.
            You're currently running in web/PWA mode.
          </p>
          <div className="text-xs space-y-1 text-white/60">
            <p>Platform: <code className="bg-black/20 px-1">{platform}</code></p>
            <p>Native: <code className="bg-black/20 px-1">{String(isNative)}</code></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Native Push Diagnostics
          <Badge variant="outline" className="ml-auto text-xs">
            {platform.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="space-y-2">
          {diagnostics.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
              <span className="text-white/60">{row.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-white/90">{row.value}</span>
                {getStatusBadge(row.status)}
              </span>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`border rounded p-2 text-xs ${testResult.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <strong>{testResult.success ? '✅ Test Sent' : '❌ Test Failed'}:</strong>
            <pre className="mt-1 text-[10px] overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Request Permission / Register Token */}
          {!hasPermission ? (
            <Button
              size="sm"
              variant="default"
              onClick={requestPermission}
              disabled={isLoading}
              className="text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Request Permission
            </Button>
          ) : (
            /* 🔧 FIX: Always allow manual registration when permission granted but no token */
            <Button
              size="sm"
              variant={state.token ? "outline" : "default"}
              onClick={requestPermission}
              disabled={isLoading}
              className="text-xs"
            >
              <Bell className="w-3 h-3 mr-1" />
              {state.token ? 'Re-register Token' : 'Register Token'}
            </Button>
          )}

          {/* Refresh Status */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => { refresh(); checkDb(); }}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Check DB */}
          <Button
            size="sm"
            variant="outline"
            onClick={checkDb}
            disabled={dbChecking}
            className="text-xs"
          >
            <Database className={`w-3 h-3 mr-1 ${dbChecking ? 'animate-pulse' : ''}`} />
            Check DB
          </Button>

          {/* Send Test Push */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendTest}
            disabled={isLoading || !isRegistered}
            className="text-xs"
          >
            <Send className="w-3 h-3 mr-1" />
            Send Test Push
          </Button>
        </div>

        {/* Instructions */}
        {!isRegistered && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-xs text-blue-300">
            <strong>To enable push notifications:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              {!hasPermission && <li>Tap "Request Permission"</li>}
              {!hasPermission && <li>Allow notifications when prompted</li>}
              {hasPermission && !state.token && <li>Tap "Register Token" to get APNs token</li>}
              <li>Token will be registered and saved to DB</li>
              <li>Use "Send Test Push" to verify</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
