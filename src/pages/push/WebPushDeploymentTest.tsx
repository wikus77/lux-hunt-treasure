import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const PROJECT_REF = 'vkjrqirvdvjbemsfzxof';
const FUNCTIONS_URL = `https://${PROJECT_REF}.functions.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

export const WebPushDeploymentTest: React.FC = () => {
  const [healthResult, setHealthResult] = useState<any>(null);
  const [subscriptionTestResult, setSubscriptionTestResult] = useState<any>(null);
  const [userIdTestResult, setUserIdTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);

  const formatTestResult = (result: any): string => {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const details = result.data ? JSON.stringify(result.data, null, 2) : result.error;
    return `${status} (${result.status}) at ${result.timestamp}\n${details}`;
  };

  const testWebPushHealth = async () => {
    console.log('🔍 Testing webpush-send health endpoint...');
    
    try {
      const response = await fetch(`${FUNCTIONS_URL}/webpush-send/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawResponse: text };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const testWebPushWithSubscriptions = async (subs: any[]) => {
    console.log('🔍 Testing webpush-send with subscriptions...');
    
    const payload = {
      title: "M1SSION™ Test ✅",
      body: "Push notification system test - catena blindata ripristinata!",
      url: "https://m1ssion.eu/home"
    };
    
    try {
      const response = await fetch(`${FUNCTIONS_URL}/webpush-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          subscriptions: subs,
          payload
        })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawResponse: text };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const testWebPushWithUserIds = async (ids: string[]) => {
    console.log('🔍 Testing webpush-send with user_ids...');
    
    const payload = {
      title: "M1SSION™ User Test ✅",
      body: "Push notification system test via user_ids - catena blindata ripristinata!",
      url: "https://m1ssion.eu/home"
    };
    
    try {
      const response = await fetch(`${FUNCTIONS_URL}/webpush-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_ids: ids,
          payload
        })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawResponse: text };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  };

  const loadTestData = async () => {
    try {
      const { data: subsData } = await (supabase as any)
        .from('push_subscriptions')
        .select('user_id,endpoint,endpoint_type,is_active')
        .eq('is_active', true)
        .limit(3);
      
      if (subsData) {
        setSubscriptions(subsData);
        setUserIds(subsData.map((s: any) => s.user_id).filter(Boolean));
      }
    } catch (error) {
      console.error('Errore caricamento dati test:', error);
    }
  };

  const runHealthTest = async () => {
    setIsLoading(true);
    try {
      const result = await testWebPushHealth();
      setHealthResult(result);
    } catch (error: any) {
      setHealthResult({
        success: false,
        status: 0,
        error: error?.message || 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  };

  const runSubscriptionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testWebPushWithSubscriptions(subscriptions);
      setSubscriptionTestResult(result);
    } catch (error: any) {
      setSubscriptionTestResult({
        success: false,
        status: 0,
        error: error?.message || 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  };

  const runUserIdTest = async () => {
    setIsLoading(true);
    try {
      const result = await testWebPushWithUserIds(userIds);
      setUserIdTestResult(result);
    } catch (error: any) {
      setUserIdTestResult({
        success: false,
        status: 0,
        error: error?.message || 'Errore sconosciuto',
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  };

  const runAllTests = async () => {
    await loadTestData();
    await runHealthTest();
    if (subscriptions.length > 0) {
      await runSubscriptionTest();
      await runUserIdTest();
    }
  };

  useEffect(() => {
    loadTestData();
  }, []);

  const getStatusBadge = (result: any) => {
    if (!result) return <Badge variant="secondary">Non testato</Badge>;
    return result.success ? 
      <Badge variant="default" className="bg-success">✅ SUCCESS</Badge> : 
      <Badge variant="destructive">❌ FAILED</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">M1SSION™ WebPush Deployment Test</h1>
        <p className="text-muted-foreground">Test completo catena push blindata - FASE 1: VERIFICA DEPLOYMENT</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={runAllTests} disabled={isLoading} className="bg-gradient-primary">
          {isLoading ? 'Testing...' : 'Run All Tests'}
        </Button>
        <Button onClick={loadTestData} variant="outline">
          Reload Test Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Health Check
              {getStatusBadge(healthResult)}
            </CardTitle>
            <CardDescription>Verifica deployment function</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runHealthTest} disabled={isLoading} className="w-full mb-4">
              Test Health Endpoint
            </Button>
            {healthResult && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {formatTestResult(healthResult)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Subscription Test
              {getStatusBadge(subscriptionTestResult)}
            </CardTitle>
            <CardDescription>{subscriptions.length} subscriptions caricate</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runSubscriptionTest} disabled={isLoading || subscriptions.length === 0} className="w-full mb-4">
              Test Subscriptions
            </Button>
            {subscriptionTestResult && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {formatTestResult(subscriptionTestResult)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              User IDs Test
              {getStatusBadge(userIdTestResult)}
            </CardTitle>
            <CardDescription>{userIds.length} user IDs trovati</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runUserIdTest} disabled={isLoading || userIds.length === 0} className="w-full mb-4">
              Test User IDs
            </Button>
            {userIdTestResult && (
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {formatTestResult(userIdTestResult)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Active Subscriptions:</strong> {subscriptions.length}
            </div>
            <div>
              <strong>Test User IDs:</strong> {userIds.length}
            </div>
            <div className="col-span-2">
              <strong>Providers:</strong> {subscriptions.map((s: any) => s.endpoint_type).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚨 STATO DEPLOYMENT WEBPUSH-SEND</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Function logs:</span>
              <Badge variant="destructive">0 logs trovati</Badge>
            </div>
            <div className="flex justify-between">
              <span>VAPID secrets:</span>
              <Badge variant="default">Configurati</Badge>
            </div>
            <div className="flex justify-between">
              <span>Config supabase:</span>
              <Badge variant="default">verify_jwt = false</Badge>
            </div>
            <div className="p-3 bg-muted rounded mt-4">
              <p className="text-xs">
                ⚠️ CRITICAL: Function webpush-send non mostra logs - possibile problema deployment.<br/>
                📊 Database: 3 subscriptions attive (2 APNS, 1 FCM)<br/>
                🔑 VAPID: Public/Private keys configurati<br/>
                🎯 NEXT: Test health endpoint per verificare deployment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebPushDeploymentTest;