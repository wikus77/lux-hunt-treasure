// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Debug Page

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  Globe, 
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react';

interface DebugInfo {
  // Device detection
  isIOS: boolean;
  isSafari: boolean;
  isPWA: boolean;
  userAgent: string;
  
  // FCM status
  fcmSupported: boolean;
  fcmInitialized: boolean;
  fcmToken: string | null;
  permissionStatus: string;
  
  // Service Worker
  serviceWorkerRegistered: boolean;
  serviceWorkerScope: string;
  
  // Device token in Supabase
  deviceTokenSaved: boolean;
  
  // Errors
  errors: string[];
}

export const FirebaseNotificationDebug = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const {
    isSupported,
    permission,
    token,
    loading,
    requestPermission
  } = useFCMPushNotifications();

  const runDiagnostics = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    
    try {
      console.log('🔍 Running FCM notification diagnostics...');
      
      // Device detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      
      console.log('📱 Device Info:', { isIOS, isSafari, isPWA });
      
      // FCM diagnostics
      let fcmSupported = false;
      let fcmInitialized = false;
      let fcmToken = null;
      let permissionStatus = 'unknown';
      
      try {
        fcmSupported = isSupported;
        fcmInitialized = !!token;
        fcmToken = token;
        permissionStatus = permission || 'default';
        
        console.log('🔥 FCM Status:', { fcmSupported, fcmInitialized, fcmToken: fcmToken?.substring(0, 20) + '...', permissionStatus });
        
        if (!fcmSupported) {
          errors.push('Firebase Cloud Messaging not supported');
        }
        
      } catch (err) {
        console.error('❌ FCM diagnostic error:', err);
        errors.push(`FCM diagnostic error: ${err}`);
      }
      
      // Service Worker diagnostics
      let serviceWorkerRegistered = false;
      let serviceWorkerScope = '';
      
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          serviceWorkerRegistered = !!registration;
          serviceWorkerScope = registration?.scope || '';
          console.log('⚙️ Service Worker registered:', serviceWorkerRegistered, 'Scope:', serviceWorkerScope);
        } catch (err) {
          console.error('❌ Service Worker diagnostic error:', err);
          errors.push(`Service Worker error: ${err}`);
        }
      }
      
      // Check device token in Supabase
      let deviceTokenSaved = false;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: tokens } = await supabase
            .from('user_push_tokens')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);
          
          deviceTokenSaved = tokens && tokens.length > 0;
          console.log('💾 FCM tokens saved:', deviceTokenSaved, 'Count:', tokens?.length || 0);
        }
      } catch (err) {
        console.error('❌ Supabase token check error:', err);
        errors.push(`Supabase token check error: ${err}`);
      }
      
      const diagnostics: DebugInfo = {
        isIOS,
        isSafari,
        isPWA,
        userAgent: navigator.userAgent,
        fcmSupported,
        fcmInitialized,
        fcmToken,
        permissionStatus,
        serviceWorkerRegistered,
        serviceWorkerScope,
        deviceTokenSaved,
        errors
      };
      
      setDebugInfo(diagnostics);
      console.log('✅ FCM Diagnostics complete:', diagnostics);
      
    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      errors.push(`Diagnostic error: ${error}`);
      setDebugInfo({
        isIOS: false,
        isSafari: false,
        isPWA: false,
        userAgent: navigator.userAgent,
        fcmSupported: false,
        fcmInitialized: false,
        fcmToken: null,
        permissionStatus: 'error',
        serviceWorkerRegistered: false,
        serviceWorkerScope: '',
        deviceTokenSaved: false,
        errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forcePermissionRequest = async () => {
    setIsLoading(true);
    try {
      console.log('🔥 Force requesting FCM permission...');
      
      const success = await requestPermission();
      
      if (success) {
        toast.success('✅ FCM Permission granted successfully!');
        runDiagnostics(); // Refresh diagnostics
      } else {
        toast.error('❌ FCM Permission denied');
      }
      
    } catch (error) {
      console.error('❌ Force permission request error:', error);
      toast.error('❌ Errore nella richiesta di permesso FCM');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    setIsLoading(true);
    try {
      console.log('🔥 Testing notification via Firebase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          title: 'M1SSION™ Test Notification',
          body: 'Test FCM da Debug Page',
          broadcast: true
        }
      });

      if (error) {
        console.error('❌ Test notification error:', error);
        toast.error('❌ Test fallito: ' + error.message);
        setTestResults({ success: false, error: error.message });
      } else {
        console.log('✅ Test notification success:', data);
        toast.success('✅ Test FCM notification inviata!');
        setTestResults({ success: true, data });
      }
      
    } catch (error) {
      console.error('❌ Test notification error:', error);
      toast.error('❌ Test FCM notification fallito');
      setTestResults({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (!debugInfo) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔥 Firebase Cloud Messaging Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Caricamento diagnostica...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            🔥 Firebase Cloud Messaging Debug
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span>FCM Supported</span>
              {debugInfo.fcmSupported ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>FCM Initialized</span>
              {debugInfo.fcmInitialized ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Permission Status</span>
              <Badge variant={debugInfo.permissionStatus === 'granted' ? 'default' : 'destructive'}>
                {debugInfo.permissionStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Token Saved</span>
              {debugInfo.deviceTokenSaved ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          {debugInfo.fcmToken && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">FCM Token</div>
              <div className="text-xs font-mono break-all">{debugInfo.fcmToken.substring(0, 50)}...</div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={forcePermissionRequest}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              🔥 Attiva FCM
            </Button>
            
            <Button
              onClick={testNotification}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              📨 Test FCM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            📱 Device Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span>iOS Device</span>
              {debugInfo.isIOS ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Safari Browser</span>
              {debugInfo.isSafari ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>PWA Mode</span>
              {debugInfo.isPWA ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Service Worker</span>
              {debugInfo.serviceWorkerRegistered ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">User Agent</div>
            <div className="text-xs break-all">{debugInfo.userAgent}</div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {debugInfo.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              ⚠️ Errors & Warnings
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              📊 Test Results
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            🔧 Actions
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={runDiagnostics}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseNotificationDebug;