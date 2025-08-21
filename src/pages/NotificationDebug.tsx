// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ

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
  const [iosDebugInfo, setIosDebugInfo] = useState<any>({});
  const [workerStatus, setWorkerStatus] = useState<string>('checking');
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const { user } = useAuth();

  // Check OneSignal worker availability
  const checkWorkerStatus = async () => {
    try {
      const workerResponse = await fetch('/OneSignalSDKWorker.js');
      const updaterResponse = await fetch('/OneSignalSDKUpdaterWorker.js');
      
      if (workerResponse.ok && updaterResponse.ok) {
        setWorkerStatus('✅ Worker files accessible');
        console.log('🛰️ ULTIMATE iOS: Worker files OK');
      } else {
        setWorkerStatus('❌ Worker files missing');
        console.error('🛰️ ULTIMATE iOS: Worker files MISSING');
      }
    } catch (error) {
      setWorkerStatus('❌ Worker check failed');
      console.error('🛰️ ULTIMATE iOS: Worker check error:', error);
    }
  };

  // Detect iOS and Safari
  const detectiOSEnvironment = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    const iosInfo = {
      isIOS,
      isSafari,
      isStandalone,
      isPWA,
      userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      notificationSupport: 'Notification' in window,
      serviceWorkerSupport: 'serviceWorker' in navigator
    };
    
    setIosDebugInfo(iosInfo);
    console.log('🛰️ ULTIMATE iOS Environment:', iosInfo);
    return iosInfo;
  };

  // OneSignal initialization with iOS Safari BYPASS MODE - ULTIMATE FIX
  const initializeOneSignal = async () => {
    try {
      console.log('🛰️ ULTIMATE iOS: Inizializzazione OneSignal con BYPASS completo...');
      
      if (typeof window === 'undefined') {
        console.log('🛰️ ULTIMATE iOS: Non in ambiente browser');
        return false;
      }

      // Detect iOS environment first
      const iosInfo = detectiOSEnvironment();
      console.log('🛰️ ULTIMATE iOS: Environment detected:', iosInfo);

      // Clear any existing OneSignal instance completely
      if ((window as any).OneSignal) {
        console.log('🛰️ ULTIMATE iOS: Clearing existing OneSignal instance...');
        try {
          await (window as any).OneSignal.logout();
          delete (window as any).OneSignalDeferred;
          delete (window as any).OneSignalSDK;
        } catch (e) {
          console.log('🛰️ ULTIMATE iOS: Cleanup completed');
        }
        delete (window as any).OneSignal;
      }

      // Remove existing script if present
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) {
        existingScript.remove();
        console.log('🛰️ ULTIMATE iOS: Removed existing OneSignal script');
      }

      // Load OneSignal script with fresh instance
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);

      return new Promise((resolve) => {
        script.onload = async () => {
          try {
            // Wait for OneSignal to be available
            let attempts = 0;
            while (!(window as any).OneSignal && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }

            if (!(window as any).OneSignal) {
              throw new Error('OneSignal script loaded but object not available');
            }

            // iOS Safari BYPASS configuration - ULTIMATE FIX
            const config = {
              appId: "5e0cb75f-f065-4626-9a63-ce5692f7a7e0", // CORRECT App ID
              allowLocalhostAsSecureOrigin: true,
              // iOS Safari BYPASS MODE
              requiresUserPrivacyConsent: false,
              autoRegister: false, // Manual control for iOS
              autoResubscribe: true,
              // Service Worker configuration
              serviceWorkerPath: '/OneSignalSDKWorker.js',
              serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
              serviceWorkerParam: { scope: '/' },
              // iOS Safari Web Push BYPASS
              safari_web_id: undefined, // Let OneSignal auto-detect
              // CRITICAL: Disable domain validation for localhost testing
              restrictedOriginValidation: false,
              // HTTP permission request (for non-HTTPS environments)
              httpPermissionRequest: {
                enable: true,
                useModal: true
              },
              // Notification options
              notifyButton: { enable: false },
              persistNotification: true,
              // BYPASS MODE: Force initialization regardless of origin
              __BYPASS_ORIGIN_VALIDATION: true
            };
            
            console.log('🛰️ ULTIMATE iOS: BYPASS Config OneSignal:', config);
            console.log('🛰️ ULTIMATE iOS: Environment info:', iosInfo);
            console.log('🛰️ ULTIMATE iOS: Current URL:', window.location.href);
            console.log('🛰️ ULTIMATE iOS: Current Origin:', window.location.origin);
            
            // Initialize with BYPASS mode
            await (window as any).OneSignal.init(config);
            console.log('🛰️ ULTIMATE iOS: OneSignal BYPASS initialization completed!');
            
            // Set up OneSignal listeners
            (window as any).OneSignal.push(() => {
              console.log("🛰️ ULTIMATE iOS: OneSignal ready with BYPASS mode");
            });
            
            // Immediate status check
            setTimeout(async () => {
              await checkOneSignalStatus();
            }, 1000);
            
            setIsInitialized(true);
            resolve(true);
          } catch (error) {
            console.error('🛰️ ULTIMATE iOS: BYPASS initialization error:', error);
            console.error('🛰️ ULTIMATE iOS: Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
            
            // Try alternative initialization for iOS Safari
            if (iosInfo.isIOS && iosInfo.isSafari) {
              console.log('🛰️ ULTIMATE iOS: Attempting iOS Safari fallback...');
              try {
                // Direct permission request for iOS Safari
                const permission = await Notification.requestPermission();
                console.log('🛰️ ULTIMATE iOS: Native permission result:', permission);
                if (permission === 'granted') {
                  console.log('🛰️ ULTIMATE iOS: iOS Safari manual permission granted');
                  setPermission(permission);
                  resolve(true);
                } else {
                  resolve(false);
                }
              } catch (fallbackError) {
                console.error('🛰️ ULTIMATE iOS: Fallback failed:', fallbackError);
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        };
        
        script.onerror = (error) => {
          console.error('🛰️ ULTIMATE iOS: Script loading failed:', error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('🛰️ ULTIMATE iOS: BYPASS setup error:', error);
      return false;
    }
  };

  // Check OneSignal status - iOS specific
  const checkOneSignalStatus = async () => {
    try {
      if (!(window as any).OneSignal) return;

      const OneSignal = (window as any).OneSignal;
      
      // Check subscription status
      const isEnabled = await OneSignal.isPushNotificationsEnabled();
      const userId = await OneSignal.getUserId();
      const notificationPermission = await OneSignal.getNotificationPermission();
      
      setSubscriptionStatus(isEnabled);
      setPlayerId(userId);
      setPermission(notificationPermission);
      
      console.log('🛰️ ULTIMATE iOS Status Check:', {
        isEnabled,
        userId,
        notificationPermission,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🛰️ ULTIMATE iOS: Errore check status:', error);
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

  // Ultimate registration function - iOS optimized with FIXED App ID
  const handleUltimateRegistration = async () => {
    setIsLoading(true);
    console.log('🛰️ ULTIMATE iOS: Inizio registrazione con App ID corretto...');

    try {
      // Always reinitialize to ensure clean state
      console.log('🛰️ ULTIMATE iOS: Forcing fresh initialization...');
      const initialized = await initializeOneSignal();
      if (!initialized) {
        throw new Error('Inizializzazione OneSignal fallita');
      }
      
      // Wait a bit for initialization to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!(window as any).OneSignal) {
        throw new Error('OneSignal non disponibile dopo inizializzazione');
      }

      const OneSignal = (window as any).OneSignal;
      
      console.log('🛰️ ULTIMATE iOS: Controllo supporto notifiche...');
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('Notifiche non supportate su questo browser');
      }
      
      console.log('🛰️ ULTIMATE iOS: Richiesta permessi notifiche...');
      console.log('🛰️ ULTIMATE iOS: Current permission:', Notification.permission);
      
      // For iOS Safari, we need to use the standard Notification API first
      if (iosDebugInfo.isIOS && iosDebugInfo.isSafari) {
        console.log('🛰️ ULTIMATE iOS: Detected Safari iOS - using manual permission request');
        
        const permission = await Notification.requestPermission();
        console.log('🛰️ ULTIMATE iOS: Native permission result:', permission);
        
        if (permission !== 'granted') {
          console.warn('🛰️ ULTIMATE iOS: Permission not granted, trying OneSignal anyway...');
        }
      }
      
      // Now use OneSignal registration
      try {
        await OneSignal.Notifications.requestPermission();
        console.log('🛰️ ULTIMATE iOS: OneSignal permission requested');
      } catch (osError) {
        console.warn('🛰️ ULTIMATE iOS: OneSignal permission error (may be OK):', osError);
      }
      
      // Wait for subscription to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get user ID with multiple BYPASS methods for iOS Safari
      console.log('🛰️ ULTIMATE iOS: Attempting Player ID retrieval with BYPASS methods...');
      let currentPlayerId = null;
      
      // Method 1: Try v16 User API
      try {
        currentPlayerId = await OneSignal.User.PushSubscription.id;
        if (currentPlayerId) {
          console.log('🛰️ ULTIMATE iOS: Player ID via User.PushSubscription.id:', currentPlayerId);
        }
      } catch (error) {
        console.log('🛰️ ULTIMATE iOS: User.PushSubscription.id failed:', error.message);
      }
      
      // Method 2: Try legacy getUserId
      if (!currentPlayerId) {
        try {
          currentPlayerId = await OneSignal.getUserId();
          if (currentPlayerId) {
            console.log('🛰️ ULTIMATE iOS: Player ID via getUserId():', currentPlayerId);
          }
        } catch (error) {
          console.log('🛰️ ULTIMATE iOS: getUserId() failed:', error.message);
        }
      }
      
      // Method 3: Try getSubscription
      if (!currentPlayerId) {
        try {
          const subscription = await OneSignal.getSubscription();
          currentPlayerId = subscription?.userId || subscription?.playerId;
          if (currentPlayerId) {
            console.log('🛰️ ULTIMATE iOS: Player ID via getSubscription():', currentPlayerId);
          }
        } catch (error) {
          console.log('🛰️ ULTIMATE iOS: getSubscription() failed:', error.message);
        }
      }
      
      // Method 4: Try direct property access
      if (!currentPlayerId) {
        try {
          currentPlayerId = OneSignal.User?.onesignalId || OneSignal.User?.userId;
          if (currentPlayerId) {
            console.log('🛰️ ULTIMATE iOS: Player ID via direct property:', currentPlayerId);
          }
        } catch (error) {
          console.log('🛰️ ULTIMATE iOS: Direct property access failed:', error.message);
        }
      }
      
      // iOS Safari BYPASS: If still no ID, try manual registration
      if (!currentPlayerId && iosDebugInfo.isIOS && iosDebugInfo.isSafari) {
        console.log('🛰️ ULTIMATE iOS: Attempting iOS Safari manual registration...');
        
        try {
          // Force a re-registration
          await OneSignal.setSubscription(true);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Extended wait for iOS
          
          // Try again after forced registration
          currentPlayerId = await OneSignal.User.PushSubscription.id || 
                           await OneSignal.getUserId();
          
          if (currentPlayerId) {
            console.log('🛰️ ULTIMATE iOS: Player ID after manual registration:', currentPlayerId);
          }
        } catch (manualError) {
          console.error('🛰️ ULTIMATE iOS: Manual registration failed:', manualError);
        }
      }
      
      if (currentPlayerId) {
        setPlayerId(currentPlayerId);
        console.log('🛰️ ULTIMATE iOS: Player ID ottenuto:', currentPlayerId);
        
        // Save to Supabase if user is logged in
        if (user) {
          console.log('🛰️ ULTIMATE iOS: Salvataggio token in Supabase...');
          const { error } = await supabase
            .from('device_tokens')
            .upsert({
              user_id: user.id,
              token: currentPlayerId,
              device_type: iosDebugInfo.isIOS ? 'onesignal_ios_web' : 'onesignal_web',
              platform: `${navigator.platform} - ${iosDebugInfo.isIOS ? 'iOS' : 'Other'}`
            });

          if (error) {
            console.error('🛰️ ULTIMATE iOS: Errore salvataggio:', error);
          } else {
            console.log('🛰️ ULTIMATE iOS: Token salvato con successo!');
            await loadDeviceTokens();
          }
        }

        // Final status check
        await checkOneSignalStatus();
        
        toast.success('🛰️ REGISTRAZIONE iOS ULTIMATE COMPLETATA!');
        console.log('🛰️ ULTIMATE iOS: Registrazione completata con successo!');
      } else {
        console.error('🛰️ ULTIMATE iOS: Player ID nullo - tentativo di debug...');
        
        // Debug output
        try {
          const isEnabled = await OneSignal.isPushNotificationsEnabled();
          const permission = await OneSignal.getNotificationPermission();
          console.log('🛰️ ULTIMATE iOS Debug:', { isEnabled, permission });
        } catch (debugError) {
          console.error('🛰️ ULTIMATE iOS: Debug error:', debugError);
        }
        
        throw new Error('Player ID non ottenuto - verifica permessi e connessione');
      }

    } catch (error) {
      console.error('🛰️ ULTIMATE iOS: Errore registrazione:', error);
      toast.error(`❌ Registrazione iOS fallita: ${error}`);
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
    console.log('🛰️ ULTIMATE iOS: NOTIFICATION DEBUG MOUNTED - Component rendering successfully!');
    console.log('🛰️ ULTIMATE iOS: Starting iOS-specific initialization...');
    
    detectiOSEnvironment();
    checkWorkerStatus();
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
              🛰️ NOTIFICATION DEBUG iOS ULTIMATE - M1SSION™
            </CardTitle>
            <div className="text-center text-sm text-green-400 mt-2">
              ✅ PAGINA FUNZIONANTE - URL: {window.location.href}
            </div>
            <div className="text-center text-xs text-orange-400 mt-1">
              🍎 iOS Safari Optimized - OneSignal Debug Mode
            </div>
          </CardHeader>
        </Card>

        {/* Status Dashboard */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">📊 Status Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                <div className="text-sm text-gray-400">Subscription</div>
                <div className={`font-bold ${subscriptionStatus ? 'text-green-400' : 'text-red-400'}`}>
                  {subscriptionStatus ? '✅ Attiva' : '❌ Inattiva'}
                </div>
              </div>
            </div>
            
            {/* iOS-specific status */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-orange-800/30 p-3 rounded">
                <div className="text-sm text-orange-400">iOS Device</div>
                <div className={`font-bold ${iosDebugInfo.isIOS ? 'text-green-400' : 'text-red-400'}`}>
                  {iosDebugInfo.isIOS ? '🍎 iOS' : '🖥️ Desktop'}
                </div>
              </div>
              
              <div className="bg-orange-800/30 p-3 rounded">
                <div className="text-sm text-orange-400">Safari</div>
                <div className={`font-bold ${iosDebugInfo.isSafari ? 'text-green-400' : 'text-yellow-400'}`}>
                  {iosDebugInfo.isSafari ? '✅ Safari' : '⚠️ Other'}
                </div>
              </div>
              
              <div className="bg-orange-800/30 p-3 rounded">
                <div className="text-sm text-orange-400">Service Worker</div>
                <div className={`font-bold text-xs ${workerStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {workerStatus}
                </div>
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
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold px-8 py-4 text-lg"
              >
                {isLoading ? '🔄 Registrando iOS...' : '🛰️ REGISTRATI ULTIMATE iOS'}
              </Button>
            </div>

            {/* Action Buttons - Enhanced for iOS Safari */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={handleTestNotification}
                disabled={!playerId}
                className="bg-green-600 hover:bg-green-700"
              >
                📤 Test Notifica iOS
              </Button>
              
              <Button 
                onClick={checkOneSignalStatus}
                variant="outline"
                className="border-orange-400 text-orange-400"
              >
                🛰️ Check OneSignal
              </Button>
              
              {/* iOS Safari BYPASS Button */}
              {iosDebugInfo.isIOS && iosDebugInfo.isSafari && (
                <Button 
                  onClick={async () => {
                    console.log('🍎 iOS BYPASS: Starting emergency manual registration...');
                    try {
                      // Clear everything
                      if ((window as any).OneSignal) {
                        await (window as any).OneSignal.logout();
                        delete (window as any).OneSignal;
                      }
                      
                      // Force native permission first
                      const permission = await Notification.requestPermission();
                      console.log('🍎 iOS BYPASS: Native permission:', permission);
                      
                      if (permission === 'granted') {
                        // Now reinitialize OneSignal
                        await initializeOneSignal();
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        await checkOneSignalStatus();
                      }
                    } catch (error) {
                      console.error('🍎 iOS BYPASS: Manual registration failed:', error);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  🍎 iOS BYPASS Manual
                </Button>
              )}
              
              <Button 
                onClick={loadDeviceTokens}
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                🔄 Ricarica Token
              </Button>
              
              <Button 
                onClick={() => { detectiOSEnvironment(); checkWorkerStatus(); updatePermissionStatus(); }}
                variant="outline"
                className="border-yellow-400 text-yellow-400"
              >
                🔍 Full iOS Check
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

        {/* iOS Environment Info */}
        <Card className="bg-black/50 border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-orange-400">🍎 iOS Environment Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">iOS Device:</span>
                <span className={`ml-2 ${iosDebugInfo.isIOS ? 'text-green-400' : 'text-red-400'}`}>
                  {iosDebugInfo.isIOS ? '✅ iOS Device' : '❌ Not iOS'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Safari Browser:</span>
                <span className={`ml-2 ${iosDebugInfo.isSafari ? 'text-green-400' : 'text-yellow-400'}`}>
                  {iosDebugInfo.isSafari ? '✅ Safari' : '⚠️ Other Browser'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">PWA Mode:</span>
                <span className={`ml-2 ${iosDebugInfo.isPWA ? 'text-green-400' : 'text-yellow-400'}`}>
                  {iosDebugInfo.isPWA ? '✅ PWA' : '⚠️ Browser'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Standalone:</span>
                <span className={`ml-2 ${iosDebugInfo.isStandalone ? 'text-green-400' : 'text-gray-400'}`}>
                  {iosDebugInfo.isStandalone ? '✅ Standalone' : '❌ Not Standalone'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Protocol:</span>
                <span className={`ml-2 ${iosDebugInfo.protocol === 'https:' ? 'text-green-400' : 'text-red-400'}`}>
                  {iosDebugInfo.protocol}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Notification API:</span>
                <span className={`ml-2 ${iosDebugInfo.notificationSupport ? 'text-green-400' : 'text-red-400'}`}>
                  {iosDebugInfo.notificationSupport ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400 text-xs mb-2">User Agent:</div>
              <div className="text-white text-xs break-all">{iosDebugInfo.userAgent}</div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400 text-xs mb-2">Service Worker Status:</div>
              <div className="text-white text-xs">{workerStatus}</div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default NotificationDebug;