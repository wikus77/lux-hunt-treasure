// WebPush Test Console Page for M1SSION™
// Real-time testing of the webpush-send function

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestTube, Send, Users, Heart, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  testWebPushHealth, 
  testWebPushWithSubscriptions, 
  testWebPushWithUserIds,
  formatTestResult,
  type WebPushTestResult 
} from '@/utils/webpushTest';

interface TestLog {
  id: string;
  type: 'health' | 'subscriptions' | 'user_ids';
  result: WebPushTestResult;
  timestamp: string;
}

export const WebPushTestPage: React.FC = () => {
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const addLog = (type: TestLog['type'], result: WebPushTestResult) => {
    const log: TestLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      result,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [log, ...prev]);
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, endpoint_type, platform')
        .limit(5);
      
      if (error) throw error;
      
      // Convert to webpush format
      const formatted = data?.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        },
        provider: sub.endpoint_type
      })) || [];
      
      setSubscriptions(formatted);
      console.log(`📊 Loaded ${formatted.length} subscriptions from DB`);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  };

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  const runHealthTest = async () => {
    setIsLoading(true);
    try {
      const result = await testWebPushHealth();
      addLog('health', result);
    } finally {
      setIsLoading(false);
    }
  };

  const runSubscriptionsTest = async () => {
    if (subscriptions.length === 0) {
      alert('No subscriptions loaded. Make sure push_subscriptions table has data.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await testWebPushWithSubscriptions(subscriptions);
      addLog('subscriptions', result);
    } finally {
      setIsLoading(false);
    }
  };

  const runUserIdsTest = async () => {
    setIsLoading(true);
    try {
      // Use current user or a test user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userIds = user ? [user.id] : ['495246c1-9154-4f01-a428-7f37fe230180'];
      
      const result = await testWebPushWithUserIds(userIds);
      addLog('user_ids', result);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  const getStatusBadge = (result: WebPushTestResult) => {
    if (result.success) {
      return <Badge className="bg-green-600 text-white">✅ SUCCESS</Badge>;
    }
    return <Badge variant="destructive">❌ FAILED</Badge>;
  };

  const getTypeIcon = (type: TestLog['type']) => {
    switch (type) {
      case 'health': return <Heart className="w-4 h-4" />;
      case 'subscriptions': return <Send className="w-4 h-4" />;
      case 'user_ids': return <Users className="w-4 h-4" />;
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
                <div className="text-2xl font-bold text-green-400">{logs.filter(l => l.result.success).length}</div>
                <div className="text-sm text-white/70">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{logs.filter(l => !l.result.success).length}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={runHealthTest}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Health Check
              </Button>
              
              <Button 
                onClick={runSubscriptionsTest}
                disabled={isLoading || subscriptions.length === 0}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Test Subscriptions
              </Button>
              
              <Button 
                onClick={runUserIdsTest}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Test User IDs
              </Button>
              
              <Button 
                onClick={loadSubscriptions}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Data
              </Button>
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
                    <div key={log.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="font-semibold text-white capitalize">
                            {log.type.replace('_', ' ')} Test
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.result)}
                          <span className="text-xs text-white/50">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="mb-1">
                          <span className="text-white/70">Status:</span> {log.result.status}
                        </div>
                        
                        {log.result.data && (
                          <div>
                            <span className="text-white/70">Response:</span>
                            <pre className="mt-1 p-2 bg-black/40 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.result.error && (
                          <div>
                            <span className="text-red-400">Error:</span>
                            <div className="mt-1 p-2 bg-red-900/20 rounded text-xs">
                              {log.result.error}
                            </div>
                          </div>
                        )}
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