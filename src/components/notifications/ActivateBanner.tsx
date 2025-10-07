/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Banner CTA per attivazione push notifications
 * Mostrato solo se PUSH_ACTIVATE_UI=on e utente senza subscription
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushActivation } from '@/hooks/usePushActivation';

interface ActivateBannerProps {
  onDismiss?: () => void;
}

export const ActivateBanner = ({ onDismiss }: ActivateBannerProps) => {
  const { activate, isActivating } = usePushActivation();

  const handleActivate = async () => {
    const result = await activate();
    if (result.success && onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            🚀 Attiva le notifiche M1SSION™
          </h3>
          <p className="text-sm text-muted-foreground">
            Ricevi aggiornamenti in tempo reale su BUZZ, missioni e premi esclusivi
          </p>
        </div>
        
        <div className="flex gap-2">
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              disabled={isActivating}
            >
              Dopo
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleActivate}
            disabled={isActivating}
          >
            {isActivating ? 'Attivazione...' : 'Attiva ora'}
          </Button>
        </div>
      </div>
    </div>
  );
};
