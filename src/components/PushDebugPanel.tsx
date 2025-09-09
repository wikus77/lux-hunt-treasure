// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Debug Panel - Simple version

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentSubscription } from '@/utils/safeWebPushSubscribe';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const PushDebugPanel: React.FC = () => {
  const [isControlled, setIsControlled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [endpointHost, setEndpointHost] = useState<string>('');
  const [readyScope, setReadyScope] = useState<string>('');
  const [lastUpsertStatus, setLastUpsertStatus] = useState<string>('');
  const [lastUpsertError, setLastUpsertError] = useState<string>('');

  const updateStatus = async () => {
    try {
      const status = await getCurrentSubscription();
      setIsControlled(status.isControlled);
      setIsSubscribed(status.isSubscribed);
      
      if (status.subscription) {
        setEndpointHost(new URL(status.subscription.endpoint).hostname);
      } else {
        setEndpointHost('');
      }
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setReadyScope(registration.scope);
      }
      
      setLastUpsertStatus(localStorage.getItem('lastUpsertStatus') || '');
      setLastUpsertError(localStorage.getItem('lastUpsertError') || '');
      
    } catch (error) {
      console.error('[PUSH-DEBUG] Error updating status:', error);
    }
  };

  useEffect(() => { updateStatus(); }, []);

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <h3 className="font-medium">Push Debug</h3>
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          {isControlled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          Controller: {isControlled ? 'true' : 'false'}
        </div>
        <div className="flex items-center gap-2">
          {isSubscribed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          Subscribed: {isSubscribed ? 'true' : 'false'}
        </div>
        {readyScope && (
          <div className="text-xs text-muted-foreground">
            Ready scope: {readyScope}
          </div>
        )}
        {endpointHost && (
          <div className="text-xs text-muted-foreground">
            Endpoint: {endpointHost}
          </div>
        )}
        {lastUpsertStatus && (
          <div className="text-xs text-green-600">
            Last upsert: {lastUpsertStatus}
          </div>
        )}
        {lastUpsertError && (
          <div className="text-xs text-red-600">
            Last error: {lastUpsertError}
          </div>
        )}
      </div>
      <Button onClick={updateStatus} size="sm" variant="outline">
        <RefreshCw className="w-4 h-4 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

export default PushDebugPanel;