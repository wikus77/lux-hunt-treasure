// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export const FCMDebugTrace = () => {
  const [traceData, setTraceData] = useState<any>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const fcm = useFCMPushNotifications();

  // Real-time FCM status check
  useEffect(() => {
    const checkFCMStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check token in database
      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      setTraceData({
        userId: user.id,
        timestamp: new Date().toISOString(),
        fcmSupported: fcm.isSupported,
        notificationPermission: fcm.permission,
        fcmToken: fcm.token,
        tokensInDatabase: tokens?.length || 0,
        tokenDetails: tokens?.[0] || null,
        serviceWorkerStatus: 'serviceWorker' in navigator ? 'supported' : 'not_supported',
        isIOSCapacitor: fcm.isIOSCapacitor
      });
    };

    checkFCMStatus();
    const interval = setInterval(checkFCMStatus, 3000);
    return () => clearInterval(interval);
  }, [fcm]);

  const testNotificationFlow = async () => {
    setIsTracing(true);
    const testId = Date.now();
    const results: any[] = [];

    try {
      console.log('🔥 FCM-TRACE: Starting notification test flow');
      
      // Step 1: Check permission
      results.push({
        step: 'permission_check',
        status: fcm.permission === 'granted' ? 'success' : 'error',
        details: { permission: fcm.permission },
        timestamp: new Date().toISOString()
      });

      if (fcm.permission !== 'granted') {
        results.push({
          step: 'request_permission',
          status: 'pending',
          details: { action: 'requesting_permission' },
          timestamp: new Date().toISOString()
        });

        const permissionGranted = await fcm.requestPermission();
        results[results.length - 1] = {
          ...results[results.length - 1],
          status: permissionGranted ? 'success' : 'error',
          details: { granted: permissionGranted }
        };
      }

      // Step 2: Check token
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        results.push({
          step: 'user_auth',
          status: 'error',
          details: { error: 'User not authenticated' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      results.push({
        step: 'token_check',
        status: fcm.token ? 'success' : 'error',
        details: { hasToken: !!fcm.token, tokenPreview: fcm.token?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      // Step 3: Send test notification
      if (fcm.token) {
        results.push({
          step: 'send_notification',
          status: 'pending',
          details: { action: 'sending_test_notification' },
          timestamp: new Date().toISOString()
        });

        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
          body: {
            title: `DEBUG M1SSION ${testId}`,
            body: `Test notifica Firebase - ${new Date().toLocaleTimeString()}`,
            user_id: user.id,
            data: {
              test_id: testId.toString(),
              source: 'fcm_debug_trace'
            }
          }
        });

        results[results.length - 1] = {
          ...results[results.length - 1],
          status: data?.success ? 'success' : 'error',
          details: { 
            response: data, 
            error: error?.message,
            sent_count: data?.sent_count,
            failed_count: data?.failed_count
          }
        };

        // Step 4: Listen for notification receipt
        results.push({
          step: 'notification_receipt',
          status: 'pending',
          details: { waiting_for_notification: true },
          timestamp: new Date().toISOString()
        });

        // Wait 5 seconds to see if notification arrives
        setTimeout(() => {
          setTestResults(prev => {
            const updated = [...prev];
            const receiptIndex = updated.findIndex(r => r.step === 'notification_receipt' && r.status === 'pending');
            if (receiptIndex !== -1) {
              updated[receiptIndex] = {
                ...updated[receiptIndex],
                status: 'warning',
                details: { 
                  timeout: true, 
                  message: 'Notification not received within 5 seconds'
                }
              };
            }
            return updated;
          });
        }, 5000);
      }

      setTestResults(results);
      toast.success('Test FCM completato');

    } catch (error: any) {
      console.error('❌ FCM trace error:', error);
      results.push({
        step: 'error',
        status: 'error',
        details: { error: error.message },
        timestamp: new Date().toISOString()
      });
      setTestResults(results);
      toast.error('Errore nel test FCM');
    } finally {
      setIsTracing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time FCM Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 FCM-TRACE Real-time Status
            <Badge variant={traceData?.fcmToken ? 'default' : 'destructive'}>
              {traceData?.fcmToken ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {traceData && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User ID:</strong> {traceData.userId?.substring(0, 8)}...
              </div>
              <div>
                <strong>FCM Supported:</strong> {traceData.fcmSupported ? '✅' : '❌'}
              </div>
              <div>
                <strong>Permission:</strong> 
                <Badge variant={traceData.notificationPermission === 'granted' ? 'default' : 'destructive'} className="ml-2">
                  {traceData.notificationPermission}
                </Badge>
              </div>
              <div>
                <strong>Tokens in DB:</strong> {traceData.tokensInDatabase}
              </div>
              <div>
                <strong>Service Worker:</strong> {traceData.serviceWorkerStatus}
              </div>
              <div>
                <strong>iOS Safari:</strong> {traceData.isIOSCapacitor ? '🍎' : '🌐'}
              </div>
            </div>
          )}

          {traceData?.tokenDetails && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Token salvato:</strong> {traceData.tokenDetails.fcm_token?.substring(0, 30)}...
                <br />
                <strong>Creato:</strong> {new Date(traceData.tokenDetails.created_at).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {(!traceData?.fcmToken || traceData?.tokensInDatabase === 0) && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-600">
                <strong>⚠️ PROBLEMA IDENTIFICATO:</strong> 
                {!traceData?.fcmToken && ' Nessun token FCM generato.'}
                {traceData?.tokensInDatabase === 0 && ' Nessun token salvato nel database.'}
                <br />
                Attivare le notifiche push per generare il token.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Notification Flow */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Completo Notifiche FCM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testNotificationFlow}
            disabled={isTracing}
            className="w-full"
            size="lg"
          >
            {isTracing ? '🔄 Testing in corso...' : '🔥 Avvia Test Diagnostico FCM'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Risultati Test:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.step.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {JSON.stringify(result.details, null, 2)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};