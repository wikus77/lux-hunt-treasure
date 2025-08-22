// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Push Notification Comprehensive Diagnostic System

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
import { getFCMToken, isFCMSupported } from '@/lib/firebase';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: string;
}

export const FirebaseNotificationDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [testTitle, setTestTitle] = useState('🔥 M1SSION™ Diagnostic Test');
  const [testBody, setTestBody] = useState('Sistema di notifiche Firebase funzionante');
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { permission, token, isSupported } = useFCMPushNotifications();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const addDiagnostic = (result: Omit<DiagnosticResult, 'timestamp'>) => {
    setDiagnostics(prev => [...prev, {
      ...result,
      timestamp: new Date().toISOString()
    }]);
  };

  const runComprehensiveDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnostics([]);

    try {
      // 1. Check FCM Browser Support
      const fcmSupported = isFCMSupported();
      addDiagnostic({
        component: 'FCM Browser Support',
        status: fcmSupported ? 'success' : 'error',
        message: fcmSupported ? 'Browser supports FCM' : 'Browser does not support FCM',
        details: {
          serviceWorker: 'serviceWorker' in navigator,
          notification: 'Notification' in window,
          userAgent: navigator.userAgent
        }
      });

      // 2. Check Service Worker Registration
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        addDiagnostic({
          component: 'Service Worker',
          status: registration ? 'success' : 'warning',
          message: registration ? 'Service Worker registered' : 'Service Worker not found',
          details: {
            scope: registration?.scope,
            active: !!registration?.active,
            installing: !!registration?.installing,
            waiting: !!registration?.waiting
          }
        });
      } catch (error) {
        addDiagnostic({
          component: 'Service Worker',
          status: 'error',
          message: 'Service Worker check failed',
          details: { error: error.message }
        });
      }

      // 3. Check Notification Permission
      addDiagnostic({
        component: 'Notification Permission',
        status: permission === 'granted' ? 'success' : permission === 'denied' ? 'error' : 'warning',
        message: `Permission status: ${permission}`,
        details: { permission }
      });

      // 4. Check FCM Token Generation
      try {
        const fcmToken = await getFCMToken();
        addDiagnostic({
          component: 'FCM Token Generation',
          status: fcmToken ? 'success' : 'error',
          message: fcmToken ? 'FCM Token generated successfully' : 'Failed to generate FCM token',
          details: {
            tokenLength: fcmToken?.length,
            tokenPreview: fcmToken?.substring(0, 20) + '...',
            hasToken: !!fcmToken
          }
        });
      } catch (error) {
        addDiagnostic({
          component: 'FCM Token Generation',
          status: 'error',
          message: 'FCM Token generation failed',
          details: { error: error.message }
        });
      }

      // 5. Check Database Token Storage
      try {
        const { data: userTokens, error } = await supabase
          .from('user_push_tokens')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('is_active', true);

        addDiagnostic({
          component: 'Database Token Storage',
          status: userTokens && userTokens.length > 0 ? 'success' : 'warning',
          message: userTokens && userTokens.length > 0 ? 
            `Found ${userTokens.length} active tokens` : 
            'No active FCM tokens in database',
          details: {
            tokenCount: userTokens?.length || 0,
            tokens: userTokens?.map(t => ({
              created: t.created_at,
              deviceInfo: t.device_info,
              tokenPreview: t.fcm_token?.substring(0, 20) + '...'
            }))
          }
        });
      } catch (error) {
        addDiagnostic({
          component: 'Database Token Storage',
          status: 'error',
          message: 'Database token check failed',
          details: { error: error.message }
        });
      }

      // 6. Check Supabase Edge Function Availability
      try {
        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
          body: { test: true }
        });
        
        addDiagnostic({
          component: 'Edge Function Availability',
          status: error ? 'error' : 'success',
          message: error ? 'Edge function not accessible' : 'Edge function accessible',
          details: { error: error?.message, data }
        });
      } catch (error) {
        addDiagnostic({
          component: 'Edge Function Availability',
          status: 'error',
          message: 'Edge function test failed',
          details: { error: error.message }
        });
      }

      // 7. Check Admin Logs for Firebase Activity
      try {
        const { data: logs } = await supabase
          .from('admin_logs')
          .select('*')
          .or('event_type.ilike.%firebase%,note.ilike.%firebase%,note.ilike.%FCM%')
          .order('created_at', { ascending: false })
          .limit(10);

        addDiagnostic({
          component: 'Firebase Activity Logs',
          status: logs && logs.length > 0 ? 'success' : 'warning',
          message: logs && logs.length > 0 ? 
            `Found ${logs.length} recent Firebase logs` : 
            'No recent Firebase activity in logs',
          details: {
            logCount: logs?.length || 0,
            recentLogs: logs?.map(l => ({
              event: l.event_type,
              timestamp: l.created_at,
              note: l.note
            }))
          }
        });
      } catch (error) {
        addDiagnostic({
          component: 'Firebase Activity Logs',
          status: 'error',
          message: 'Log check failed',
          details: { error: error.message }
        });
      }

    } catch (error) {
      addDiagnostic({
        component: 'Diagnostic System',
        status: 'error',
        message: 'Diagnostic failed',
        details: { error: error.message }
      });
    }

    setIsRunningDiagnostic(false);
  };

  const sendTestNotification = async () => {
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    setIsTestingNotification(true);

    try {
      console.log('🔥 FCM-TRACE: Sending test notification...', {
        userId: currentUserId,
        title: testTitle,
        body: testBody
      });

      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          user_id: currentUserId,
          title: testTitle,
          body: testBody,
          data: {
            test: 'true',
            source: 'diagnostic_panel',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('❌ Test notification failed:', error);
        toast.error(`Test notification failed: ${error.message}`);
        
        addDiagnostic({
          component: 'Test Notification Send',
          status: 'error',
          message: 'Test notification failed',
          details: { error: error.message }
        });
      } else {
        console.log('✅ Test notification sent:', data);
        toast.success('Test notification sent successfully!');
        
        addDiagnostic({
          component: 'Test Notification Send',
          status: 'success',
          message: 'Test notification sent successfully',
          details: { response: data }
        });
      }

      // Log the test in admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_diagnostic_test',
          user_id: currentUserId,
          note: `Firebase diagnostic test notification sent: ${testTitle}`,
          context: 'firebase_diagnostic'
        });

    } catch (error) {
      console.error('❌ Test notification error:', error);
      toast.error(`Test notification error: ${error.message}`);
      
      addDiagnostic({
        component: 'Test Notification Send',
        status: 'error',
        message: 'Test notification error',
        details: { error: error.message }
      });
    }

    setIsTestingNotification(false);
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            🔬 Firebase Push Notification Diagnostic
            <Badge variant="outline" className="bg-primary/10">
              Comprehensive Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runComprehensiveDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex-1"
            >
              {isRunningDiagnostic ? 'Running Diagnostic...' : '🔍 Run Full Diagnostic'}
            </Button>
          </div>

          {diagnostics.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-semibold">Diagnostic Results:</h4>
              
              {diagnostics.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)} mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.component}</span>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧪 Live Notification Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">Test Title</Label>
            <Input
              id="test-title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-body">Test Body</Label>
            <Textarea
              id="test-body"
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm">
            <strong>Current Status:</strong><br />
            User ID: {currentUserId || 'Not authenticated'}<br />
            FCM Support: {isSupported ? '✅' : '❌'}<br />
            Permission: {permission || 'Unknown'}<br />
            Token: {token ? '✅ Generated' : '❌ Missing'}
          </div>

          <Button 
            onClick={sendTestNotification}
            disabled={isTestingNotification || !currentUserId || !testTitle || !testBody}
            className="w-full"
          >
            {isTestingNotification ? 'Sending...' : '📨 Send Test Notification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};