/**
 * M1SSION™ Face ID Login Hook v3
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * PURPOSE:
 * - Triggers Face ID when login screen is visible
 * - Handles auto-login on Face ID success using BOTH tokens
 * - Saves credentials after successful manual login
 * 
 * v3 FIXES:
 * - Better bridge wait with retry
 * - Reset trigger on failure (allows retry)
 * - Fallback navigation with window.location.href
 * - Better error handling and logging
 * - Delay before redirect to ensure session propagates
 * 
 * CONSTRAINTS:
 * - NO UI modifications
 * - NO auth flow changes
 * - Only works on iOS native (PWA/web returns no-op)
 */

import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type for Face ID bridge v2
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
      console.log(`🔐 [FaceID] Bridge ready after ${i * intervalMs}ms`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  console.warn('⚠️ [FaceID] Bridge not available after max attempts');
  return false;
}

// Force redirect with fallback
function forceNavigate(path: string, navigate: (path: string) => void): void {
  console.log('🚀 [FaceID] Navigating to:', path);
  
  // First try wouter navigate
  navigate(path);
  
  // Fallback: force redirect after short delay
  setTimeout(() => {
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      console.log('🔄 [FaceID] Fallback redirect via window.location.href');
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
  
  // Refs for state management
  const hasTriggeredRef = useRef(false);
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);

  // Check if we're on iOS native
  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main Face ID trigger effect
  useEffect(() => {
    // Guard conditions
    if (!isLoginVisible || !isNativeiOS || hasTriggeredRef.current || isProcessingRef.current) {
      return;
    }

    const triggerFaceID = async () => {
      // Wait for bridge with retry
      const bridgeReady = await waitForBridge();
      if (!bridgeReady || !mountedRef.current) {
        return;
      }

      try {
        // Check availability
        const availability = await window.M1SSIONFaceID!.checkAvailability();
        console.log('🔐 [FaceID] Availability:', JSON.stringify(availability));

        if (!availability.available || !availability.hasStoredCredentials) {
          console.log('🔐 [FaceID] Not available or no credentials - skipping');
          return;
        }

        // Mark as triggered
        hasTriggeredRef.current = true;
        isProcessingRef.current = true;

        console.log('🔐 [FaceID] Triggering Face ID prompt...');
        
        // Authenticate
        const result = await window.M1SSIONFaceID!.authenticate();
        console.log('🔐 [FaceID] Auth result:', JSON.stringify({ 
          success: result.success, 
          hasAccessToken: !!result.accessToken,
          hasRefreshToken: !!result.refreshToken,
          error: result.error 
        }));
        
        if (!mountedRef.current) return;

        if (result.success && result.accessToken && result.refreshToken) {
          console.log('✅ [FaceID] Face ID SUCCESS - Restoring session...');
          
          // Try setSession first
          let sessionRestored = false;
          
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: result.accessToken,
              refresh_token: result.refreshToken
            });
            
            if (data.session && !error) {
              console.log('✅ [FaceID] setSession succeeded');
              sessionRestored = true;
              
              // Update tokens in Keychain with potentially refreshed tokens
              if (data.session.access_token && data.session.refresh_token) {
                window.M1SSIONFaceID?.saveTokens(
                  data.session.access_token,
                  data.session.refresh_token
                );
              }
            } else {
              console.warn('⚠️ [FaceID] setSession failed:', error?.message);
            }
          } catch (setSessionError) {
            console.warn('⚠️ [FaceID] setSession exception:', setSessionError);
          }
          
          // If setSession failed, try refreshSession
          if (!sessionRestored) {
            console.log('🔄 [FaceID] Trying refreshSession...');
            
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: result.refreshToken
              });
              
              if (refreshData.session && !refreshError) {
                console.log('✅ [FaceID] refreshSession succeeded');
                sessionRestored = true;
                
                // Update tokens in Keychain
                if (refreshData.session.access_token && refreshData.session.refresh_token) {
                  window.M1SSIONFaceID?.saveTokens(
                    refreshData.session.access_token,
                    refreshData.session.refresh_token
                  );
                }
              } else {
                console.error('❌ [FaceID] refreshSession failed:', refreshError?.message);
              }
            } catch (refreshError) {
              console.error('❌ [FaceID] refreshSession exception:', refreshError);
            }
          }
          
          if (!mountedRef.current) return;
          
          if (sessionRestored) {
            // Success!
            toast.success('Login effettuato', {
              description: 'Accesso tramite Face ID'
            });
            
            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('auth-success', { 
              detail: { timestamp: Date.now(), method: 'faceid' } 
            }));
            
            // Wait a moment for session to propagate through AuthProvider
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Navigate with fallback
            forceNavigate('/map-3d-tiler', navigate);
            onSuccess?.();
          } else {
            // Both methods failed - tokens are invalid
            console.error('❌ [FaceID] All session restore methods failed');
            window.M1SSIONFaceID?.clearCredentials();
            toast.error('Sessione scaduta', {
              description: 'Effettua il login manualmente'
            });
            
            // RESET trigger to allow user to retry after manual login
            hasTriggeredRef.current = false;
            onFallback?.();
          }
        } else {
          // Face ID cancelled or failed
          console.log('🔐 [FaceID] Cancelled/failed:', result.error);
          
          // RESET trigger to allow retry
          hasTriggeredRef.current = false;
          onFallback?.();
        }
      } catch (err) {
        console.error('❌ [FaceID] Error:', err);
        
        // RESET trigger on error
        hasTriggeredRef.current = false;
        onFallback?.();
      } finally {
        isProcessingRef.current = false;
      }
    };

    triggerFaceID();
  }, [isLoginVisible, isNativeiOS, navigate, onSuccess, onFallback]);

  // Reset trigger when login screen is hidden (navigated away)
  useEffect(() => {
    if (!isLoginVisible) {
      // Don't reset hasTriggeredRef here anymore - 
      // we reset it on failure/cancel instead
    }
  }, [isLoginVisible]);

  return {
    isNativeiOS,
    isProcessing: isProcessingRef.current,
  };
}

/**
 * Save BOTH tokens to Keychain after successful login
 */
export function saveFaceIDCredentials(accessToken: string, refreshToken: string): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  // Wait for bridge
  const attemptSave = async () => {
    const bridgeReady = await waitForBridge(5, 100);
    if (!bridgeReady) {
      console.warn('⚠️ [saveFaceIDCredentials] Bridge not available');
      return;
    }

    try {
      if (window.M1SSIONFaceID?.saveTokens) {
        window.M1SSIONFaceID.saveTokens(accessToken, refreshToken);
        console.log('✅ [saveFaceIDCredentials] Both tokens saved');
      }
    } catch (err) {
      console.warn('⚠️ [saveFaceIDCredentials] Failed:', err);
    }
  };

  attemptSave();
}

/**
 * Clear Face ID credentials (call on logout)
 */
export function clearFaceIDCredentials(): void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    if (window.M1SSIONFaceID) {
      window.M1SSIONFaceID.clearCredentials();
      console.log('✅ [clearFaceIDCredentials] Credentials cleared');
    }
  } catch (err) {
    console.warn('⚠️ [clearFaceIDCredentials] Failed:', err);
  }
}

export default useFaceIDLogin;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
