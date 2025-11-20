// @ts-nocheck
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// iOS PWA Push Notifications Debug Panel - Emergency Diagnostics Tool

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface DebugInfo {
  isIOS: boolean;
  isPWA: boolean;
  oneSignalReady: boolean;
  playerId: string | null;
  permission: string | null;
  serviceWorkerStatus: string;
  notificationSupport: boolean;
  deviceTokenSaved: boolean;
  lastError: string | null;
}

export const IOSPushDebugPanel = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    isIOS: false,
    isPWA: false,
    oneSignalReady: false,
    playerId: null,
    permission: null,
    serviceWorkerStatus: 'unknown',
    notificationSupport: false,
    deviceTokenSaved: false,
    lastError: null
  });
  const [isVisible, setIsVisible] = useState(false);

  // Show debug panel only if URL contains debug=push or user is admin
  useEffect(() => {
    const showDebug = window.location.search.includes('debug=push') || 
                     window.location.hostname === 'localhost';
    setIsVisible(showDebug);
  }, []);

  const runDiagnostics = async () => {
    try {
      console.log('🔍 RUNNING iOS PWA PUSH DIAGNOSTICS...');
      
      const newDebugInfo: DebugInfo = {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isPWA: window.navigator.standalone === true,
        oneSignalReady: !!(window as any).M1SSIONOneSignalDebug,
        playerId: null,
        permission: null,
        serviceWorkerStatus: 'unknown',
        notificationSupport: 'Notification' in window,
        deviceTokenSaved: false,
        lastError: null
      };

      // Check Service Worker status
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          newDebugInfo.serviceWorkerStatus = registration ? 'registered' : 'not_registered';
        } catch (error) {
          newDebugInfo.serviceWorkerStatus = 'error';
        }
      } else {
        newDebugInfo.serviceWorkerStatus = 'not_supported';
      }

      // Check OneSignal status
      if ((window as any).M1SSIONOneSignalDebug) {
        try {
          newDebugInfo.playerId = await (window as any).M1SSIONOneSignalDebug.getPlayerId();
          newDebugInfo.permission = await (window as any).M1SSIONOneSignalDebug.checkPermission();
        } catch (error) {
          newDebugInfo.lastError = `OneSignal check failed: ${error.message}`;
        }
      }

      // Check if device token is saved in database
      if (user && newDebugInfo.playerId) {
        try {
          const { data, error } = await supabase
            .from('device_tokens')
            .select('token')
            .eq('user_id', user.id)
            .eq('device_type', 'onesignal')
            .single();
          
          newDebugInfo.deviceTokenSaved = !error && data?.token === newDebugInfo.playerId;
        } catch (error) {
          newDebugInfo.lastError = `Database check failed: ${error.message}`;
        }
      }

      setDebugInfo(newDebugInfo);
      
      // Log diagnostics to Supabase for debugging
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'ios_push_diagnostics',
          user_id: user?.id || null,
          note: 'iOS Push Diagnostics Run',
          context: 'debug_panel',
          details: newDebugInfo
        });

      toast.success('✅ Diagnostics completed - check console for details');
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastError: `Diagnostics failed: ${error.message}`
      }));
      toast.error('❌ Diagnostics failed');
    }
  };

  const forcePermissionRequest = async () => {
    try {
      if ((window as any).M1SSIONOneSignalDebug) {
        const result = await (window as any).M1SSIONOneSignalDebug.forceRequestPermission();
        toast.success(`Permission request result: ${result}`);
        await runDiagnostics(); // Refresh diagnostics
      } else {
        toast.error('OneSignal debug utils not available');
      }
    } catch (error) {
      toast.error(`Permission request failed: ${error.message}`);
    }
  };

  const testNotification = async () => {
    try {
      if (user) {
        console.log('🧪 TESTING: Sending iOS test notification via Apple Push Service...');
        
        const { data, error } = await supabase.functions.invoke('send-ios-push', {
          body: {
            title: '🧪 M1SSION™ Test iOS',
            body: 'Test notifica push iOS PWA - Se ricevi questo messaggio, le notifiche Apple funzionano!',
            targetUserId: user.id,
            data: {
              url: '/home',
              timestamp: new Date().toISOString(),
              source: 'debug_panel_test',
              testId: Date.now()
            }
          }
        });

        if (error) {
          throw error;
        }

        console.log('📊 Send result:', data);
        toast.success(`🧪 Test sent: ${data?.sent || 0} successful, ${data?.failed || 0} failed`);
      } else {
        toast.error('User not authenticated');
      }
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      toast.error(`Test notification failed: ${error.message}`);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 border-2 border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          🚨 iOS Push Debug Panel
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Badge variant={debugInfo.isIOS ? "default" : "secondary"}>
              iOS: {debugInfo.isIOS ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <Badge variant={debugInfo.isPWA ? "default" : "secondary"}>
              PWA: {debugInfo.isPWA ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <Badge variant={debugInfo.oneSignalReady ? "default" : "destructive"}>
              OneSignal: {debugInfo.oneSignalReady ? "✅" : "❌"}
            </Badge>
          </div>
          <div>
            <Badge variant={debugInfo.notificationSupport ? "default" : "destructive"}>
              Notifications: {debugInfo.notificationSupport ? "✅" : "❌"}
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <div><strong>Permission:</strong> {debugInfo.permission || 'Unknown'}</div>
          <div><strong>Player ID:</strong> {debugInfo.playerId ? '✅ Set' : '❌ Missing'}</div>
          <div><strong>Service Worker:</strong> {debugInfo.serviceWorkerStatus}</div>
          <div><strong>Token Saved:</strong> {debugInfo.deviceTokenSaved ? '✅' : '❌'}</div>
        </div>

        {debugInfo.lastError && (
          <div className="text-red-500 text-xs p-2 bg-red-50 rounded">
            <strong>Error:</strong> {debugInfo.lastError}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            🔍 Run Diagnostics
          </Button>
          <Button onClick={forcePermissionRequest} variant="outline" size="sm">
            🔔 Force Permission
          </Button>
          <Button onClick={testNotification} variant="outline" size="sm">
            🧪 Test Notification
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Add ?debug=push to URL to show this panel
        </div>
      </CardContent>
    </Card>
  );
};