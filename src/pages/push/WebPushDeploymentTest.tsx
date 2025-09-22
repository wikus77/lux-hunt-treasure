import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { testWebPushHealth, testWebPushWithSubscriptions, testWebPushWithUserIds, formatTestResult, type WebPushTestResult } from '@/utils/webpushTest';

export const WebPushDeploymentTest = () => {
  const [healthResult, setHealthResult] = useState<WebPushTestResult | null>(null);
  const [subscriptionTestResult, setSubscriptionTestResult] = useState<WebPushTestResult | null>(null);
  const [userIdTestResult, setUserIdTestResult] = useState<WebPushTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);

  const loadTestData = async () => {
    try {
      // Carica subscriptions attive dal database
      const { data: subsData } = await supabase
        .from('push_subscriptions')
        .select('*')
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
    } catch (error) {
      setHealthResult({
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
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
    } catch (error) {
      setSubscriptionTestResult({
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
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
    } catch (error) {
      setUserIdTestResult({
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
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

  React.useEffect(() => {
    loadTestData();
  }, []);

  const getStatusBadge = (result: WebPushTestResult | null) => {
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