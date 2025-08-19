// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA Push Diagnostics Panel - Complete Token Flow Verification

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useIOSPushTokenManager } from '@/hooks/useIOSPushTokenManager';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';

export const IOSPushDiagnosticsPanel = () => {
  const { user } = useAuth();
  const { debugInfo, manualRegistration, checkEnvironment } = useIOSPushTokenManager();
  const [isVisible, setIsVisible] = useState(false);
  const [databaseTokens, setDatabaseTokens] = useState<any[]>([]);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Show panel based on URL parameters or localhost
  useEffect(() => {
    const showPanel = window.location.search.includes('debug=push') || 
                     window.location.search.includes('debug=ios') ||
                     window.location.hostname === 'localhost';
    setIsVisible(showPanel);
  }, []);

  // Check database tokens
  const checkDatabaseTokens = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_type', 'onesignal');

      if (error) {
        console.error('Error checking database tokens:', error);
        return;
      }

      setDatabaseTokens(data || []);
      console.log('🔔 Database tokens for user:', data);
    } catch (error) {
      console.error('Exception checking database tokens:', error);
    }
  };

  useEffect(() => {
    if (user && isVisible) {
      checkDatabaseTokens();
    }
  }, [user, isVisible]);

  // Complete OneSignal diagnostic
  const runCompleteOneSignalDiagnostic = async () => {
    try {
      console.log('🔍 CRITICAL iOS PWA: Running complete OneSignal diagnostic...');
      
      // Environment check
      const env = checkEnvironment();
      
      // OneSignal status
      const oneSignalStatus = {
        sdkReady: (window as any).M1SSIONOneSignalDebug !== undefined,
        debugUtils: Object.keys((window as any).M1SSIONOneSignalDebug || {}),
      };

      // Permission and subscription check
      let permissionData = {};
      try {
        const permission = await OneSignal.Notifications.permission;
        const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
        const playerId = await OneSignal.User.PushSubscription.id;
        
        permissionData = {
          permission,
          isOptedIn,
          playerId: playerId ? `${playerId.substring(0, 20)}...` : null,
          playerIdLength: playerId ? playerId.length : 0
        };
      } catch (error) {
        permissionData = { error: error.message };
      }

      // Service Worker status
      let serviceWorkerStatus = {};
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          serviceWorkerStatus = {
            registered: !!registration,
            scope: registration?.scope,
            active: !!registration?.active,
            installing: !!registration?.installing,
            waiting: !!registration?.waiting
          };
        } catch (error) {
          serviceWorkerStatus = { error: error.message };
        }
      }

      const diagnosticResult = {
        timestamp: new Date().toISOString(),
        environment: env,
        oneSignal: oneSignalStatus,
        permissions: permissionData,
        serviceWorker: serviceWorkerStatus,
        debugInfo: debugInfo,
        userAgent: navigator.userAgent
      };

      console.log('🔍 COMPLETE DIAGNOSTIC RESULT:', diagnosticResult);

      // Log to database
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'ios_pwa_complete_diagnostic',
          user_id: user?.id || null,
          note: 'Complete iOS PWA OneSignal diagnostic',
          context: 'ios_diagnostics_panel',
          details: diagnosticResult
        });

      // Refresh database tokens after diagnostic
      await checkDatabaseTokens();

      toast.success('✅ Diagnostic completo - vedi console per dettagli');

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      toast.error('❌ Errore durante diagnostic');
    }
  };

  // Test notification via OneSignal REST API
  const testNotificationViaAPI = async () => {
    if (!user) {
      toast.error('User non autenticato');
      return;
    }

    setIsTestingNotification(true);
    
    try {
      console.log('🧪 Testing notification via Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🧪 M1SSION™ iOS Test',
          body: 'Test notifica iOS PWA - Token verification test',
          target_user_id: user.id,
          data: {
            test: true,
            timestamp: new Date().toISOString(),
            source: 'ios_diagnostics_panel'
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Test notification result:', data);
      toast.success('🧪 Notifica test inviata - controlla il device');

    } catch (error) {
      console.error('❌ Test notification failed:', error);
      toast.error(`Test notification failed: ${error.message}`);
    } finally {
      setIsTestingNotification(false);
    }
  };

  // Force token refresh
  const forceTokenRefresh = async () => {
    console.log('🔄 Forcing token refresh...');
    await manualRegistration();
    setTimeout(checkDatabaseTokens, 2000);
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 left-4 w-[400px] z-50 border-2 border-primary max-h-[600px] overflow-y-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          🧪 iOS PWA Push Diagnostics
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        {/* Environment Status */}
        <div className="space-y-2">
          <h4 className="font-semibold">Environment:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={debugInfo.isIOS ? "default" : "secondary"}>
              iOS: {debugInfo.isIOS ? "✅" : "❌"}
            </Badge>
            <Badge variant={debugInfo.isPWA ? "default" : "secondary"}>
              PWA: {debugInfo.isPWA ? "✅" : "❌"}
            </Badge>
          </div>
        </div>

        {/* OneSignal Status */}
        <div className="space-y-2">
          <h4 className="font-semibold">OneSignal:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={debugInfo.oneSignalReady ? "default" : "destructive"}>
              Ready: {debugInfo.oneSignalReady ? "✅" : "❌"}
            </Badge>
            <Badge variant={debugInfo.permission === 'granted' ? "default" : "destructive"}>
              Permission: {debugInfo.permission || "❓"}
            </Badge>
          </div>
          
          <div className="text-xs">
            <div><strong>Player ID:</strong> {debugInfo.playerId ? '✅ Set' : '❌ Missing'}</div>
            <div><strong>Subscription:</strong> {debugInfo.subscriptionState || 'Unknown'}</div>
            <div><strong>Token Saved:</strong> {debugInfo.tokenSaved ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Database Tokens */}
        <div className="space-y-2">
          <h4 className="font-semibold">Database Tokens:</h4>
          <div className="text-xs">
            <div><strong>Count:</strong> {databaseTokens.length}</div>
            {databaseTokens.map((token, index) => (
              <div key={index} className="mt-1 p-1 bg-muted rounded">
                <div><strong>Token:</strong> {token.token.substring(0, 20)}...</div>
                <div><strong>Last Used:</strong> {new Date(token.last_used).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Information */}
        {debugInfo.lastError && (
          <div className="text-red-500 text-xs p-2 bg-red-50 rounded">
            <strong>Last Error:</strong> {debugInfo.lastError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={runCompleteOneSignalDiagnostic} variant="outline" size="sm">
            🔍 Complete Diagnostic
          </Button>
          
          <Button onClick={forceTokenRefresh} variant="outline" size="sm">
            🔄 Force Token Refresh
          </Button>
          
          <Button onClick={checkDatabaseTokens} variant="outline" size="sm">
            📊 Check Database
          </Button>
          
          <Button 
            onClick={testNotificationViaAPI} 
            variant="outline" 
            size="sm"
            disabled={isTestingNotification}
          >
            {isTestingNotification ? '🔄 Testing...' : '🧪 Test Notification'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div><strong>Debug Panel Access:</strong></div>
          <div>• Add ?debug=push to URL</div>
          <div>• Add ?debug=ios to URL</div>
          <div>• Available on localhost</div>
        </div>
      </CardContent>
    </Card>
  );
};