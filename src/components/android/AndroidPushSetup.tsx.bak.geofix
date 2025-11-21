// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Android Push Notifications Setup Component

import React from 'react';
import { useAndroidPushNotifications } from '@/hooks/useAndroidPushNotifications';
import { Button } from '@/components/ui/button';
import { Smartphone, Bell, CheckCircle, AlertCircle } from 'lucide-react';

interface AndroidPushSetupProps {
  className?: string;
}

export const AndroidPushSetup: React.FC<AndroidPushSetupProps> = ({ className }) => {
  const {
    isSupported,
    isAndroid,
    isRegistered,
    token,
    permission,
    isLoading,
    error,
    requestPermissionAndRegister
  } = useAndroidPushNotifications();

  // Don't render if not Android
  if (!isAndroid || !isSupported) {
    return null;
  }

  const getStatusIcon = () => {
    if (isRegistered && token) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
    return <Bell className="w-5 h-5 text-m1ssion-blue" />;
  };

  const getStatusText = () => {
    if (isRegistered && token) {
      return 'Notifiche Android Attive';
    }
    if (permission === 'denied') {
      return 'Permessi Negati';
    }
    if (error) {
      return 'Errore Configurazione';
    }
    if (permission === 'granted' && !isRegistered) {
      return 'Registrazione in corso...';
    }
    return 'Attiva Notifiche Android';
  };

  const getStatusDescription = () => {
    if (isRegistered && token) {
      return 'Riceverai notifiche push native su Android';
    }
    if (permission === 'denied') {
      return 'Vai nelle impostazioni per abilitare le notifiche';
    }
    if (error) {
      return error;
    }
    return 'Abilita le notifiche push per ricevere aggiornamenti M1SSION';
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-m1ssion-blue" />
        <h3 className="text-lg font-bold text-white">Notifiche Push Android</h3>
      </div>

      <div className="flex items-start gap-3 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-white mb-1">
            {getStatusText()}
          </p>
          <p className="text-sm text-gray-300">
            {getStatusDescription()}
          </p>
        </div>
      </div>

      {!isRegistered && permission !== 'denied' && (
        <Button
          onClick={requestPermissionAndRegister}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Configurazione...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Attiva Notifiche
            </div>
          )}
        </Button>
      )}

      {permission === 'denied' && (
        <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-300">
            💡 Vai in Impostazioni → App → M1SSION → Notifiche per abilitarle manualmente
          </p>
        </div>
      )}

      {token && (
        <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-300">
            ✅ Token: {token.substring(0, 20)}...
          </p>
        </div>
      )}
    </div>
  );
};