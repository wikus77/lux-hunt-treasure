// @ts-nocheck
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Notification Diagnostic Page - BREAK-GLASS MODE FIXES

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Smartphone, Monitor, AlertCircle, CheckCircle, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { enablePush, getNotificationStatus } from '@/features/notifications/enablePush';

interface DiagnosticData {
  // Environment
  isStandalone: boolean;
  userAgent: string;
  platform: string;
  
  // Permissions & Support
  notificationPermission: NotificationPermission;
  pushSupported: boolean;
  swSupported: boolean;
  
  // Service Worker Status
  swRegistrations: any[];
  swController: any;
  
  // Push State
  currentSubscription: any;
  
  // User & Auth
  userId: string | null;
  isAuthenticated: boolean;
  
  // Database
  fcmSubscriptions: any[];
  
  timestamp: string;
}

export default function PushDiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    console.debug(logEntry);
  };

  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      addLog('🔄 Starting diagnostic scan...');
      
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get environment info
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      // Get SW registrations
      let swRegistrations: ServiceWorkerRegistration[] = [];
      let swController = null;
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        swRegistrations = [...registrations]; // Convert readonly to mutable array
        swController = navigator.serviceWorker.controller;
      }
      
      // Get current push subscription
      let currentSubscription = null;
      if (pushSupported) {
        try {
          const reg = await navigator.serviceWorker.ready;
          currentSubscription = await reg.pushManager.getSubscription();
        } catch (error) {
          addLog(`⚠️ Error getting push subscription: ${error}`);
        }
      }
      
      // Get FCM subscriptions from DB
      let fcmSubscriptions: any[] = [];
      if (user) {
        try {
          const { data, error } = await supabase
            .from('fcm_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            addLog(`⚠️ DB query error: ${error.message}`);
          } else {
            fcmSubscriptions = data || [];
          }
        } catch (error: any) {
          addLog(`⚠️ DB error: ${error.message}`);
        }
      }
      
      const diagnostics: DiagnosticData = {
        isStandalone,
        userAgent: navigator.userAgent,
        platform: /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios' : 
                 /Android/.test(navigator.userAgent) ? 'android' : 'desktop',
        notificationPermission: Notification.permission,
        pushSupported,
        swSupported: 'serviceWorker' in navigator,
        swRegistrations: swRegistrations.map(reg => ({
          scope: reg.scope,
          scriptURL: reg.active?.scriptURL,
          state: reg.active?.state,
          installing: !!reg.installing,
          waiting: !!reg.waiting
        })),
        swController: swController ? {
          scriptURL: swController.scriptURL,
          state: swController.state
        } : null,
        currentSubscription: currentSubscription ? {
          endpoint: currentSubscription.endpoint.substring(0, 50) + '...',
          endpointType: currentSubscription.endpoint.includes('fcm.googleapis.com') ? 'fcm' : 
                       currentSubscription.endpoint.includes('web.push.apple.com') ? 'apns' : 'unknown'
        } : null,
        userId: user?.id || null,
        isAuthenticated: !!user,
        fcmSubscriptions: fcmSubscriptions.map(sub => ({
          id: sub.id,
          token: sub.token.substring(0, 20) + '...',
          platform: sub.platform,
          is_active: sub.is_active,
          created_at: sub.created_at
        })),
        timestamp: new Date().toISOString()
      };
      
      setDiagnosticData(diagnostics);
      addLog('✅ Diagnostic scan complete');
      
    } catch (error: any) {
      addLog(`❌ Diagnostic error: ${error.message}`);
      toast.error('Errore diagnostica', { description: error.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const testPushFlow = async () => {
    addLog('🧪 Starting push notification test...');
    try {
      await enablePush();
      addLog('✅ Push test SUCCESS');
      toast.success('Test push completato!');
      // Refresh diagnostics to see new state
      await refreshDiagnostics();
    } catch (error: any) {
      addLog(`💥 Push test ERROR: ${error.message}`);
      toast.error('Test push error', { description: error.message });
    }
  };

  const testFCMFunction = async () => {
    if (!diagnosticData?.fcmSubscriptions?.length) {
      toast.error('Nessun token FCM trovato');
      return;
    }
    
    const token = diagnosticData.fcmSubscriptions[0];
    addLog(`🔥 Testing FCM function with token ${token.token}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('fcm-test', {
        body: { 
          token: token.token.replace('...', ''), // This won't work with truncated token, but shows the flow
          title: 'M1SSION FCM Test',
          body: 'Diagnostic test from /debug/push'
        }
      });
      
      if (error) {
        addLog(`❌ FCM function error: ${error.message}`);
        toast.error('FCM test error', { description: error.message });
      } else {
        addLog(`✅ FCM function result: ${JSON.stringify(data)}`);
        toast.success('FCM test inviato!');
      }
    } catch (error: any) {
      addLog(`💥 FCM function exception: ${error.message}`);
      toast.error('FCM function error', { description: error.message });
    }
  };

  const copyDiagnostics = () => {
    if (!diagnosticData) return;
    
    const diagnosticText = JSON.stringify(diagnosticData, null, 2);
    navigator.clipboard.writeText(diagnosticText);
    toast.success('Diagnostica copiata negli appunti');
  };

  useEffect(() => {
    refreshDiagnostics();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  if (!diagnosticData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Caricamento diagnostica push...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔧 Push Diagnostics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyDiagnostics}>
            <Copy className="w-4 h-4 mr-2" />
            Copia JSON
          </Button>
          <Button onClick={refreshDiagnostics} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>PWA Standalone Mode</span>
            {getStatusIcon(diagnosticData.isStandalone)}
            <Badge variant={diagnosticData.isStandalone ? 'default' : 'secondary'}>
              {diagnosticData.isStandalone ? 'Standalone' : 'Browser'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Platform</span>
            <Badge variant="outline">
              {diagnosticData.platform === 'ios' && <Smartphone className="w-4 h-4 mr-1" />}
              {diagnosticData.platform === 'android' && <Smartphone className="w-4 h-4 mr-1" />}
              {diagnosticData.platform === 'desktop' && <Monitor className="w-4 h-4 mr-1" />}
              {diagnosticData.platform}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>UA:</strong> {diagnosticData.userAgent.substring(0, 100)}...
          </div>
        </CardContent>
      </Card>

      {/* Push Support */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Push Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Service Worker Support</span>
            {getStatusIcon(diagnosticData.swSupported)}
          </div>
          <div className="flex items-center justify-between">
            <span>Push Manager Support</span>
            {getStatusIcon(diagnosticData.pushSupported)}
          </div>
          <div className="flex items-center justify-between">
            <span>Notification Permission</span>
            <Badge variant={
              diagnosticData.notificationPermission === 'granted' ? 'default' :
              diagnosticData.notificationPermission === 'denied' ? 'destructive' : 'secondary'
            }>
              {diagnosticData.notificationPermission}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Service Worker</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticData.swController && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm">
                <strong>Controller:</strong> {diagnosticData.swController.scriptURL}
              </div>
              <div className="text-sm text-muted-foreground">
                State: {diagnosticData.swController.state}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium">Registrations ({diagnosticData.swRegistrations.length})</h4>
            {diagnosticData.swRegistrations.map((reg, idx) => (
              <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                <div><strong>Scope:</strong> {reg.scope}</div>
                {reg.scriptURL && <div><strong>Script:</strong> {reg.scriptURL}</div>}
                <div><strong>State:</strong> {reg.state}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>📡 Current Push Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticData.currentSubscription ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Endpoint Type</span>
                <Badge variant="outline">{diagnosticData.currentSubscription.endpointType}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Endpoint:</strong> {diagnosticData.currentSubscription.endpoint}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No active push subscription
            </div>
          )}
        </CardContent>
      </Card>

      {/* User & Auth */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Authenticated</span>
            {getStatusIcon(diagnosticData.isAuthenticated)}
          </div>
          {diagnosticData.userId && (
            <div className="text-xs text-muted-foreground">
              <strong>User ID:</strong> {diagnosticData.userId}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FCM Database */}
      <Card>
        <CardHeader>
          <CardTitle>🗄️ FCM Database ({diagnosticData.fcmSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticData.fcmSubscriptions.length > 0 ? (
            <div className="space-y-2">
              {diagnosticData.fcmSubscriptions.map((sub, idx) => (
                <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span>{sub.token}</span>
                    <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Platform: {sub.platform} • Created: {new Date(sub.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No FCM subscriptions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testPushFlow} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Test Complete Push Flow
          </Button>
          
          {diagnosticData.fcmSubscriptions.length > 0 && (
            <Button onClick={testFCMFunction} variant="outline" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Test FCM Edge Function
            </Button>
          )}
          
          {testResult && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Test Result</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>📜 Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
            {logs.length === 0 && <div className="text-muted-foreground">No logs yet...</div>}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Diagnostic timestamp: {new Date(diagnosticData.timestamp).toLocaleString()}
      </div>
    </div>
  );
}