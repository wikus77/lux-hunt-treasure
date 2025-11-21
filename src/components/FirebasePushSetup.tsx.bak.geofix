// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Setup Component

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFcm } from '@/hooks/useFcm';
import { Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FirebasePushSetupProps {
  className?: string;
}

export const FirebasePushSetup: React.FC<FirebasePushSetupProps> = ({ className }) => {
  const {
    isSupported,
    permission,
    token,
    status,
    generate
  } = useFcm();

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  // Don't render if already granted and subscribed
  if (permission === 'granted' && token) {
    return null;
  }

  const handleActivateNotifications = async () => {
    await generate();
  };

  const getStatusIcon = () => {
    if (status === 'loading') {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
    
    if (permission === 'granted' && token) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (permission === 'denied') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (status === 'loading') {
      return 'Attivazione in corso...';
    }
    
    if (permission === 'granted' && token) {
      return 'Notifiche attive';
    }
    
    if (permission === 'denied') {
      return 'Permesso negato';
    }
    
    return 'Attiva le notifiche push';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {getStatusIcon()}
      
      <div className="flex-1">
        <p className="text-sm font-medium">{getStatusText()}</p>
        {permission === 'denied' && (
          <p className="text-xs text-muted-foreground">
            Abilita le notifiche dalle impostazioni del browser
          </p>
        )}
      </div>

      {permission !== 'granted' && permission !== 'denied' && (
        <Button
          onClick={handleActivateNotifications}
          disabled={status === 'loading'}
          variant="outline"
          size="sm"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Attiva
        </Button>
      )}
    </div>
  );
};

export default FirebasePushSetup;