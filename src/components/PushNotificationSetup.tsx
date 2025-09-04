// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Unified Push Notifications Setup Component (iOS + Android)

import React from 'react';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Bell, CheckCircle, AlertCircle, Apple } from 'lucide-react';

interface PushNotificationSetupProps {
  className?: string;
}

export const PushNotificationSetup: React.FC<PushNotificationSetupProps> = ({ className }) => {
  const {
    isSupported,
    isRegistered,
    token,
    permission,
    isLoading,
    error,
    platform,
    requestPermissionAndRegister
  } = useNativePushNotifications();

  // Don't render if not mobile or not supported
  if (platform === 'web' || !isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifiche Push
          </CardTitle>
          <CardDescription>
            Le notifiche push native sono disponibili solo su dispositivi mobili
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getPlatformIcon = () => {
    if (platform === 'ios') return <Apple className="w-4 h-4" />;
    if (platform === 'android') return <Smartphone className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getPlatformLabel = () => {
    if (platform === 'ios') return 'iOS';
    if (platform === 'android') return 'Android';
    return 'Mobile';
  };

  const getStatusColor = () => {
    if (isRegistered) return 'bg-green-500';
    if (permission === 'denied') return 'bg-red-500';
    if (permission === 'granted') return 'bg-yellow-500';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (isRegistered) return 'Attive';
    if (permission === 'denied') return 'Negati';
    if (permission === 'granted') return 'In corso...';
    return 'Non configurate';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifiche Push Native
          <Badge variant="outline" className="ml-auto">
            {getPlatformIcon()}
            <span className="ml-1">{getPlatformLabel()}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Ricevi notifiche push native per aggiornamenti importanti della missione
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium">Stato: {getStatusText()}</span>
          </div>
          {isRegistered && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>

        {/* Token Info (for debugging) */}
        {token && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Token: {token.substring(0, 20)}...
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Permission Denied Message */}
        {permission === 'denied' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              I permessi per le notifiche sono stati negati. 
              Per attivarle, vai nelle impostazioni del dispositivo e 
              abilita le notifiche per M1SSION.
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isRegistered && permission !== 'denied' && (
          <Button
            onClick={requestPermissionAndRegister}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Configurazione...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Attiva Notifiche Push
              </>
            )}
          </Button>
        )}

        {/* Success State */}
        {isRegistered && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              ✅ Notifiche push {getPlatformLabel()} configurate correttamente!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};