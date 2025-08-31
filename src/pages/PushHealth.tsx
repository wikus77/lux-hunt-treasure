// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Health Debug Page - End-to-End Push System Validation */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { isPushDisabled, enablePush, disablePush } from '@/utils/pushKillSwitch';
import { subscribeToPush, sendTestPush } from '@/utils/pushSubscribe';

interface PushHealthState {
  // Feature Detection
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  permission: NotificationPermission;
  
  // Service Worker Status
  swRegistration: ServiceWorkerRegistration | null;
  swController: ServiceWorker | null;
  swActive: ServiceWorker | null;
  swScriptURL: string | null;
  swState: string | null;
  swImportsCheck: boolean | null;
  
  // Subscription
  currentSubscription: PushSubscription | null;
  subscriptionHost: string | null;
  subscriptionKeys: { p256dh: number; auth: number } | null;
  
  // Backend Tests
  subscribeTest: { status: string; message: string; data?: any };
  sendTest: { status: string; message: string; data?: any };
  
  // Kill Switch
  killSwitchActive: boolean;
  
  loading: boolean;
  logs: string[];
}

export default function PushHealth() {
  const [state, setState] = useState<PushHealthState>({
    hasServiceWorker: false,
    hasPushManager: false,
    hasNotification: false,
    permission: 'default',
    swRegistration: null,
    swController: null,
    swActive: null,
    swScriptURL: null,
    swState: null,
    swImportsCheck: null,
    currentSubscription: null,
    subscriptionHost: null,
    subscriptionKeys: null,
    subscribeTest: { status: 'pending', message: 'Not tested' },
    sendTest: { status: 'pending', message: 'Not tested' },
    killSwitchActive: false,
    loading: true,
    logs: []
  });

  const addLog = (message: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toISOString()}: ${message}`]
    }));
  };

  const checkFeatureSupport = () => {
    addLog('🔍 Checking feature support...');
    
    setState(prev => ({
      ...prev,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotification: 'Notification' in window,
      permission: Notification?.permission || 'default',
      killSwitchActive: isPushDisabled()
    }));
    
    addLog(`✅ ServiceWorker: ${'serviceWorker' in navigator}`);
    addLog(`✅ PushManager: ${'PushManager' in window}`);
    addLog(`✅ Notification: ${'Notification' in window}`);
    addLog(`🔐 Permission: ${Notification?.permission || 'default'}`);
    addLog(`🔧 Kill Switch: ${isPushDisabled()}`);
  };

  const checkServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      addLog('❌ ServiceWorker not supported');
      return;
    }

    try {
      addLog('🔍 Getting SW registrations...');
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`📊 Found ${registrations.length} SW registrations`);
      
      // Try to get the registration with main scope first
      let registration = registrations.find(reg => 
        reg.scope === window.location.origin + '/'
      );
      
      // If not found, try to register SW
      if (!registration) {
        addLog('⚙️ No SW registration found, attempting to register...');
        try {
          registration = await navigator.serviceWorker.register('/sw.js', { 
            scope: '/',
            updateViaCache: 'none'
          });
          addLog('✅ SW Registration successful');
          await navigator.serviceWorker.ready;
          addLog('✅ SW ready');
        } catch (regError) {
          addLog(`❌ SW registration failed: ${regError}`);
          return;
        }
      }

      if (!registration) {
        addLog('❌ No SW registration available');
        return;
      }

      addLog(`✅ SW Registration found: ${registration.scope}`);
      
      setState(prev => ({
        ...prev,
        swRegistration: registration,
        swController: navigator.serviceWorker.controller,
        swActive: registration.active,
        swScriptURL: registration.active?.scriptURL || null,
        swState: registration.active?.state || null
      }));

      // Check if SW imports sw-push.js
      await checkSwImports();
      
    } catch (error) {
      addLog(`❌ SW check failed: ${error}`);
    }
  };

  const checkSwImports = async () => {
    try {
      addLog('🔍 Checking SW imports sw-push.js...');
      const response = await fetch('/sw.js');
      const swContent = await response.text();
      const hasImport = swContent.includes("importScripts('/sw-push.js')") || 
                       swContent.includes('importScripts("/sw-push.js")');
      
      setState(prev => ({
        ...prev,
        swImportsCheck: hasImport
      }));
      
      addLog(`${hasImport ? '✅' : '❌'} SW imports sw-push.js: ${hasImport}`);
      
    } catch (error) {
      addLog(`❌ SW import check failed: ${error}`);
      setState(prev => ({ ...prev, swImportsCheck: false }));
    }
  };

  const checkCurrentSubscription = async () => {
    if (!state.swRegistration) {
      addLog('❌ No SW registration for subscription check');
      return;
    }

    try {
      addLog('🔍 Getting current subscription...');
      const subscription = await state.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        addLog('📭 No active subscription found');
        setState(prev => ({
          ...prev,
          currentSubscription: null,
          subscriptionHost: null,
          subscriptionKeys: null
        }));
        return;
      }

      const endpoint = subscription.endpoint;
      const keys = subscription.getKey ? {
        p256dh: subscription.getKey('p256dh')?.byteLength || 0,
        auth: subscription.getKey('auth')?.byteLength || 0
      } : { p256dh: 0, auth: 0 };

      let host = 'unknown';
      try {
        const url = new URL(endpoint);
        host = url.hostname;
      } catch {}

      setState(prev => ({
        ...prev,
        currentSubscription: subscription,
        subscriptionHost: host,
        subscriptionKeys: keys
      }));

      addLog(`✅ Active subscription found`);
      addLog(`🌐 Endpoint host: ${host}`);
      addLog(`🔑 Keys - p256dh: ${keys.p256dh}B, auth: ${keys.auth}B`);
      
    } catch (error) {
      addLog(`❌ Subscription check failed: ${error}`);
    }
  };

  const testSubscribe = async () => {
    try {
      setState(prev => ({
        ...prev,
        subscribeTest: { status: 'testing', message: 'Subscribing...' }
      }));

      const result = await subscribeToPush({ 
        onLog: addLog 
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          subscribeTest: { 
            status: 'success', 
            message: 'Subscription successful',
            data: result.data 
          }
        }));
        await runFullDiagnostic(); // Refresh all info
      } else {
        setState(prev => ({
          ...prev,
          subscribeTest: { 
            status: 'error', 
            message: result.error || 'Unknown error' 
          }
        }));
      }
      
    } catch (error) {
      addLog(`❌ Subscription test failed: ${error}`);
      setState(prev => ({
        ...prev,
        subscribeTest: { 
          status: 'error', 
          message: `Failed: ${error}` 
        }
      }));
    }
  };

  const testSend = async () => {
    if (!state.currentSubscription) {
      setState(prev => ({
        ...prev,
        sendTest: { status: 'error', message: 'No active subscription' }
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        sendTest: { status: 'testing', message: 'Sending test push...' }
      }));

      const result = await sendTestPush(state.currentSubscription, addLog);

      if (result.success) {
        setState(prev => ({
          ...prev,
          sendTest: { 
            status: 'success', 
            message: 'Push sent successfully',
            data: result.data 
          }
        }));
      } else {
        setState(prev => ({
          ...prev,
          sendTest: { 
            status: 'error', 
            message: result.error || 'Unknown error' 
          }
        }));
      }
      
    } catch (error) {
      addLog(`❌ Push send test failed: ${error}`);
      setState(prev => ({
        ...prev,
        sendTest: { 
          status: 'error', 
          message: `Failed: ${error}` 
        }
      }));
    }
  };

  const toggleKillSwitch = () => {
    if (state.killSwitchActive) {
      enablePush();
      addLog('✅ Push notifications re-enabled');
    } else {
      disablePush();
      addLog('🔴 Push notifications disabled by kill switch');
    }
    
    setState(prev => ({
      ...prev,
      killSwitchActive: !prev.killSwitchActive
    }));
  };

  const runFullDiagnostic = async () => {
    setState(prev => ({ ...prev, loading: true, logs: [] }));
    addLog('🚀 Starting full diagnostic...');
    
    checkFeatureSupport();
    await checkServiceWorker();
    await checkCurrentSubscription();
    
    setState(prev => ({ ...prev, loading: false }));
    addLog('✅ Diagnostic complete');
  };

  useEffect(() => {
    runFullDiagnostic();
  }, []);

  // Helper functions
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const detectPlatform = () => {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    return 'Unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return 'bg-green-500';
    if (status === false) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔧 Push Health</h1>
          <p className="text-gray-400">End-to-end push notification system validation</p>
        </div>

        {/* Kill Switch */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Kill Switch</h3>
              <p className="text-sm text-gray-400">Emergency disable for push notifications</p>
            </div>
            <Button
              onClick={toggleKillSwitch}
              variant={state.killSwitchActive ? "destructive" : "default"}
            >
              {state.killSwitchActive ? '🔴 Disabled' : '✅ Enabled'}
            </Button>
          </div>
        </Card>

        {/* Feature Support */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3">🔍 Feature Support</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(state.hasServiceWorker)}`} />
              <span>ServiceWorker</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(state.hasPushManager)}`} />
              <span>PushManager</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(state.hasNotification)}`} />
              <span>Notification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={state.permission === 'granted' ? 'default' : 'destructive'}>
                {state.permission}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Service Worker Status */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3">⚙️ Service Worker Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Registration:</span>
              <Badge variant={state.swRegistration ? 'default' : 'destructive'}>
                {state.swRegistration ? 'Found' : 'Not Found'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Script URL:</span>
              <span className="text-gray-400 font-mono text-xs">
                {state.swScriptURL || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>State:</span>
              <Badge>{state.swState || 'Unknown'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Imports sw-push.js:</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(state.swImportsCheck)}`} />
            </div>
          </div>
        </Card>

        {/* Current Subscription */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3">📱 Current Subscription</h3>
          {state.currentSubscription ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Endpoint Host:</span>
                <Badge variant="outline">{state.subscriptionHost}</Badge>
              </div>
              <div className="flex justify-between">
                <span>p256dh Key:</span>
                <span>{state.subscriptionKeys?.p256dh}B</span>
              </div>
              <div className="flex justify-between">
                <span>Auth Key:</span>
                <span>{state.subscriptionKeys?.auth}B</span>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      const subscriptionJson = JSON.stringify(state.currentSubscription?.toJSON(), null, 2);
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(subscriptionJson);
                        addLog('📋 Subscription JSON copied to clipboard');
                      } else {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = subscriptionJson;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        addLog('📋 Subscription JSON copied to clipboard (fallback)');
                      }
                    } catch (error) {
                      addLog(`❌ Copy failed: ${error}`);
                    }
                  }}
                >
                  📋 Copy JSON
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No active subscription</p>
          )}
        </Card>

        {/* Backend Tests */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">🔧 Subscribe Test</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(state.subscribeTest.status)}</span>
                <span className="text-sm">{state.subscribeTest.message}</span>
              </div>
              <Button 
                onClick={testSubscribe}
                disabled={state.subscribeTest.status === 'testing'}
                size="sm"
              >
                Test Subscribe
              </Button>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-3">📤 Send Test</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(state.sendTest.status)}</span>
                <span className="text-sm">{state.sendTest.message}</span>
              </div>
              <Button 
                onClick={testSend}
                disabled={state.sendTest.status === 'testing' || !state.currentSubscription}
                size="sm"
              >
                Send Test Push
              </Button>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3">🎛️ Actions</h3>
          <div className="flex space-x-2">
            <Button onClick={runFullDiagnostic} disabled={state.loading}>
              🔄 Re-run Diagnostic
            </Button>
            <Button 
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, logs: [] }))}
            >
              🗑️ Clear Logs
            </Button>
          </div>
        </Card>

        {/* Logs */}
        <Card className="bg-gray-900 border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-3">📋 Diagnostic Logs</h3>
          <div className="bg-black rounded p-3 max-h-64 overflow-y-auto">
            {state.logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              state.logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-300 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}