/**
 * M1SSION™ Face ID Login Hook v6
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * v6: Interval-based trigger + timestamp cooldown
 * - Polls every 500ms when login visible
 * - Triggers if cooldown passed (5 seconds)
 * - Works even if React doesn't re-run effect
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
    _m1ssionFaceIDLastAttempt?: number;
    _m1ssionFaceIDLastSuccess?: number;
  }
}

interface UseFaceIDLoginOptions {
  onSuccess?: () => void;
  onFallback?: () => void;
}

const COOLDOWN_MS = 5000; // 5 seconds between attempts
const POLL_INTERVAL_MS = 500; // Check every 500ms

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
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/' || currentPath === '') {
      window.location.href = path;
    }
  }, 600);
}

export function useFaceIDLogin(
  isLoginVisible: boolean,
  options: UseFaceIDLoginOptions = {}
) {
  const { onSuccess, onFallback } = options;
  const { navigate } = useWouterNavigation();
  const isProcessingRef = useRef(false);
  const hasTriggeredThisSessionRef = useRef(false);

  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  useEffect(() => {
    // Reset session flag when login becomes visible
    if (isLoginVisible) {
      const now = Date.now();
      const lastSuccess = window._m1ssionFaceIDLastSuccess || 0;
      // If last success was more than 10 seconds ago, allow new trigger
      if (now - lastSuccess > 10000) {
        hasTriggeredThisSessionRef.current = false;
      }
    }
  }, [isLoginVisible]);

  useEffect(() => {
    if (!isNativeiOS || !isLoginVisible) {
      return;
    }

    const attemptFaceID = async () => {
      // Guards
      if (!isLoginVisible) return;
      if (isProcessingRef.current) return;
      if (hasTriggeredThisSessionRef.current) return;

      const now = Date.now();
      const lastAttempt = window._m1ssionFaceIDLastAttempt || 0;
      
      if (now - lastAttempt < COOLDOWN_MS) {
        return; // Still in cooldown
      }

      // Check bridge
      if (!window.M1SSIONFaceID) {
        await waitForBridge();
        if (!window.M1SSIONFaceID) return;
      }

      try {
        const availability = await window.M1SSIONFaceID.checkAvailability();
        
        if (!availability.available || !availability.hasStoredCredentials) {
          return;
        }

        // Mark attempt
        window._m1ssionFaceIDLastAttempt = now;
        hasTriggeredThisSessionRef.current = true;
        isProcessingRef.current = true;

        console.log('🔐 [FaceID] Triggering...');
        
        const result = await window.M1SSIONFaceID.authenticate();

        if (result.success && result.accessToken && result.refreshToken) {
          let sessionRestored = false;

          // Try setSession
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: result.accessToken,
              refresh_token: result.refreshToken
            });
            
            if (data.session && !error) {
              sessionRestored = true;
              if (data.session.access_token && data.session.refresh_token) {
                window.M1SSIONFaceID?.saveTokens(data.session.access_token, data.session.refresh_token);
              }
            }
          } catch (e) {
            // Try refresh as fallback
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
              }
            } catch (e) {
              // Failed
            }
          }

          if (sessionRestored) {
            window._m1ssionFaceIDLastSuccess = Date.now();
            toast.success('Login effettuato', { description: 'Accesso tramite Face ID' });
            window.dispatchEvent(new CustomEvent('auth-success', { detail: { timestamp: Date.now(), method: 'faceid' } }));
            await new Promise(resolve => setTimeout(resolve, 200));
            forceNavigate('/map-3d-tiler', navigate);
            onSuccess?.();
          } else {
            window.M1SSIONFaceID?.clearCredentials();
            toast.error('Sessione scaduta', { description: 'Effettua il login manualmente' });
            hasTriggeredThisSessionRef.current = false; // Allow retry
            onFallback?.();
          }
        } else {
          // Cancelled or failed - allow retry after cooldown
          hasTriggeredThisSessionRef.current = false;
          onFallback?.();
        }
      } catch (err) {
        console.error('❌ [FaceID] Error:', err);
        hasTriggeredThisSessionRef.current = false;
        onFallback?.();
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Initial attempt after small delay
    const initialTimeout = setTimeout(attemptFaceID, 300);

    // Poll periodically in case React doesn't re-run effect
    const pollInterval = setInterval(() => {
      if (isLoginVisible && !isProcessingRef.current && !hasTriggeredThisSessionRef.current) {
        attemptFaceID();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollInterval);
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
    window._m1ssionFaceIDLastAttempt = 0;
    window._m1ssionFaceIDLastSuccess = 0;
    console.log('✅ [FaceID] Credentials cleared');
  } catch (e) {
    // Ignore
  }
}

export default useFaceIDLogin;
