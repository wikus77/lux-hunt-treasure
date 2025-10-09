// M1SSION™ Push Notifications Debug Page
// © 2025 Joseph MULÉ – Read-only diagnostics

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getVAPIDPublicWeb } from '@/lib/config/push';
import { enableWebPush } from '@/lib/push/enableWebPush';
import { toast } from 'sonner';

interface DiagnosticState {
  permission: NotificationPermission;
  hasSubscription: boolean;
  subscriptionEndpoint: string | null;
  sessionUserId: string | null;
  vapidKey: string;
  lastTestResult: {
    status: number;
    message: string;
    timestamp: string;
  } | null;
}

export default function PushDebug() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticState>({
    permission: 'default',
    hasSubscription: false,
    subscriptionEndpoint: null,
    sessionUserId: null,
    vapidKey: '',
    lastTestResult: null
  });
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      // Permission
      const permission = 'Notification' in window ? Notification.permission : 'default';
      
      // Subscription
      let hasSubscription = false;
      let subscriptionEndpoint: string | null = null;
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            hasSubscription = true;
            subscriptionEndpoint = sub.endpoint.slice(-8);
          }
        }
      }
      
      // Session
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUserId = session?.user?.id?.slice(0, 8) || null;
      
      // VAPID
      const vapidKey = getVAPIDPublicWeb().slice(0, 20) + '...';
      
      setDiagnostics({
        permission,
        hasSubscription,
        subscriptionEndpoint,
        sessionUserId,
        vapidKey,
        lastTestResult: diagnostics.lastTestResult
      });
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
    }
  };

  const testPushSubscribe = async () => {
    setLoading(true);
    try {
      await enableWebPush();
      
      setDiagnostics(prev => ({
        ...prev,
        lastTestResult: {
          status: 200,
          message: 'Push subscription successful',
          timestamp: new Date().toISOString()
        }
      }));
      
      toast.success('✅ Push enabled successfully');
      await loadDiagnostics();
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      
      setDiagnostics(prev => ({
        ...prev,
        lastTestResult: {
          status: error?.status || 500,
          message,
          timestamp: new Date().toISOString()
        }
      }));
      
      toast.error('❌ Push enable failed: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const testSendSelf = async () => {
    setSendingTest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error('❌ Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('webpush-send', {
        body: {
          audience: { user_id: session.user.id },
          payload: {
            title: '🧪 M1SSION Test',
            body: 'Push debug test notification (self)',
            url: '/notifications'
          }
        }
      });

      handleSendResult(data, error, 'Self');
    } catch (error: any) {
      handleSendError(error, 'Self');
    } finally {
      setSendingTest(false);
    }
  };

  const testSendAll = async () => {
    setSendingTest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error('❌ Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('webpush-send', {
        body: {
          audience: 'all',
          payload: {
            title: '🧪 M1SSION Broadcast',
            body: 'Push debug test notification (all users)',
            url: '/notifications'
          }
        }
      });

      handleSendResult(data, error, 'Broadcast');
    } catch (error: any) {
      handleSendError(error, 'Broadcast');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendResult = (data: any, error: any, type: string) => {
    if (error) {
      toast.error(`❌ ${type} send failed: ${error.message}`);
      setDiagnostics(prev => ({
        ...prev,
        lastTestResult: {
          status: 500,
          message: `${type} send error: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      }));
    } else if (data?.sent > 0) {
      toast.success(`✅ ${type} notification sent! (${data.sent}/${data.total})`);
      setDiagnostics(prev => ({
        ...prev,
        lastTestResult: {
          status: 200,
          message: `${type}: Sent ${data.sent} of ${data.total} notifications`,
          timestamp: new Date().toISOString()
        }
      }));
    } else {
      toast.warning(`⚠️ ${type}: No notifications sent (${data?.failed || 0} failed)`);
      setDiagnostics(prev => ({
        ...prev,
        lastTestResult: {
          status: 400,
          message: `${type} send failed: ${data?.failed || 0} failed`,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const handleSendError = (error: any, type: string) => {
    const message = error?.message || 'Unknown error';
    toast.error(`❌ ${type} send error: ${message}`);
    setDiagnostics(prev => ({
      ...prev,
      lastTestResult: {
        status: 500,
        message: `${type} send error: ${message}`,
        timestamp: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Push Debug</h1>
        <p className="text-muted-foreground">Read-only diagnostics for Web Push notifications</p>
      </div>

      <div className="space-y-4">
        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Permission:</span>
              <Badge variant={diagnostics.permission === 'granted' ? 'default' : 'destructive'}>
                {diagnostics.permission}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Has Subscription:</span>
              <Badge variant={diagnostics.hasSubscription ? 'default' : 'secondary'}>
                {diagnostics.hasSubscription ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            {diagnostics.subscriptionEndpoint && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Endpoint (last 8 chars):</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">...{diagnostics.subscriptionEndpoint}</code>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Session User ID:</span>
              {diagnostics.sessionUserId ? (
                <code className="text-xs bg-muted px-2 py-1 rounded">{diagnostics.sessionUserId}...</code>
              ) : (
                <Badge variant="secondary">Not logged in</Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">VAPID Key:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{diagnostics.vapidKey}</code>
            </div>
          </CardContent>
        </Card>

        {/* Test Result */}
        {diagnostics.lastTestResult && (
          <Card>
            <CardHeader>
              <CardTitle>Last Test Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={diagnostics.lastTestResult.status === 200 ? 'default' : 'destructive'}>
                  {diagnostics.lastTestResult.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Message:</span>
                <span className="text-xs text-muted-foreground">{diagnostics.lastTestResult.message}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Timestamp:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {new Date(diagnostics.lastTestResult.timestamp).toLocaleTimeString()}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testPushSubscribe} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : '🔔 Test Push Subscribe (Resubscribe)'}
            </Button>
            
            <Button 
              onClick={testSendSelf} 
              disabled={sendingTest || !diagnostics.hasSubscription}
              className="w-full"
              variant="secondary"
            >
              {sendingTest ? 'Sending...' : '📤 Test Send (Self)'}
            </Button>
            
            <Button 
              onClick={testSendAll} 
              disabled={sendingTest || !diagnostics.hasSubscription}
              className="w-full"
              variant="outline"
            >
              {sendingTest ? 'Sending...' : '📢 Test Send (All)'}
            </Button>
            
            <Button 
              onClick={loadDiagnostics} 
              variant="outline"
              className="w-full"
            >
              🔄 Refresh Diagnostics
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Flow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Permission should be "granted"</p>
            <p>2. Has Subscription should be "Yes"</p>
            <p>3. Session User ID should show a UUID fragment</p>
            <p>4. Test button should return status 200</p>
            <p className="pt-2 font-semibold text-foreground">If status is 401: Check Edge Function logs for JWT validation errors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
