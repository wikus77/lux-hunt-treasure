/**
 * M1SSION™ Face ID Login Hook v7
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * v7: Simplified trigger + persistent credentials
 * - Face ID credentials persist across logout (protected by biometrics)
 * - Triggers when login visible with stored credentials
 * - Clears credentials only when session restoration fails
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
  }
}

interface UseFaceIDLoginOptions {
  onSuccess?: () => void;
  onFallback?: () => void;
}

async function waitForBridge(maxAttempts = 15, intervalMs = 100): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.M1SSIONFaceID) return true;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

function forceNavigate(path: string, navigate: (path: string) => void): void {
  navigate(path);
  setTimeout(() => {
    if (window.location.pathname.includes('login') || window.location.pathname === '/') {
      window.location.href = path;
    }
  }, 500);
}

export function useFaceIDLogin(
  isLoginVisible: boolean,
  options: UseFaceIDLoginOptions = {}
) {
  const { onSuccess, onFallback } = options;
  const { navigate } = useWouterNavigation();
  const isProcessingRef = useRef(false);
  const lastVisibleRef = useRef(false);

  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const triggerFaceID = useCallback(async () => {
    if (!isNativeiOS) return;
    if (isProcessingRef.current) return;

    // Wait for bridge
    const bridgeReady = await waitForBridge();
    if (!bridgeReady || !window.M1SSIONFaceID) {
      console.log('🔐 [FaceID] Bridge not available');
      return;
    }

    try {
      // Check availability
      const availability = await window.M1SSIONFaceID.checkAvailability();
      console.log('🔐 [FaceID] Availability:', availability);

      if (!availability.available) {
        console.log('🔐 [FaceID] Not available on device');
        return;
      }

      if (!availability.hasStoredCredentials) {
        console.log('🔐 [FaceID] No stored credentials');
        return;
      }

      // Start authentication
      isProcessingRef.current = true;
      console.log('🔐 [FaceID] Starting authentication...');

      const result = await window.M1SSIONFaceID.authenticate();
      console.log('🔐 [FaceID] Auth result:', { success: result.success, hasTokens: !!result.accessToken });

      if (!result.success) {
        console.log('🔐 [FaceID] Auth cancelled or failed');
        isProcessingRef.current = false;
        onFallback?.();
        return;
      }

      if (!result.accessToken || !result.refreshToken) {
        console.log('🔐 [FaceID] No tokens returned');
        isProcessingRef.current = false;
        onFallback?.();
        return;
      }

      // Restore session
      let sessionRestored = false;

      // Try setSession
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken
        });

        if (data.session && !error) {
          sessionRestored = true;
          // Update stored tokens with fresh ones
          if (data.session.access_token && data.session.refresh_token) {
            window.M1SSIONFaceID?.saveTokens(data.session.access_token, data.session.refresh_token);
          }
          console.log('🔐 [FaceID] Session restored via setSession');
        }
      } catch (e) {
        console.log('🔐 [FaceID] setSession failed, trying refresh...');
      }

      // Fallback: refreshSession
      if (!sessionRestored) {
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: result.refreshToken
          });

          if (refreshData.session && !refreshError) {
            sessionRestored = true;
            if (refreshData.session.access_token && refreshData.session.refresh_token) {
              window.M1SSIONFaceID?.saveTokens(refreshData.session.access_token, refreshData.session.refresh_token);
            }
            console.log('🔐 [FaceID] Session restored via refreshSession');
          }
        } catch (e) {
          console.log('🔐 [FaceID] refreshSession failed');
        }
      }

      if (sessionRestored) {
        toast.success('Login effettuato', { description: 'Accesso tramite Face ID' });
        window.dispatchEvent(new CustomEvent('auth-success', { detail: { timestamp: Date.now(), method: 'faceid' } }));
        await new Promise(resolve => setTimeout(resolve, 200));
        forceNavigate('/map-3d-tiler', navigate);
        onSuccess?.();
      } else {
        // Session invalid - clear credentials so user must login manually
        console.log('🔐 [FaceID] Session expired, clearing credentials');
        window.M1SSIONFaceID?.clearCredentials();
        toast.error('Sessione scaduta', { description: 'Effettua il login manualmente' });
        onFallback?.();
      }

    } catch (err) {
      console.error('🔐 [FaceID] Error:', err);
      onFallback?.();
    } finally {
      isProcessingRef.current = false;
    }
  }, [isNativeiOS, navigate, onSuccess, onFallback]);

  // Trigger Face ID when login becomes visible
  useEffect(() => {
    // Detect transition: NOT visible -> visible
    const wasVisible = lastVisibleRef.current;
    lastVisibleRef.current = isLoginVisible;

    if (!wasVisible && isLoginVisible && isNativeiOS) {
      console.log('🔐 [FaceID] Login screen became visible, triggering...');
      // Small delay for component stability
      const timeoutId = setTimeout(() => {
        triggerFaceID();
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoginVisible, isNativeiOS, triggerFaceID]);

  return { isNativeiOS, triggerFaceID };
}

export function saveFaceIDCredentials(accessToken: string, refreshToken: string): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

  const attemptSave = async () => {
    const bridgeReady = await waitForBridge(10, 100);
    if (bridgeReady && window.M1SSIONFaceID?.saveTokens) {
      window.M1SSIONFaceID.saveTokens(accessToken, refreshToken);
      console.log('✅ [FaceID] Tokens saved to Keychain');
    }
  };
  attemptSave();
}

export function clearFaceIDCredentials(): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

  try {
    window.M1SSIONFaceID?.clearCredentials();
    console.log('✅ [FaceID] Credentials cleared');
  } catch (e) {
    // Ignore
  }
}

export default useFaceIDLogin;
