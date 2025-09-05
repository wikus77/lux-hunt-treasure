// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// BREAK-GLASS MODE: Push diagnostics page (dev/preview only)

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  enablePushNotifications, 
  getNotificationStatus, 
  getUserFCMTokens, 
  regenerateFCMToken,
  testNotification 
} from '@/features/notifications/enablePush';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  TestTube, 
  Smartphone, 
  Monitor,
  Wifi,
  Database
} from 'lucide-react';

interface PushLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
}

interface DiagnosticState {
  permissions: NotificationPermission;
  isStandalone: boolean;
  platform: string;
  swVersion: string | null;
  swState: string;
  tokenCount: number;
  lastToken: string | null;
  logs: PushLog[];
}

export default function PushDiagnostic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<DiagnosticState>({
    permissions: 'default',
    isStandalone: false,
    platform: 'unknown',
    swVersion: null,
    swState: 'unknown',
    tokenCount: 0,
    lastToken: null,
    logs: []
  });
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);

  // Collect push logs from console
  const collectPushLogs = () => {
    const logs: PushLog[] = [];
    
    // Override console.debug to capture [PUSH] logs
    const originalDebug = console.debug;
    console.debug = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('[PUSH]')) {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'debug',
          message
        });
      }
      originalDebug.apply(console, args);
    };

    return logs;
  };

  // Update diagnostic state
  const updateDiagnosticState = async () => {
    const status = getNotificationStatus();
    const swRegistration = await navigator.serviceWorker?.getRegistration('/');
    
    let userTokens: any[] = [];
    if (user) {
      userTokens = await getUserFCMTokens(user.id);
    }
    
    setState(prev => ({
      ...prev,
      permissions: status.permission,
      isStandalone: status.platform === 'ios' && window.matchMedia('(display-mode: standalone)').matches,
      platform: status.platform,
      swVersion: swRegistration?.active?.scriptURL?.split('?')[1] || null,
      swState: swRegistration?.active?.state || 'none',
      tokenCount: userTokens.length,
      lastToken: userTokens[0]?.token || null
    }));
    
    setTokens(userTokens);
  };

  useEffect(() => {
    updateDiagnosticState();
    const interval = setInterval(updateDiagnosticState, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleTogglePush = async () => {
    if (!user) {
      toast({
        title: "❌ Error",
        description: "Serve login per testare push",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await enablePushNotifications();
      
      if (result.success) {
        toast({
          title: "✅ Push Enabled",
          description: "Token generato con successo!",
        });
      } else {
        toast({
          title: "❌ Push Failed",
          description: result.error || "Errore sconosciuto",
          variant: "destructive"
        });
      }
      
      await updateDiagnosticState();
    } catch (error: any) {
      toast({
        title: "❌ Exception",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    setLoading(true);
    try {
      const newToken = await regenerateFCMToken();
      
      if (newToken) {
        toast({
          title: "🔄 Token Regenerated",
          description: "Nuovo token FCM creato",
        });
      } else {
        toast({
          title: "❌ Regeneration Failed",
          description: "Impossibile rigenerare token",
          variant: "destructive"
        });
      }
      
      await updateDiagnosticState();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (tokens.length === 0) {
      toast({
        title: "❌ No Token",
        description: "Nessun token FCM disponibile",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await testNotification(tokens[0].token);
      
      if (result.success) {
        toast({
          title: "🧪 Test Sent",
          description: "Notifica di test inviata!",
        });
      } else {
        toast({
          title: "❌ Test Failed",
          description: result.error || "Test fallito",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getPermissionColor = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return 'default';
      case 'denied': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold">Push Diagnostics</h1>
        <Badge variant="outline">DEBUG MODE</Badge>
      </div>

      {!user && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Login required for full diagnostics</p>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <span>Permissions:</span>
              <Badge variant={getPermissionColor(state.permissions)}>
                {state.permissions}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Platform:</span>
              <Badge variant="outline">{state.platform}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Standalone:</span>
              {getStatusIcon(state.isStandalone)}
            </div>
            
            <div className="flex items-center justify-between">
              <span>SW State:</span>
              <Badge variant={state.swState === 'activated' ? 'default' : 'secondary'}>
                {state.swState}
              </Badge>
            </div>
          </div>
          
          {state.swVersion && (
            <div className="text-sm text-muted-foreground">
              <strong>SW Version:</strong> {state.swVersion}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleTogglePush}
              disabled={loading || !user}
              className="flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              {loading ? 'Enabling...' : 'Enable Push'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRegenerateToken}
              disabled={loading || tokens.length === 0}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {loading ? 'Regenerating...' : 'Regenerate Token'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTestNotification}
              disabled={loading || tokens.length === 0}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {loading ? 'Testing...' : 'Test Notification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            FCM Tokens ({state.tokenCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-muted-foreground">No active tokens found</p>
          ) : (
            <div className="space-y-3">
              {tokens.map((token, index) => (
                <div key={token.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{token.platform}</Badge>
                    <Badge variant={token.is_active ? 'default' : 'secondary'}>
                      {token.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Token:</span> 
                      <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                        {token.token.substring(0, 12)}...{token.token.slice(-8)}
                      </code>
                    </div>
                    
                    <div>
                      <span className="font-medium">Created:</span> 
                      <span className="ml-2">{new Date(token.created_at).toLocaleString()}</span>
                    </div>
                    
                    {token.device_info?.timestamp && (
                      <div>
                        <span className="font-medium">Last sync:</span> 
                        <span className="ml-2">{new Date(token.device_info.timestamp).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Push Logs (last 200)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-mono bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-muted-foreground">
              Check browser console for [PUSH] logs...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              To see detailed logs, open DevTools Console and look for [PUSH] entries
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}