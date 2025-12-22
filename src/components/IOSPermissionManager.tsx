// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// iOS PWA Permission Manager - Smart Permission Handling

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePushNotificationLogger } from '@/hooks/usePushNotificationLogger';
import { shouldShow as shouldShowFrequency, markShown } from '@/lib/ux/frequencyGate';

interface IOSPermissionManagerProps {
  show?: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const IOSPermissionManager: React.FC<IOSPermissionManagerProps> = ({
  show = false,
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [hasRequestedOnce, setHasRequestedOnce] = useState(false);
  
  const { logPermissionRequested, logPermissionGranted, logPermissionDenied } = usePushNotificationLogger();

  // iOS detection utilities
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isPWA = window.navigator.standalone === true;
  const isSafariIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent);

  // Check if should show permission manager
  const shouldShow = useCallback(() => {
    // Frequency gate: max 1/day unless user explicitly interacts
    const canShowByFrequency = shouldShowFrequency('ios-permission', 24);
    
    // Allow bypass if permission was granted or denied (user interacted)
    const userHasInteracted = permissionState !== 'default';
    
    return (
      show ||
      (
        isIOS &&
        isPWA &&
        permissionState === 'default' &&
        !hasRequestedOnce &&
        canShowByFrequency &&
        typeof window !== 'undefined' &&
        'Notification' in window
      )
    );
  }, [show, isIOS, isPWA, permissionState, hasRequestedOnce]);

  // Update visibility based on conditions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check current permission state
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }

      // Small delay to ensure proper mounting
      const timer = setTimeout(() => {
        const shouldShowNow = shouldShow();
        setIsVisible(shouldShowNow);
        
        // Mark as shown when visible
        if (shouldShowNow) {
          markShown('ios-permission');
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (isRequestingPermission || hasRequestedOnce) {
      return;
    }

    // Kill switch check
    if (localStorage.getItem('push:disable') === '1') {
      console.warn('[IOS-PERM] Emergency disable flag active');
      setIsVisible(false);
      return;
    }

    setIsRequestingPermission(true);
    setHasRequestedOnce(true);

    try {
      console.log('🔔 M1SSION™: iOS Permission Manager - Requesting permission...');
      
      await logPermissionRequested(isIOS ? 'ios_pwa' : 'web_pwa');

      let permission: NotificationPermission;

      // Different strategies for iOS PWA vs regular web
      if (isIOS && isPWA && isSafariIOS) {
        console.log('🔔 M1SSION™: Using iOS PWA permission strategy');
        
        // For iOS PWA, try to use OneSignal if available
        if ((window as any).M1SSIONOneSignalDebug) {
          try {
            const result = await (window as any).M1SSIONOneSignalDebug.forceRequestPermission();
            permission = result ? 'granted' : 'denied';
          } catch (error) {
            console.warn('⚠️ M1SSION™: OneSignal permission failed, using native API');
            permission = await Notification.requestPermission();
          }
        } else {
          // Fallback to native API
          permission = await Notification.requestPermission();
        }
      } else {
        // Standard permission request
        permission = await Notification.requestPermission();
      }

      console.log('🔔 M1SSION™: Permission result:', permission);
      setPermissionState(permission);

      if (permission === 'granted') {
        await logPermissionGranted(isIOS ? 'ios_pwa' : 'web_pwa');
        toast.success('✅ Notifiche attivate!', {
          description: 'Riceverai aggiornamenti importanti per M1SSION™'
        });
        onPermissionGranted?.();
        setIsVisible(false);
      } else {
        await logPermissionDenied(isIOS ? 'ios_pwa' : 'web_pwa');
        toast.error('❌ Permessi notifiche negati', {
          description: isIOS 
            ? 'Puoi abilitarli in Impostazioni > Safari > Notifiche'
            : 'Puoi abilitarli nelle impostazioni del browser'
        });
        onPermissionDenied?.();
        // Keep visible for retry
      }

    } catch (error) {
      console.error('❌ M1SSION™: Permission request error:', error);
      toast.error('❌ Errore richiesta permessi notifiche');
      
      await logPermissionDenied(isIOS ? 'ios_pwa' : 'web_pwa');
      onPermissionDenied?.();
    } finally {
      setIsRequestingPermission(false);
    }
  }, [
    isRequestingPermission,
    hasRequestedOnce,
    isIOS,
    isPWA,
    isSafariIOS,
    logPermissionRequested,
    logPermissionGranted,
    logPermissionDenied,
    onPermissionGranted,
    onPermissionDenied
  ]);

  // Don't render if not visible or permission already granted
  if (!isVisible || permissionState === 'granted' || !isIOS) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm border-2 border-primary shadow-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            🔔 Notifiche Push
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Abilita le notifiche push per ricevere aggiornamenti importanti su M1SSION™
          </div>

          {permissionState === 'denied' && hasRequestedOnce && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Permessi negati. Vai in <strong>Impostazioni Safari &gt; Notifiche siti web</strong> per abilitarli.
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={requestPermission}
              disabled={isRequestingPermission}
              className="w-full"
              variant="default"
            >
              {isRequestingPermission ? '🔄 Richiesta in corso...' : '🔔 Abilita Notifiche'}
            </Button>

            {hasRequestedOnce && permissionState === 'denied' && (
              <Button 
                onClick={() => setIsVisible(false)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Continua senza notifiche
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {isIOS && isPWA ? '📱 iOS PWA Mode' : '🌐 Web Mode'}
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};
