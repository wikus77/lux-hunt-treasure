/* M1SSION™ AG-X0197 */
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// FCM Debug Panel - Visible only in DEBUG mode

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFcm } from '@/hooks/useFcm';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const FCMDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [swInfo, setSwInfo] = useState<any>(null);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [edgeFunctionError, setEdgeFunctionError] = useState<string | null>(null);
  
  const { status, error, token, generate, isSupported, permission } = useFcm();

  // Check if debug mode is enabled
  useEffect(() => {
    const isDebug = window.location.search.includes('debug=true') ||
                   localStorage.getItem('fcm_debug') === 'true';
    setIsVisible(isDebug);
  }, []);

  // Get Service Worker info
  useEffect(() => {
    const getSwInfo = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const activeReg = registrations.find(reg => reg.active);
          
          setSwInfo({
            registered: registrations.length > 0,
            count: registrations.length,
            scope: activeReg?.scope || 'none',
            scriptURL: activeReg?.active?.scriptURL || 'none',
            state: activeReg?.active?.state || 'none'
          });
        } catch (error) {
          setSwInfo({ error: error.message });
        }
      }
    };
    
    if (isVisible) {
      getSwInfo();
    }
  }, [isVisible]);

  const testEdgeFunction = async () => {
    if (!token) return;
    
    setEdgeFunctionStatus('testing');
    setEdgeFunctionError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          token,
          title: 'M1SSION™ Debug Test',
          body: 'Edge Function connectivity test',
          data: { debug: true, timestamp: Date.now() }
        }
      });
      
      if (error) {
        setEdgeFunctionStatus('error');
        setEdgeFunctionError(error.message);
      } else {
        setEdgeFunctionStatus('success');
        console.log('[M1SSION FCM] edge function test → OK:', data);
      }
    } catch (err: any) {
      setEdgeFunctionStatus('error');
      setEdgeFunctionError(err.message || 'Network error');
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 bg-background/95 backdrop-blur-sm border-2 border-orange-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-orange-500 flex items-center justify-between">
          🔧 M1SSION™ FCM Debug Panel
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Browser Support */}
        <div className="flex items-center justify-between">
          <span>Browser Support:</span>
          {isSupported ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Supported
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Not Supported
            </Badge>
          )}
        </div>

        {/* Permissions */}
        <div className="flex items-center justify-between">
          <span>Notification Permission:</span>
          <Badge 
            variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}
            className={permission === 'granted' ? 'bg-green-600' : ''}
          >
            {permission || 'default'}
          </Badge>
        </div>

        {/* Service Worker */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Service Worker:</span>
            {swInfo ? (
              <Badge variant={swInfo.registered ? 'default' : 'destructive'} className={swInfo.registered ? 'bg-green-600' : ''}>
                {swInfo.registered ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {swInfo.registered ? 'Active' : 'None'}
              </Badge>
            ) : (
              <Badge variant="secondary">Loading...</Badge>
            )}
          </div>
          {swInfo && swInfo.registered && (
            <div className="text-xs text-muted-foreground pl-2 space-y-1">
              <div>Scope: {swInfo.scope}</div>
              <div>URL: {swInfo.scriptURL?.split('/').pop()}</div>
              <div>State: {swInfo.state}</div>
            </div>
          )}
        </div>

        {/* FCM Token Status */}
        <div className="flex items-center justify-between">
          <span>FCM Token:</span>
          <Badge 
            variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
            className={status === 'success' ? 'bg-green-600' : ''}
          >
            {status === 'loading' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
            {status}
          </Badge>
        </div>

        {token && (
          <div className="text-xs text-muted-foreground">
            Token: {token.substring(0, 16)}...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
            Error: {error}
          </div>
        )}

        {/* Generate Token Button */}
        <Button 
          onClick={generate} 
          disabled={status === 'loading'}
          size="sm"
          className="w-full"
        >
          {status === 'loading' ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            '🔄'
          )}
          Generate Token
        </Button>

        {/* Edge Function Test */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <span>Edge Function:</span>
            <Badge 
              variant={
                edgeFunctionStatus === 'success' ? 'default' : 
                edgeFunctionStatus === 'error' ? 'destructive' : 
                'secondary'
              }
              className={edgeFunctionStatus === 'success' ? 'bg-green-600' : ''}
            >
              {edgeFunctionStatus === 'testing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {edgeFunctionStatus === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
              {edgeFunctionStatus === 'error' && <XCircle className="h-3 w-3 mr-1" />}
              {edgeFunctionStatus}
            </Badge>
          </div>
          
          {edgeFunctionError && (
            <div className="text-xs text-red-500 bg-red-50 p-2 rounded mb-2">
              {edgeFunctionError}
            </div>
          )}
          
          <Button 
            onClick={testEdgeFunction}
            disabled={!token || edgeFunctionStatus === 'testing'}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {edgeFunctionStatus === 'testing' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              '📡'
            )}
            Test Push Send
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          AG-X0197 Debug Mode • {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};