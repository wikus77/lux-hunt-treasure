// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Diagnostics Dashboard */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Smartphone, Globe, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { isAppleWebPush } from '@/lib/push/isAppleWebPush';

interface DiagnosticResult {
  isSupported: boolean;
  platform: string;
  browser: string;
  permission: NotificationPermission;
  serviceWorkerRegistered: boolean;
  activeSubscription: boolean;
  endpointType?: string;
  endpoint?: string;
}

export const PushDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
      const isChrome = /Chrome/.test(ua);
      const isEdge = /Edg/.test(ua);
      const isFirefox = /Firefox/.test(ua);
      
      let browser = 'Unknown';
      if (isSafari) browser = 'Safari';
      else if (isChrome) browser = 'Chrome';
      else if (isEdge) browser = 'Edge';
      else if (isFirefox) browser = 'Firefox';
      
      const platform = isIOS ? 'iOS' : 'Desktop/Android';
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      let serviceWorkerRegistered = false;
      let activeSubscription = false;
      let endpointType: string | undefined;
      let endpoint: string | undefined;
      
      if (isSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration('/');
          serviceWorkerRegistered = !!registration;
          
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              activeSubscription = true;
              endpoint = subscription.endpoint;
              
              if (endpoint.includes('web.push.apple.com') || endpoint.includes('api.push.apple.com')) {
                endpointType = 'Apple Push Service';
              } else if (endpoint.includes('fcm.googleapis.com')) {
                endpointType = 'Firebase Cloud Messaging';
              } else if (endpoint.includes('wns.notify.windows.com')) {
                endpointType = 'Windows Push Notification Service';
              } else {
                endpointType = 'Unknown Service';
              }
            }
          }
        } catch (error) {
          console.error('Error checking service worker/subscription:', error);
        }
      }
      
      const result: DiagnosticResult = {
        isSupported,
        platform,
        browser,
        permission: Notification.permission,
        serviceWorkerRegistered,
        activeSubscription,
        endpointType,
        endpoint
      };
      
      setDiagnostics(result);
      
    } catch (error) {
      console.error('Diagnostics error:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => (
    <Badge variant={status ? "default" : "destructive"} className="ml-2">
      {status ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
      {status ? trueText : falseText}
    </Badge>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Push Diagnostics
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runDiagnostics}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnostics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">System Information</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    Platform: <span className="font-mono">{diagnostics.platform}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    Browser: <span className="font-mono">{diagnostics.browser}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    Apple Device: 
                    {getStatusBadge(isAppleWebPush(), "Yes", "No")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">API Support</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    Push API: 
                    {getStatusBadge(diagnostics.isSupported, "Supported", "Not Supported")}
                  </div>
                  <div className="flex items-center justify-between">
                    Permission: 
                    <Badge variant={
                      diagnostics.permission === 'granted' ? 'default' : 
                      diagnostics.permission === 'denied' ? 'destructive' : 'secondary'
                    }>
                      {diagnostics.permission}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    Service Worker: 
                    {getStatusBadge(diagnostics.serviceWorkerRegistered, "Registered", "Not Registered")}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Push Subscription Status</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  Active Subscription: 
                  {getStatusBadge(diagnostics.activeSubscription, "Active", "Inactive")}
                </div>
                
                {diagnostics.activeSubscription && diagnostics.endpointType && (
                  <>
                    <div className="flex items-center justify-between">
                      Service Type: 
                      <Badge variant="outline" className="ml-2">
                        <Globe className="h-3 w-3 mr-1" />
                        {diagnostics.endpointType}
                      </Badge>
                    </div>
                    
                    {diagnostics.endpoint && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Endpoint:</p>
                        <code className="text-xs bg-muted p-2 rounded block break-all">
                          {diagnostics.endpoint.substring(0, 100)}...
                        </code>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <div className="space-y-2 text-sm">
                {!diagnostics.isSupported && (
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Push API not supported. Update your browser or use a supported browser.</span>
                  </div>
                )}
                
                {diagnostics.permission === 'denied' && (
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Notifications are blocked. Enable them in browser settings to receive push notifications.</span>
                  </div>
                )}
                
                {diagnostics.permission === 'default' && (
                  <div className="flex items-start gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Permission not granted yet. Enable notifications to receive push messages.</span>
                  </div>
                )}
                
                {!diagnostics.serviceWorkerRegistered && (
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Service Worker not registered. This is required for push notifications.</span>
                  </div>
                )}
                
                {diagnostics.isSupported && diagnostics.permission === 'granted' && diagnostics.serviceWorkerRegistered && diagnostics.activeSubscription && (
                  <div className="flex items-start gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Push notifications are fully configured and ready!</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Running diagnostics...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};