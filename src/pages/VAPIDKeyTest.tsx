// © 2025 M1SSION™ – VAPID Key Configuration Test Page
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFCMToken } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const VAPIDKeyTest: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runCompleteVAPIDTest = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Check browser support
      const browserSupport = {
        serviceWorker: 'serviceWorker' in navigator,
        notification: 'Notification' in window,
        pushManager: 'serviceWorker' in navigator && 'PushManager' in window
      };
      results.tests.push({
        name: 'Browser Support',
        status: browserSupport.serviceWorker && browserSupport.notification ? 'PASS' : 'FAIL',
        details: browserSupport
      });

      // Test 2: Check notification permission
      const permission = Notification.permission;
      results.tests.push({
        name: 'Notification Permission',
        status: permission === 'granted' ? 'PASS' : permission === 'denied' ? 'BLOCKED' : 'PENDING',
        details: { permission }
      });

      // Test 3: Request permission if needed
      if (permission !== 'granted' && permission !== 'denied') {
        console.log('🔔 Requesting notification permission...');
        const newPermission = await Notification.requestPermission();
        results.tests.push({
          name: 'Permission Request',
          status: newPermission === 'granted' ? 'PASS' : 'FAIL',
          details: { newPermission }
        });
      }

      // Test 4: Test FCM token generation
      console.log('🔥 Testing FCM token generation...');
      const fcmToken = await getFCMToken();
      results.tests.push({
        name: 'FCM Token Generation',
        status: fcmToken ? 'PASS' : 'FAIL',
        details: { 
          hasToken: !!fcmToken,
          tokenLength: fcmToken?.length || 0,
          tokenPrefix: fcmToken?.substring(0, 20) || 'none'
        }
      });

      // Test 5: Save token to database if successful
      if (fcmToken && user) {
        console.log('💾 Saving FCM token to database...');
        const { error } = await supabase
          .from('user_push_tokens')
          .upsert({
            user_id: user.id,
            fcm_token: fcmToken,
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              timestamp: new Date().toISOString(),
              testGenerated: true
            },
            is_active: true
          }, {
            onConflict: 'user_id,fcm_token'
          });

        results.tests.push({
          name: 'Database Save',
          status: error ? 'FAIL' : 'PASS',
          details: { error: error?.message || null }
        });
      }

      // Test 6: Check existing tokens in database
      if (user) {
        const { data: tokens, error } = await supabase
          .from('user_push_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        results.tests.push({
          name: 'Database Check',
          status: !error && tokens && tokens.length > 0 ? 'PASS' : 'FAIL',
          details: { 
            tokenCount: tokens?.length || 0,
            error: error?.message || null,
            tokens: tokens?.map(t => ({
              id: t.id,
              created: t.created_at,
              tokenPrefix: t.fcm_token.substring(0, 20)
            })) || []
          }
        });
      }

    } catch (error) {
      console.error('❌ VAPID test error:', error);
      results.tests.push({
        name: 'Test Execution',
        status: 'ERROR',
        details: { error: error.message }
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'default';
      case 'FAIL': return 'destructive';
      case 'BLOCKED': return 'destructive';
      case 'PENDING': return 'secondary';
      case 'ERROR': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-black/40 border-[#00D1FF]/20">
          <CardHeader>
            <CardTitle className="text-[#00D1FF] font-orbitron">
              🔥 M1SSION™ VAPID Key & FCM Complete Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runCompleteVAPIDTest}
              disabled={loading}
              className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
            >
              {loading ? '🔄 Running Complete Test...' : '🚀 Run Complete VAPID & FCM Test'}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <Card className="bg-black/40 border-[#00D1FF]/20">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
              <p className="text-white/70 text-sm">
                Generated: {new Date(testResults.timestamp).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.tests.map((test: any, index: number) => (
                <div key={index} className="border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{test.name}</h3>
                    <Badge variant={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  <pre className="text-xs text-white/70 bg-black/40 p-2 rounded overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VAPIDKeyTest;