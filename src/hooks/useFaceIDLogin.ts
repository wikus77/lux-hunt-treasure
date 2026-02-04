/**
 * M1SSION™ Face ID Login Hook v4
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * v4 FIX: Single unified effect to prevent race conditions
 * 
 * CONSTRAINTS:
 * - NO UI modifications
 * - NO auth flow changes
 * - Only works on iOS native
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
  }
}

interface UseFaceIDLoginOptions {
  onSuccess?: () => void;
  onFallback?: () => void;
}

// Wait for bridge with retry
async function waitForBridge(maxAttempts = 10, intervalMs = 100): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (window.M1SSIONFaceID) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

// Force redirect with fallback
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
  
  // Track state with refs
  const isProcessingRef = useRef(false);
  const lastVisibilityRef = useRef(false);
  const sessionIdRef = useRef(0); // Unique ID per visibility session

  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // SINGLE UNIFIED EFFECT - handles visibility changes and triggering
  useEffect(() => {
    // Skip if not iOS native
    if (!isNativeiOS) return;

    // Detect visibility CHANGE (not just current state)
    const wasVisible = lastVisibilityRef.current;
    const isVisible = isLoginVisible;
    lastVisibilityRef.current = isVisible;

    // Only trigger when transitioning TO visible
    if (!isVisible || wasVisible) {
      console.log('🔐 [FaceID] Skip - not a visibility transition to true');
      return;
    }

    // Skip if already processing
    if (isProcessingRef.current) {
      console.log('🔐 [FaceID] Skip - already processing');
      return;
    }

    // Generate new session ID for this visibility session
    const currentSessionId = ++sessionIdRef.current;
    console.log('🔐 [FaceID] New visibility session:', currentSessionId);

    const triggerFaceID = async () => {
      // Check session ID hasn't changed (user navigated away quickly)
      if (sessionIdRef.current !== currentSessionId) {
        console.log('🔐 [FaceID] Session changed, aborting');
        return;
      }

      const bridgeReady = await waitForBridge();
      if (!bridgeReady) {
        console.log('⚠️ [FaceID] Bridge not available');
        return;
      }

      // Check session ID again after async wait
      if (sessionIdRef.current !== currentSessionId) {
        console.log('🔐 [FaceID] Session changed during bridge wait, aborting');
        return;
      }

      try {
        const availability = await window.M1SSIONFaceID!.checkAvailability();
        console.log('🔐 [FaceID] Availability:', JSON.stringify(availability));

        if (!availability.available || !availability.hasStoredCredentials) {
          console.log('🔐 [FaceID] Not available or no credentials');
          return;
        }

        // Check session ID again
        if (sessionIdRef.current !== currentSessionId) {
          console.log('🔐 [FaceID] Session changed, aborting');
          return;
        }

        isProcessingRef.current = true;
        console.log('🔐 [FaceID] Triggering Face ID...');
        
        const result = await window.M1SSIONFaceID!.authenticate();
        console.log('🔐 [FaceID] Result:', JSON.stringify({ 
          success: result.success, 
          hasTokens: !!(result.accessToken && result.refreshToken),
          error: result.error 
        }));

        // Check session ID after Face ID (user might have cancelled and navigated)
        if (sessionIdRef.current !== currentSessionId) {
          console.log('🔐 [FaceID] Session changed after auth, aborting redirect');
          isProcessingRef.current = false;
          return;
        }

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
                window.M1SSIONFaceID?.saveTokens(
                  data.session.access_token,
                  data.session.refresh_token
                );
              }
            }
          } catch (e) {
            console.warn('⚠️ [FaceID] setSession error:', e);
          }

          // Try refreshSession as fallback
          if (!sessionRestored) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: result.refreshToken
              });
              
              if (refreshData.session && !refreshError) {
                console.log('✅ [FaceID] refreshSession OK');
                sessionRestored = true;
                
                if (refreshData.session.access_token && refreshData.session.refresh_token) {
                  window.M1SSIONFaceID?.saveTokens(
                    refreshData.session.access_token,
                    refreshData.session.refresh_token
                  );
                }
              }
            } catch (e) {
              console.warn('⚠️ [FaceID] refreshSession error:', e);
            }
          }

          // Final session check before redirect
          if (sessionIdRef.current !== currentSessionId) {
            console.log('🔐 [FaceID] Session changed, skipping redirect');
            isProcessingRef.current = false;
            return;
          }

          if (sessionRestored) {
            toast.success('Login effettuato', { description: 'Accesso tramite Face ID' });
            
            window.dispatchEvent(new CustomEvent('auth-success', { 
              detail: { timestamp: Date.now(), method: 'faceid' } 
            }));
            
            // Small delay for session to propagate
            await new Promise(resolve => setTimeout(resolve, 150));
            
            forceNavigate('/map-3d-tiler', navigate);
            onSuccess?.();
          } else {
            console.error('❌ [FaceID] All restore methods failed');
            window.M1SSIONFaceID?.clearCredentials();
            toast.error('Sessione scaduta', { description: 'Effettua il login manualmente' });
            onFallback?.();
          }
        } else {
          console.log('🔐 [FaceID] Cancelled or failed:', result.error);
          onFallback?.();
        }
      } catch (err) {
        console.error('❌ [FaceID] Error:', err);
        onFallback?.();
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Small delay to ensure component is fully rendered
    setTimeout(triggerFaceID, 100);

  }, [isLoginVisible, isNativeiOS, navigate, onSuccess, onFallback]);

  return {
    isNativeiOS,
    isProcessing: isProcessingRef.current,
  };
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
    console.log('✅ [FaceID] Credentials cleared');
  } catch (e) {
    console.warn('⚠️ [FaceID] Clear failed:', e);
  }
}

export default useFaceIDLogin;
