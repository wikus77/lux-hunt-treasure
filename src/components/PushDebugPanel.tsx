// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Debug Panel - Simple version

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentSubscription } from '@/utils/safeWebPushSubscribe';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const PushDebugPanel: React.FC = () => {
  const [isControlled, setIsControlled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const updateStatus = async () => {
    const status = await getCurrentSubscription();
    setIsControlled(status.isControlled);
    setIsSubscribed(status.isSubscribed);
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
      </div>
      <Button onClick={updateStatus} size="sm" variant="outline">
        <RefreshCw className="w-4 h-4 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

export default PushDebugPanel;