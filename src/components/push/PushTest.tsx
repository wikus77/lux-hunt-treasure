// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Test Component */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PushTestResults } from './PushTestResults';

interface PushTestResult {
  sent: number;
  failed: number;
  removed: number;
  total_processed: number;
  results: Array<{
    endpoint_host: string;
    status?: string;
    error?: string;
    status_code?: number;
  }>;
}

export const PushTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PushTestResult | null>(null);

  const testPushNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // First check if there's an active subscription
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) {
        toast.error('Service Worker not registered');
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        toast.error('No push subscription found. Enable notifications first.');
        return;
      }

      console.log('Testing push with endpoint:', subscription.endpoint.substring(0, 50) + '...');

      // Send test push notification
      const { data, error } = await supabase.functions.invoke('push_send', {
        body: {
          endpoint: subscription.endpoint,
          title: 'M1SSION™ Test ✅',
          body: 'Push notification system is working!',
          url: '/settings'
        }
      });

      if (error) {
        console.error('Push send error:', error);
        toast.error(`Push failed: ${error.message}`);
        return;
      }

      console.log('Push result:', data);
      setResult(data);

      // P0 Fix: Real success only if no failures
      const sent = data.sent || 0;
      const failed = data.failed || 0;
      const passRate = sent + failed > 0 ? ((sent / (sent + failed)) * 100).toFixed(1) : '0.0';
      
      if (failed === 0 && sent > 0) {
        toast.success(`✅ Test completato con successo! Inviati: ${sent}, Pass rate: ${passRate}%`);
      } else if (sent > 0 && failed > 0) {
        toast.error(`⚠️ Test parzialmente fallito! Inviati: ${sent}, Falliti: ${failed}, Pass rate: ${passRate}%`);
      } else if (failed > 0) {
        toast.error(`❌ Test fallito! Inviati: ${sent}, Falliti: ${failed}`);
      } else {
        toast.warning('No subscriptions found to send to.');
      }

    } catch (error) {
      console.error('Push test error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Push Notification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test the push notification system by sending a notification to your current device.
        </p>
        
        <Button 
          onClick={testPushNotification}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : '🚀 Send Test Push'}
        </Button>

        <PushTestResults result={result} loading={isLoading} />
      </CardContent>
    </Card>
  );
};