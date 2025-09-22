// WebPush Test Console Page for M1SSION™
// Real-time testing of the webpush-send function

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestTube, Send, Users, Heart, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestLog {
  id: string;
  type: 'health' | 'subscriptions' | 'user_ids' | 'debug';
  request: any;
  response: any;
  timestamp: string;
  success: boolean;
}

export const WebPushTestPage: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [testUserId, setTestUserId] = useState('495246c1-9154-4f01-a428-7f37fe230180');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const addLog = (type: TestLog['type'], request: any, response: any, success: boolean) => {
    const log: TestLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      request,
      response,
      timestamp: new Date().toISOString(),
      success
    };
    setLogs(prev => [log, ...prev].slice(0, 10)); // Keep only last 10 logs
  };

  const loadSubscriptions = async () => {
    try {
      // Load from new webpush_subscriptions table
      const { data, error } = await supabase
        .from('webpush_subscriptions')
        .select('endpoint, keys, provider, platform')
        .limit(5);
      
      if (error) throw error;
      
      // Already in correct format
      setSubscriptions(data || []);
      console.log(`📊 Loaded ${data?.length || 0} subscriptions from new webpush_subscriptions table`);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      // Fallback to old table
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth, endpoint_type, platform')
          .limit(5);
        
        if (error) throw error;
        
        const formatted = data?.map(sub => ({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          },
          provider: sub.endpoint_type
        })) || [];
        
        setSubscriptions(formatted);
        console.log(`📊 Loaded ${formatted.length} subscriptions from fallback push_subscriptions table`);
      } catch (fallbackError) {
        console.error('Failed to load from fallback table too:', fallbackError);
      }
    }
  };

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  const testHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-send/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const data = await response.json();
      const success = response.ok;
      
      addLog('health', { endpoint: '/health' }, data, success);
      
      toast({
        title: success ? "✅ Health Check OK" : "❌ Health Check Failed",
        description: `VAPID Public: ${data.vapidPublicKeySet}, Private: ${data.vapidPrivateKeySet}`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('health', { endpoint: '/health' }, { error: errorMsg }, false);
      toast({
        title: "❌ Health Check Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDebug = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-send/debug`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const data = await response.json();
      const success = response.ok;
      
      addLog('debug', { endpoint: '/debug' }, data, success);
      
      toast({
        title: success ? "✅ Debug Info Retrieved" : "❌ Debug Failed",
        description: `VAPID configured: ${data.env?.vapidPublicKeySet && data.env?.vapidPrivateKeySet}`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('debug', { endpoint: '/debug' }, { error: errorMsg }, false);
      toast({
        title: "❌ Debug Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: "❌ Not Supported",
        description: "Push notifications not supported on this device",
        variant: "destructive"
      });
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        toast({
          title: "ℹ️ No Subscription",
          description: "No active push subscription found",
        });
        return null;
      }

      const sub = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth
        }
      };

      setCurrentSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  };

  const testSendToDevice = async () => {
    const sub = await getCurrentSubscription();
    if (!sub) return;

    setIsLoading(true);
    try {
      const payload = {
        subscriptions: [sub],
        payload: {
          title: "Test M1SSION™ Push",
          body: "This is a test notification from WebPush Admin Panel",
          url: "/settings/notifications"
        }
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      const success = response.ok && data.success;
      
      addLog('subscriptions', payload, data, success);
      
      toast({
        title: success ? "✅ Push Sent" : "❌ Push Failed",
        description: success ? `Sent to ${data.sent}/${data.total} devices` : data.error,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('subscriptions', { currentDevice: true }, { error: errorMsg }, false);
      toast({
        title: "❌ Send Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSendByUserId = async () => {
    if (!testUserId.trim()) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter a valid User ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        user_ids: [testUserId.trim()],
        payload: {
          title: "Admin Test Push",
          body: "Test notification sent to specific user via Admin Panel",
          url: "/notifications"
        }
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      const success = response.ok && data.success;
      
      addLog('user_ids', payload, data, success);
      
      toast({
        title: success ? "✅ Push Sent" : "❌ Push Failed",
        description: success ? `Sent to ${data.sent}/${data.total} users` : data.error,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('user_ids', { user_ids: [testUserId] }, { error: errorMsg }, false);
      toast({
        title: "❌ Send Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  const getStatusBadge = (success: boolean) => {
    if (success) {
      return <Badge className="bg-green-600 text-white">✅ SUCCESS</Badge>;
    }
    return <Badge variant="destructive">❌ FAILED</Badge>;
  };

  const getTypeIcon = (type: TestLog['type']) => {
    switch (type) {
      case 'health': return <Heart className="w-4 h-4" />;
      case 'subscriptions': return <Send className="w-4 h-4" />;
      case 'user_ids': return <Users className="w-4 h-4" />;
      case 'debug': return <TestTube className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-black/40 border-[#00D1FF]/20">
          <CardHeader>
            <CardTitle className="text-[#00D1FF] font-orbitron flex items-center gap-2">
              <TestTube className="w-6 h-6" />
              M1SSION™ WebPush Test Console
            </CardTitle>
            <p className="text-white/70">
              Test della catena push blindata ripristinata - webpush-send function
            </p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <Card className="bg-black/40 border-white/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00D1FF]">{subscriptions.length}</div>
                <div className="text-sm text-white/70">Subscriptions Loaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{logs.filter(l => l.success).length}</div>
                <div className="text-sm text-white/70">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{logs.filter(l => !l.success).length}</div>
                <div className="text-sm text-white/70">Tests Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{logs.length}</div>
                <div className="text-sm text-white/70">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                onClick={testHealth}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Health Check
              </Button>
              
              <Button 
                onClick={testDebug}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Debug Info
              </Button>
              
              <Button 
                onClick={testSendToDevice}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send to Device
              </Button>
              
              <Button 
                onClick={loadSubscriptions}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Data
              </Button>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="User ID"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-xs"
                />
                <Button 
                  onClick={testSendByUserId}
                  disabled={isLoading || !testUserId.trim()}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  Send to User
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={clearLogs}
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white"
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Subscription Display */}
        {currentSubscription && (
          <Card className="bg-blue-900/20 border-blue-700/50">
            <CardHeader>
              <CardTitle className="text-white">Current Device Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono text-white/70 bg-black/40 p-4 rounded-lg overflow-x-auto">
                <pre>{JSON.stringify(currentSubscription, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {logs.length === 0 ? (
                <div className="text-center text-white/50 py-8">
                  No tests run yet. Click a test button above to start.
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className={`border rounded-lg p-4 ${
                      log.success 
                        ? 'border-green-700/50 bg-green-900/20' 
                        : 'border-red-700/50 bg-red-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="font-semibold text-white capitalize">
                            {log.type.replace('_', ' ')} Test
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.success)}
                          <span className="text-xs text-white/50">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-white/70 text-sm font-medium">Request:</span>
                          <div className="text-xs font-mono text-white/60 bg-black/50 p-2 rounded mt-1 overflow-x-auto">
                            <pre>{JSON.stringify(log.request, null, 2)}</pre>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-white/70 text-sm font-medium">Response:</span>
                          <div className="text-xs font-mono text-white/60 bg-black/50 p-2 rounded mt-1 overflow-x-auto">
                            <pre>{JSON.stringify(log.response, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};