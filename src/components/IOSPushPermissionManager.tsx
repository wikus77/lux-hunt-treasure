// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA Push Permission Manager - Enhanced for Safari Web App

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface IOSPushPermissionManagerProps {
  onPermissionGranted?: () => void;
  showDebugInfo?: boolean;
}

export const IOSPushPermissionManager: React.FC<IOSPushPermissionManagerProps> = ({
  onPermissionGranted,
  showDebugInfo = false
}) => {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<string>('unknown');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [oneSignalReady, setOneSignalReady] = useState(false);

  // Detect iOS and PWA environment
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isPWAMode = window.navigator.standalone === true;
    
    setIsIOS(isIOSDevice);
    setIsPWA(isPWAMode);
    
    console.log('🔔 CRITICAL iOS PWA: Permission Manager initialized:', {
      isIOS: isIOSDevice,
      isPWA: isPWAMode,
      userAgent: userAgent
    });
  }, []);

  // Check OneSignal readiness and current permission
  useEffect(() => {
    const checkOneSignalStatus = async () => {
      try {
        // Wait for OneSignal to be ready
        const checkReady = async () => {
          const isReady = (window as any).M1SSIONOneSignalDebug !== undefined;
          if (isReady) {
            setOneSignalReady(true);
            
            // Check current permission
            try {
              const permission = await OneSignal.Notifications.permission;
              setPermissionState(permission ? 'granted' : 'denied');
              console.log('🔔 CRITICAL iOS PWA: Current permission state:', permission);
            } catch (error) {
              console.error('🔔 CRITICAL iOS PWA: Failed to check permission:', error);
              setPermissionState('error');
            }
          } else {
            // Retry after a short delay
            setTimeout(checkReady, 1000);
          }
        };
        
        checkReady();
      } catch (error) {
        console.error('🔔 CRITICAL iOS PWA: OneSignal status check failed:', error);
      }
    };

    checkOneSignalStatus();
  }, []);

  const requestPermissionManually = async () => {
    if (!oneSignalReady) {
      toast.error('❌ OneSignal non ancora pronto. Riprova tra poco.');
      return;
    }

    setIsRequestingPermission(true);
    
    try {
      console.log('🔔 CRITICAL iOS PWA: Manual permission request started...');
      
      // Log permission request attempt
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'ios_pwa_permission_request_attempted',
          user_id: user?.id || null,
          note: 'Manual iOS PWA permission request',
          context: 'ios_permission_manager',
          details: {
            isIOS,
            isPWA,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      // Request permission through OneSignal
      const permissionResult = await OneSignal.Notifications.requestPermission();
      console.log('🔔 CRITICAL iOS PWA: Permission request result:', permissionResult);
      
      // Check the actual permission status after request
      const actualPermission = await OneSignal.Notifications.permission;
      console.log('🔔 CRITICAL iOS PWA: Actual permission after request:', actualPermission);
      
      if (actualPermission === true) {
        setPermissionState('granted');
        toast.success('✅ Notifiche push attivate per iOS!', {
          description: 'Riceverai aggiornamenti importanti su M1SSION™',
          duration: 5000
        });
        
        // Get Player ID and save to database
        try {
          const playerId = await OneSignal.User.PushSubscription.id;
          console.log('🔔 CRITICAL iOS PWA: Player ID obtained:', playerId);
          
          if (playerId && user) {
            // Save to database
            const { error } = await supabase
              .from('device_tokens')
              .upsert({
                user_id: user.id,
                token: playerId,
                device_type: 'onesignal',
                last_used: new Date().toISOString(),
                created_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,device_type'
              });

            if (error) {
              console.error('❌ CRITICAL iOS PWA: Failed to save token:', error);
            } else {
              console.log('✅ CRITICAL iOS PWA: Token saved successfully');
              
              // Log success
              await supabase
                .from('admin_logs')
                .insert({
                  event_type: 'ios_pwa_permission_granted_success',
                  user_id: user.id,
                  note: 'iOS PWA permission granted and token saved',
                  context: 'ios_permission_manager',
                  details: {
                    playerId,
                    isIOS,
                    isPWA,
                    userAgent: navigator.userAgent
                  }
                });
            }
          }
        } catch (tokenError) {
          console.error('🔔 CRITICAL iOS PWA: Failed to get/save token:', tokenError);
        }
        
        onPermissionGranted?.();
      } else {
        setPermissionState('denied');
        toast.error('❌ Permesso negato. Puoi abilitare le notifiche nelle impostazioni Safari.', {
          description: 'Vai a Impostazioni > Safari > Notifiche siti web',
          duration: 8000
        });
        
        // Log denial
        await supabase
          .from('admin_logs')
          .insert({
            event_type: 'ios_pwa_permission_denied',
            user_id: user?.id || null,
            note: 'iOS PWA permission denied by user',
            context: 'ios_permission_manager',
            details: {
              permissionResult,
              actualPermission,
              isIOS,
              isPWA
            }
          });
      }
      
    } catch (error) {
      console.error('🔔 CRITICAL iOS PWA: Permission request failed:', error);
      setPermissionState('error');
      toast.error('❌ Errore nella richiesta permessi. Riprova.', {
        description: error.message
      });
      
      // Log error
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'ios_pwa_permission_request_error',
          user_id: user?.id || null,
          note: 'iOS PWA permission request error',
          context: 'ios_permission_manager',
          details: {
            error: error.message,
            stack: error.stack,
            isIOS,
            isPWA
          }
        });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Don't render if not iOS or already granted
  if (!isIOS || permissionState === 'granted') {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 m-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">🔔</div>
        <div>
          <h3 className="font-semibold text-foreground">Notifiche Push per iOS</h3>
          <p className="text-sm text-muted-foreground">
            Abilita le notifiche per ricevere aggiornamenti su M1SSION™
          </p>
        </div>
      </div>

      {showDebugInfo && (
        <div className="mb-3 p-2 bg-muted rounded text-xs">
          <div><strong>iOS:</strong> {isIOS ? '✅' : '❌'}</div>
          <div><strong>PWA:</strong> {isPWA ? '✅' : '❌'}</div>
          <div><strong>OneSignal Ready:</strong> {oneSignalReady ? '✅' : '❌'}</div>
          <div><strong>Permission:</strong> {permissionState}</div>
        </div>
      )}

      <Button 
        onClick={requestPermissionManually}
        disabled={isRequestingPermission || !oneSignalReady}
        className="w-full"
        variant="default"
      >
        {isRequestingPermission ? 'Richiesta in corso...' : 'Abilita Notifiche Push'}
      </Button>

      {permissionState === 'denied' && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Se hai già negato i permessi, vai in Impostazioni Safari &gt; Notifiche siti web
        </p>
      )}
    </div>
  );
};