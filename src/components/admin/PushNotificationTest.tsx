// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// DEPRECATED: OneSignal Push Notification Test Component
// Use FirebasePushNotificationTest instead

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PushNotificationTest = () => {
  const handleDeprecatedClick = () => {
    toast.info('🟧 OneSignal Deprecated', {
      description: 'Sistema notifiche push aggiornato a Firebase FCM - usa il nuovo test Firebase'
    });
  };

  return (
    <Card className="opacity-50 bg-muted/20">
      <CardHeader>
        <CardTitle className="text-muted-foreground">
          🟧 OneSignal Push Test (DEPRECATED)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            ⚠️ Questo componente è stato sostituito con Firebase Cloud Messaging
          </p>
          <Button 
            onClick={handleDeprecatedClick}
            disabled={true}
            variant="outline"
            className="opacity-50 cursor-not-allowed"
          >
            🟧 OneSignal Test (Non disponibile)
          </Button>
          <p className="text-xs text-orange-600 mt-2">
            Usa FirebasePushNotificationTest per i test delle notifiche push
          </p>
        </div>
      </CardContent>
    </Card>
  );
};