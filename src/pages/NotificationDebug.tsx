// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getOneSignalConfig, getOneSignalInitConfig } from "@/config/oneSignalConfig";

// Using any type for OneSignal to avoid conflicts
declare const OneSignal: any;

const NotificationDebug = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>('default');
  const [deviceTokens, setDeviceTokens] = useState<any[]>([]);
  const { user } = useAuth();

  // OneSignal initialization
  const initializeOneSignal = async () => {
    try {
      console.log('🚀 ULTIMATE: Inizializzazione OneSignal...');
      
      if (typeof window === 'undefined') {
        console.log('🚀 ULTIMATE: Non in ambiente browser');
        return false;
      }

      if ((window as any).OneSignal) {
        console.log('🚀 ULTIMATE: OneSignal già caricato');
        return true;
      }

      // Load OneSignal script
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);

      return new Promise((resolve) => {
        script.onload = async () => {
          try {
            const config = getOneSignalInitConfig();
            console.log('🚀 ULTIMATE: Config OneSignal:', config);
            
            await (window as any).OneSignal.init(config);
            console.log('🚀 ULTIMATE: OneSignal inizializzato con successo!');
            
            setIsInitialized(true);
            resolve(true);
          } catch (error) {
            console.error('🚀 ULTIMATE: Errore inizializzazione:', error);
            resolve(false);
          }
        };
      });
    } catch (error) {
      console.error('🚀 ULTIMATE: Errore caricamento script:', error);
      return false;
    }
  };

  // Load device tokens from Supabase
  const loadDeviceTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('🚀 ULTIMATE: Errore caricamento token:', error);
      } else {
        setDeviceTokens(data || []);
        console.log('🚀 ULTIMATE: Token caricati:', data?.length);
      }
    } catch (error) {
      console.error('🚀 ULTIMATE: Exception caricamento token:', error);
    }
  };

  // Ultimate registration function
  const handleUltimateRegistration = async () => {
    setIsLoading(true);
    console.log('🚀 ULTIMATE: Inizio registrazione...');

    try {
      if (!isInitialized) {
        console.log('🚀 ULTIMATE: Inizializzazione OneSignal...');
        const initialized = await initializeOneSignal();
        if (!initialized) {
          throw new Error('Inizializzazione OneSignal fallita');
        }
      }

      if (!(window as any).OneSignal) {
        throw new Error('OneSignal non disponibile');
      }

      console.log('🚀 ULTIMATE: Richiesta permessi notifiche...');
      
      // Request notification permission
      await (window as any).OneSignal.Notifications.requestPermission();
      
      // Wait for user ID
      console.log('🚀 ULTIMATE: Attesa Player ID...');
      const currentPlayerId = await (window as any).OneSignal.User.PushSubscription.id;
      
      if (currentPlayerId) {
        setPlayerId(currentPlayerId);
        console.log('🚀 ULTIMATE: Player ID ottenuto:', currentPlayerId);
        
        // Save to Supabase if user is logged in
        if (user) {
          console.log('🚀 ULTIMATE: Salvataggio token in Supabase...');
          const { error } = await supabase
            .from('device_tokens')
            .upsert({
              user_id: user.id,
              token: currentPlayerId,
              device_type: 'onesignal_web',
              platform: navigator.platform || 'web'
            });

          if (error) {
            console.error('🚀 ULTIMATE: Errore salvataggio:', error);
          } else {
            console.log('🚀 ULTIMATE: Token salvato con successo!');
            await loadDeviceTokens();
          }
        }

        toast.success('🚀 REGISTRAZIONE ULTIMATE COMPLETATA!');
        console.log('🚀 ULTIMATE: Registrazione completata con successo!');
      } else {
        throw new Error('Player ID non ottenuto');
      }

    } catch (error) {
      console.error('🚀 ULTIMATE: Errore registrazione:', error);
      toast.error(`❌ Registrazione fallita: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification
  const handleTestNotification = async () => {
    if (!playerId) {
      toast.error('Registrati prima con il bottone ULTIMATE!');
      return;
    }

    try {
      console.log('🚀 ULTIMATE: Invio notifica test...');
      
      const { data, error } = await supabase.functions.invoke('send-push-notification-onesignal', {
        body: {
          user_id: user?.id,
          title: '🚀 ULTIMATE TEST M1SSION™',
          message: 'Notifica test OneSignal funzionante!',
          data: { test: true }
        }
      });

      if (error) {
        console.error('🚀 ULTIMATE: Errore invio:', error);
        toast.error(`❌ Errore: ${error.message}`);
      } else {
        console.log('🚀 ULTIMATE: Notifica inviata:', data);
        toast.success('✅ Notifica test inviata!');
      }
    } catch (error) {
      console.error('🚀 ULTIMATE: Exception invio:', error);
      toast.error('❌ Errore invio notifica');
    }
  };

  // Update permission status
  const updatePermissionStatus = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  useEffect(() => {
    initializeOneSignal();
    loadDeviceTokens();
    updatePermissionStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-center">
              🚀 NOTIFICATION DEBUG ULTIMATE - M1SSION™
            </CardTitle>
            <div className="text-center text-sm text-green-400 mt-2">
              ✅ PAGINA FUNZIONANTE - URL CORRETTA: {window.location.href}
            </div>
          </CardHeader>
        </Card>

        {/* Status Dashboard */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">📊 Status Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">OneSignal</div>
                <div className={`font-bold ${isInitialized ? 'text-green-400' : 'text-red-400'}`}>
                  {isInitialized ? '✅ Inizializzato' : '❌ Non inizializzato'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Permessi</div>
                <div className={`font-bold ${
                  permission === 'granted' ? 'text-green-400' : 
                  permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {permission}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Player ID</div>
                <div className={`font-bold ${playerId ? 'text-green-400' : 'text-red-400'}`}>
                  {playerId ? '✅ Ottenuto' : '❌ Mancante'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Token DB</div>
                <div className="font-bold text-cyan-400">{deviceTokens.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">🎯 Azioni Principali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Ultimate Registration Button */}
            <div className="text-center">
              <Button 
                onClick={handleUltimateRegistration}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg"
              >
                {isLoading ? '🔄 Registrando...' : '🚀 REGISTRATI ULTIMATE'}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={handleTestNotification}
                disabled={!playerId}
                className="bg-green-600 hover:bg-green-700"
              >
                📤 Test Notifica
              </Button>
              
              <Button 
                onClick={loadDeviceTokens}
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                🔄 Ricarica Token
              </Button>
              
              <Button 
                onClick={updatePermissionStatus}
                variant="outline"
                className="border-yellow-400 text-yellow-400"
              >
                📋 Aggiorna Status
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Debug Info */}
        {playerId && (
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400">✅ Player ID OneSignal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 p-4 rounded">
                <div className="text-xs font-mono text-green-400 break-all">
                  {playerId}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Tokens */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">📱 Token Dispositivi Registrati</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nessun token registrato. Usa il bottone ULTIMATE per registrarti!
              </div>
            ) : (
              <div className="space-y-3">
                {deviceTokens.map((tokenData) => (
                  <div key={tokenData.id} className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm">
                        <span className="text-cyan-400">{tokenData.device_type}</span>
                        <span className="text-gray-400 ml-2">
                          {new Date(tokenData.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-green-400">ID: {tokenData.id}</div>
                    </div>
                    <div className="text-xs font-mono text-gray-300 break-all">
                      {tokenData.token}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card className="bg-black/50 border-purple-400/30">
          <CardHeader>
            <CardTitle className="text-purple-400">🔧 Info Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">URL:</span>
                <span className="text-white ml-2">{window.location.href}</span>
              </div>
              <div>
                <span className="text-gray-400">Protocol:</span>
                <span className="text-white ml-2">{window.location.protocol}</span>
              </div>
              <div>
                <span className="text-gray-400">User Agent:</span>
                <span className="text-white ml-2 break-all">{navigator.userAgent}</span>
              </div>
              <div>
                <span className="text-gray-400">Service Worker:</span>
                <span className="text-white ml-2">
                  {'serviceWorker' in navigator ? '✅ Supportato' : '❌ Non supportato'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default NotificationDebug;