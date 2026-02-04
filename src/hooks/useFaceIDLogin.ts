/**
 * M1SSION™ Face ID Login Hook v8
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * v8: Event-based trigger + Session Restore Event
 * - Listens to native foreground event
 * - Uses cooldown instead of visibility transition
 * - Emits m1ssion:session-restored for AuthProvider to listen
 * - More robust detection of login screen
 */

import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    M1SSIONFaceID?: {
      checkAvailability: () => Promise<{
        available: boolean;
        biometryType: string;
        hasStoredCredentials: boolean;
      }>;
      authenticate: () => Promise<{
        success: boolean;
        accessToken?: string;
        refreshToken?: string;
        error?: string;
      }>;
      saveTokens: (accessToken: string, refreshToken: string) => void;
      saveToken: (token: string) => void;
      clearCredentials: () => void;
    };
    _m1ssionFaceIDLastAttempt?: number;
    _m1ssionFaceIDProcessing?: boolean;
  }
}

interface UseFaceIDLoginOptions {
  onSuccess?: () => void;
  onFallback?: () => void;
}

// Cooldown between Face ID attempts (prevents loops)
const FACEID_COOLDOWN_MS = 3000;

async function waitForBridge(maxAttempts = 20, intervalMs = 100): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.M1SSIONFaceID) return true;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

function forceNavigate(path: string, navigate: (path: string) => void): void {
  console.log('🔐 [FaceID] Navigating to:', path);
  navigate(path);
  // Fallback with hard redirect if wouter fails
  setTimeout(() => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('login') || currentPath === '/' || currentPath === '') {
      console.log('🔐 [FaceID] Wouter failed, using hard redirect');
      window.location.href = path;
    }
  }, 600);
}

/**
 * Check if Face ID attempt is allowed (cooldown + not processing)
 */
function canAttemptFaceID(): boolean {
  if (window._m1ssionFaceIDProcessing) {
    console.log('🔐 [FaceID] Skip - already processing');
    return false;
  }
  
  const now = Date.now();
  const lastAttempt = window._m1ssionFaceIDLastAttempt || 0;
  const timeSinceLastAttempt = now - lastAttempt;
  
  if (timeSinceLastAttempt < FACEID_COOLDOWN_MS) {
    console.log(`🔐 [FaceID] Skip - cooldown (${timeSinceLastAttempt}ms < ${FACEID_COOLDOWN_MS}ms)`);
    return false;
  }
  
  return true;
}

export function useFaceIDLogin(
  isLoginVisible: boolean,
  options: UseFaceIDLoginOptions = {}
) {
  const { onSuccess, onFallback } = options;
  const { navigate } = useWouterNavigation();
  const mountedRef = useRef(true);

  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const triggerFaceID = useCallback(async (source: string = 'unknown') => {
    if (!isNativeiOS) return;
    if (!canAttemptFaceID()) return;
    
    // Mark attempt time immediately
    window._m1ssionFaceIDLastAttempt = Date.now();
    window._m1ssionFaceIDProcessing = true;
    
    console.log(`🔐 [FaceID] Triggered from: ${source}`);

    try {
      // Wait for bridge
      const bridgeReady = await waitForBridge();
      if (!bridgeReady || !window.M1SSIONFaceID) {
        console.log('🔐 [FaceID] Bridge not available');
        window._m1ssionFaceIDProcessing = false;
        return;
      }

      // Check availability
      const availability = await window.M1SSIONFaceID.checkAvailability();
      console.log('🔐 [FaceID] Availability:', JSON.stringify(availability));

      if (!availability.available) {
        console.log('🔐 [FaceID] Not available on device');
        window._m1ssionFaceIDProcessing = false;
        return;
      }

      if (!availability.hasStoredCredentials) {
        console.log('🔐 [FaceID] No stored credentials - user needs manual login first');
        window._m1ssionFaceIDProcessing = false;
        return;
      }

      // Authenticate
      console.log('🔐 [FaceID] Starting biometric authentication...');
      const result = await window.M1SSIONFaceID.authenticate();
      console.log('🔐 [FaceID] Auth result:', { success: result.success, hasTokens: !!result.accessToken });

      if (!result.success) {
        console.log('🔐 [FaceID] Auth cancelled or failed:', result.error);
        window._m1ssionFaceIDProcessing = false;
        onFallback?.();
        return;
      }

      if (!result.accessToken || !result.refreshToken) {
        console.log('🔐 [FaceID] No tokens returned from native');
        window._m1ssionFaceIDProcessing = false;
        onFallback?.();
        return;
      }

      // Restore session - prefer refreshSession (more robust)
      console.log('🔐 [FaceID] Restoring session...');
      let sessionRestored = false;
      let newSession: any = null;

      // Try refreshSession first (more robust against clock drift/expired tokens)
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: result.refreshToken
        });

        if (refreshData.session && !refreshError) {
          sessionRestored = true;
          newSession = refreshData.session;
          console.log('🔐 [FaceID] Session restored via refreshSession');
        } else if (refreshError) {
          console.log('🔐 [FaceID] refreshSession error:', refreshError.message);
        }
      } catch (e) {
        console.log('🔐 [FaceID] refreshSession exception:', e);
      }

      // Fallback: try setSession
      if (!sessionRestored) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: result.accessToken,
            refresh_token: result.refreshToken
          });

          if (data.session && !error) {
            sessionRestored = true;
            newSession = data.session;
            console.log('🔐 [FaceID] Session restored via setSession');
          } else if (error) {
            console.log('🔐 [FaceID] setSession error:', error.message);
          }
        } catch (e) {
          console.log('🔐 [FaceID] setSession exception:', e);
        }
      }

      if (sessionRestored && newSession) {
        // Save fresh tokens for next time
        if (newSession.access_token && newSession.refresh_token) {
          window.M1SSIONFaceID?.saveTokens(newSession.access_token, newSession.refresh_token);
          console.log('🔐 [FaceID] Fresh tokens saved to Keychain');
        }
        
        // 🔥 CRITICAL: Emit session-restored event for AuthProvider to re-hydrate
        console.log('🔐 [FaceID] Emitting m1ssion:session-restored event');
        window.dispatchEvent(new CustomEvent('m1ssion:session-restored', { 
          detail: { 
            timestamp: Date.now(), 
            method: 'faceid',
            userId: newSession.user?.id 
          }
        }));
        
        // Also emit auth-success for other listeners
        window.dispatchEvent(new CustomEvent('auth-success', { 
          detail: { timestamp: Date.now(), method: 'faceid' }
        }));
        
        toast.success('Login effettuato', { description: 'Accesso tramite Face ID' });
        
        // Small delay then navigate
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (mountedRef.current) {
          forceNavigate('/map-3d-tiler', navigate);
          onSuccess?.();
        }
      } else {
        // Session invalid - clear credentials
        console.log('🔐 [FaceID] Session restore failed - tokens expired');
        window.M1SSIONFaceID?.clearCredentials();
        toast.error('Sessione scaduta', { description: 'Effettua il login manualmente' });
        onFallback?.();
      }

    } catch (err) {
      console.error('🔐 [FaceID] Unexpected error:', err);
      onFallback?.();
    } finally {
      window._m1ssionFaceIDProcessing = false;
    }
  }, [isNativeiOS, navigate, onSuccess, onFallback]);

  // Trigger when login becomes visible
  useEffect(() => {
    if (!isNativeiOS || !isLoginVisible) return;
    
    console.log('🔐 [FaceID] Login screen visible, scheduling trigger...');
    const timeoutId = setTimeout(() => {
      triggerFaceID('login-visible');
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [isLoginVisible, isNativeiOS, triggerFaceID]);

  // Listen for native foreground event
  useEffect(() => {
    if (!isNativeiOS) return;
    
    const handleForeground = (event: CustomEvent) => {
      console.log('🔐 [FaceID] App foreground event received');
      // Only trigger if on login screen
      if (isLoginVisible) {
        triggerFaceID('app-foreground');
      }
    };
    
    window.addEventListener('m1ssion:app-foreground', handleForeground as EventListener);
    
    return () => {
      window.removeEventListener('m1ssion:app-foreground', handleForeground as EventListener);
    };
  }, [isNativeiOS, isLoginVisible, triggerFaceID]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { isNativeiOS, triggerFaceID };
}

export function saveFaceIDCredentials(accessToken: string, refreshToken: string): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

  const attemptSave = async () => {
    const bridgeReady = await waitForBridge(10, 100);
    if (bridgeReady && window.M1SSIONFaceID?.saveTokens) {
      window.M1SSIONFaceID.saveTokens(accessToken, refreshToken);
      console.log('✅ [FaceID] Tokens saved to Keychain');
    } else {
      console.warn('⚠️ [FaceID] Could not save tokens - bridge not ready');
    }
  };
  attemptSave();
}

export function clearFaceIDCredentials(): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

  try {
    window.M1SSIONFaceID?.clearCredentials();
    // Reset cooldown so Face ID can trigger on next login
    window._m1ssionFaceIDLastAttempt = 0;
    console.log('✅ [FaceID] Credentials cleared');
  } catch (e) {
    console.warn('⚠️ [FaceID] Error clearing credentials:', e);
  }
}

export default useFaceIDLogin;
