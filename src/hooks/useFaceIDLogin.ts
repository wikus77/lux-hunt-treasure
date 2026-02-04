/**
 * M1SSION™ Face ID Login Hook v5
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * v5: Time-based cooldown instead of ref tracking
 * - No more race conditions
 * - No more ref persistence issues
 * - Simple: if enough time passed, trigger again
 */

import { useEffect, useRef } from 'react';
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
    // Global timestamp to persist across component mounts
    _m1ssionFaceIDLastAttempt?: number;
  }
}

interface UseFaceIDLoginOptions {
  onSuccess?: () => void;
  onFallback?: () => void;
}

// Cooldown: minimum time between Face ID attempts (ms)
const FACEID_COOLDOWN_MS = 3000;

async function waitForBridge(maxAttempts = 10, intervalMs = 100): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.M1SSIONFaceID) return true;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

function forceNavigate(path: string, navigate: (path: string) => void): void {
  navigate(path);
  setTimeout(() => {
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
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

  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  useEffect(() => {
    // Guard: only on iOS native when login is visible
    if (!isNativeiOS || !isLoginVisible) {
      return;
    }

    // Guard: already processing
    if (isProcessingRef.current) {
      console.log('🔐 [FaceID] Skip - already processing');
      return;
    }

    // Guard: cooldown check (uses global window property to persist across mounts)
    const now = Date.now();
    const lastAttempt = window._m1ssionFaceIDLastAttempt || 0;
    const timeSinceLastAttempt = now - lastAttempt;
    
    if (timeSinceLastAttempt < FACEID_COOLDOWN_MS) {
      console.log(`🔐 [FaceID] Skip - cooldown (${timeSinceLastAttempt}ms < ${FACEID_COOLDOWN_MS}ms)`);
      return;
    }

    // Mark attempt time BEFORE async operations
    window._m1ssionFaceIDLastAttempt = now;

    const triggerFaceID = async () => {
      const bridgeReady = await waitForBridge();
      if (!bridgeReady) {
        console.log('⚠️ [FaceID] Bridge not available');
        return;
      }

      try {
        const availability = await window.M1SSIONFaceID!.checkAvailability();
        console.log('🔐 [FaceID] Availability:', JSON.stringify(availability));

        if (!availability.available || !availability.hasStoredCredentials) {
          console.log('🔐 [FaceID] Not available or no credentials');
          return;
        }

        isProcessingRef.current = true;
        console.log('🔐 [FaceID] Triggering...');
        
        const result = await window.M1SSIONFaceID!.authenticate();
        console.log('🔐 [FaceID] Result:', result.success ? 'SUCCESS' : result.error);

        if (result.success && result.accessToken && result.refreshToken) {
          let sessionRestored = false;

          // Try setSession
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: result.accessToken,
              refresh_token: result.refreshToken
            });
            
            if (data.session && !error) {
              console.log('✅ [FaceID] setSession OK');
              sessionRestored = true;
              if (data.session.access_token && data.session.refresh_token) {
                window.M1SSIONFaceID?.saveTokens(data.session.access_token, data.session.refresh_token);
              }
            }
          } catch (e) {
            console.warn('⚠️ [FaceID] setSession error');
          }

          // Fallback: refreshSession
          if (!sessionRestored) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: result.refreshToken
              });
              
              if (refreshData.session && !refreshError) {
                console.log('✅ [FaceID] refreshSession OK');
                sessionRestored = true;
                if (refreshData.session.access_token && refreshData.session.refresh_token) {
                  window.M1SSIONFaceID?.saveTokens(refreshData.session.access_token, refreshData.session.refresh_token);
                }
              }
            } catch (e) {
              console.warn('⚠️ [FaceID] refreshSession error');
            }
          }

          if (sessionRestored) {
            toast.success('Login effettuato', { description: 'Accesso tramite Face ID' });
            window.dispatchEvent(new CustomEvent('auth-success', { detail: { timestamp: Date.now(), method: 'faceid' } }));
            await new Promise(resolve => setTimeout(resolve, 150));
            forceNavigate('/map-3d-tiler', navigate);
            onSuccess?.();
          } else {
            console.error('❌ [FaceID] Session restore failed');
            window.M1SSIONFaceID?.clearCredentials();
            toast.error('Sessione scaduta', { description: 'Effettua il login manualmente' });
            onFallback?.();
          }
        } else {
          console.log('🔐 [FaceID] Cancelled/failed:', result.error);
          onFallback?.();
        }
      } catch (err) {
        console.error('❌ [FaceID] Error:', err);
        onFallback?.();
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Small delay for component stability
    const timeoutId = setTimeout(triggerFaceID, 200);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoginVisible, isNativeiOS, navigate, onSuccess, onFallback]);

  return { isNativeiOS, isProcessing: isProcessingRef.current };
}

export function saveFaceIDCredentials(accessToken: string, refreshToken: string): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

  const attemptSave = async () => {
    const bridgeReady = await waitForBridge(5, 100);
    if (bridgeReady && window.M1SSIONFaceID?.saveTokens) {
      window.M1SSIONFaceID.saveTokens(accessToken, refreshToken);
      console.log('✅ [FaceID] Tokens saved');
    }
  };
  attemptSave();
}

export function clearFaceIDCredentials(): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
  
  try {
    window.M1SSIONFaceID?.clearCredentials();
    // Also reset cooldown so Face ID can trigger on next login
    window._m1ssionFaceIDLastAttempt = 0;
    console.log('✅ [FaceID] Credentials cleared');
  } catch (e) {
    console.warn('⚠️ [FaceID] Clear failed');
  }
}

export default useFaceIDLogin;
