// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// FCM Token Manager - Gestione Completa Token FCM

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, isFCMSupported, runFCMDiagnostics } from '@/lib/firebase-real';
import { CheckCircle, XCircle, AlertTriangle, Zap, Copy, RefreshCw, Bug } from 'lucide-react';

interface TokenData {
  token: string | null;
  user: any;
  generated_at: string;
  permission: NotificationPermission;
  diagnostics: any;
}

export const FCMTokenManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [dbTokens, setDbTokens] = useState<any[]>([]);

  // Load existing tokens on mount
  useEffect(() => {
    loadExistingTokens();
  }, []);

  const loadExistingTokens = async () => {
    try {
      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setDbTokens(tokens || []);
    } catch (error) {
      console.error('❌ Error loading tokens:', error);
    }
  };

  const generateToken = async () => {
    setIsGenerating(true);
    
    try {
      // Step 1: Check support
      if (!isFCMSupported()) {
        toast.error('❌ FCM non supportato in questo browser');
        return;
      }

      // Step 2: Get authenticated user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('❌ Utente non autenticato - Login richiesto');
        return;
      }

      // Step 3: Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('❌ Permessi notifiche negati');
        return;
      }

      // Step 4: Generate FCM token
      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        toast.error('❌ Impossibile generare token FCM');
        return;
      }

      // Step 5: Run diagnostics
      const diagnostics = await runFCMDiagnostics();

      // Step 6: Save to database with cleanup
      try {
        // Deactivate old tokens
        await supabase
          .from('user_push_tokens')
          .update({ is_active: false })
          .eq('user_id', currentUser.id);

        // Insert new token
        const { error } = await supabase
          .from('user_push_tokens')
          .insert({
            user_id: currentUser.id,
            fcm_token: fcmToken,
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              timestamp: new Date().toISOString(),
              tokenManager: true,
              diagnostics: diagnostics
            },
            is_active: true
          });

        if (error) {
          console.error('❌ Database error:', error);
          toast.error(`❌ Errore database: ${error.message}`);
        } else {
          const tokenData: TokenData = {
            token: fcmToken,
            user: currentUser,
            generated_at: new Date().toISOString(),
            permission: permission,
            diagnostics: diagnostics
          };
          
          setTokenData(tokenData);
          await loadExistingTokens();
          toast.success('✅ Token FCM generato e salvato!');
        }
      } catch (dbError: any) {
        console.error('❌ Database exception:', dbError);
        toast.error(`❌ Errore salvataggio: ${dbError.message}`);
      }

    } catch (error: any) {
      console.error('❌ Token generation error:', error);
      toast.error(`❌ Errore generazione: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const diagnostics = await runFCMDiagnostics();
      console.log('🔥 FCM Diagnostics:', diagnostics);
      toast.success('✅ Diagnostica completata - Vedi console');
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
      toast.error('❌ Errore diagnostica');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const testNotification = async () => {
    if (!tokenData?.token || !tokenData?.user) {
      toast.error('❌ Prima genera un token');
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          user_id: tokenData.user.id,
          title: '🎯 Test FCM Token Manager',
          body: `Test notifica da Token Manager - ${new Date().toLocaleTimeString()}`,
          data: {
            source: 'fcm_token_manager',
            timestamp: new Date().toISOString(),
            test_id: `test_${Date.now()}`
          }
        }
      });

      if (error) {
        toast.error(`❌ Test fallito: ${error.message}`);
      } else {
        toast.success(`✅ Test inviato! Sent: ${data?.sent_count || 0}`);
      }
    } catch (error: any) {
      toast.error(`❌ Errore test: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const copyToken = () => {
    if (tokenData?.token) {
      navigator.clipboard.writeText(tokenData.token);
      toast.success('✅ Token copiato negli appunti');
    }
  };

  const getPermissionColor = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          🔥 FCM Token Manager
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestione completa token Firebase Cloud Messaging con diagnostica avanzata
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={generateToken}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generazione...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                🚀 Genera Token FCM
              </>
            )}
          </Button>

          <Button
            onClick={runDiagnostics}
            disabled={isRunningDiagnostics}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isRunningDiagnostics ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Diagnostica...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                🔍 Diagnostica FCM
              </>
            )}
          </Button>

          <Button
            onClick={testNotification}
            disabled={isTesting || !tokenData?.token}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Test in corso...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                🧪 Test Notifica
              </>
            )}
          </Button>
        </div>

        {/* Token Display */}
        {tokenData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Token FCM generato con successo!</span>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              {/* Token */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Token FCM:</span>
                  <Button onClick={copyToken} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Copia
                  </Button>
                </div>
                <div className="text-xs font-mono break-all bg-background p-3 rounded border">
                  {tokenData.token}
                </div>
              </div>

              {/* Permission Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Permesso Notifiche:</span>
                <Badge className={getPermissionColor(tokenData.permission)}>
                  {tokenData.permission.toUpperCase()}
                </Badge>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p><strong>👤 Utente:</strong> {tokenData.user.email}</p>
                  <p><strong>🆔 User ID:</strong> {tokenData.user.id}</p>
                </div>
                <div>
                  <p><strong>⏰ Generato:</strong> {new Date(tokenData.generated_at).toLocaleString()}</p>
                  <p><strong>🔧 FCM Support:</strong> {isFCMSupported() ? '✅ Completo' : '❌ Limitato'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Tokens */}
        {dbTokens.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">📊 Token Attivi nel Database ({dbTokens.length})</h3>
            <div className="grid gap-2">
              {dbTokens.slice(0, 3).map((token, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="text-sm">
                    <div className="font-mono">{token.fcm_token?.substring(0, 30)}...</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(token.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {token.is_active ? '✅ Attivo' : '⚪ Inattivo'}
                  </Badge>
                </div>
              ))}
              {dbTokens.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... e altri {dbTokens.length - 3} token
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Stato Sistema FCM
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center">
              <div className={`font-bold ${isFCMSupported() ? 'text-green-600' : 'text-red-600'}`}>
                {isFCMSupported() ? '✅' : '❌'}
              </div>
              <div>Browser Support</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${Notification.permission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                {Notification.permission === 'granted' ? '✅' : '❌'}
              </div>
              <div>Permessi</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${dbTokens.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {dbTokens.length}
              </div>
              <div>Token DB</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${tokenData ? 'text-green-600' : 'text-gray-600'}`}>
                {tokenData ? '✅' : '⚪'}
              </div>
              <div>Token Attuale</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};