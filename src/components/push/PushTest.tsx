// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Test Component */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

      if (data.sent > 0) {
        toast.success(`Push notification sent successfully! Check your device.`);
      } else if (data.failed > 0) {
        toast.error(`Push failed. Check console for details.`);
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

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Badge variant={result.sent > 0 ? 'default' : 'secondary'}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Sent: {result.sent}
              </Badge>
              <Badge variant={result.failed > 0 ? 'destructive' : 'secondary'}>
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed: {result.failed}
              </Badge>
              {result.removed > 0 && (
                <Badge variant="outline">
                  Removed: {result.removed}
                </Badge>
              )}
            </div>

            {result.results.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="font-medium">Results:</p>
                {result.results.map((r, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{r.endpoint_host}</span>
                    <span className={r.error ? 'text-red-500' : 'text-green-500'}>
                      {r.error || r.status || 'success'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};