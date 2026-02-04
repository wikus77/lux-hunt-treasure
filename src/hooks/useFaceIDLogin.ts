/**
 * M1SSION™ Face ID Login Hook v2
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * PURPOSE:
 * - Triggers Face ID when login screen is visible
 * - Handles auto-login on Face ID success using BOTH tokens
 * - Saves credentials after successful manual login
 * 
 * UPDATED: Now saves and restores both access_token AND refresh_token
 * 
 * CONSTRAINTS:
 * - NO UI modifications
 * - NO auth flow changes
 * - Only works on iOS native (PWA/web returns no-op)
 * - Completely non-blocking
 */

import { useEffect, useRef } from 'react';
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
      // UPDATED: Now returns both tokens
      authenticate: () => Promise<{
        success: boolean;
        accessToken?: string;
        refreshToken?: string;
        error?: string;
      }>;
      // NEW: Save both tokens
      saveTokens: (accessToken: string, refreshToken: string) => void;
      // LEGACY: Keep for backwards compatibility
      saveToken: (token: string) => void;
      clearCredentials: () => void;
    };
  }
}

interface UseFaceIDLoginOptions {
  /** Called when Face ID authentication succeeds */
  onSuccess?: () => void;
  /** Called when Face ID fails or is cancelled (user continues with manual login) */
  onFallback?: () => void;
}

/**
 * Hook to trigger Face ID when login screen is visible
 * 
 * @param isLoginVisible - Whether the login screen is currently visible
 * @param options - Callbacks for success/fallback
 */
export function useFaceIDLogin(
  isLoginVisible: boolean,
  options: UseFaceIDLoginOptions = {}
) {
  const { onSuccess, onFallback } = options;
  const { navigate } = useWouterNavigation();
  
  // Prevent multiple triggers
  const hasTriggeredRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Check if we're on iOS native
  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Trigger Face ID when login screen becomes visible
  useEffect(() => {
    if (!isLoginVisible || !isNativeiOS || hasTriggeredRef.current || isProcessingRef.current) {
      return;
    }

    // Wait for bridge to be available
    const triggerFaceID = async () => {
      // Give bridge time to initialize
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!window.M1SSIONFaceID) {
        console.log('⚠️ [useFaceIDLogin] Bridge not available');
        return;
      }

      try {
        // Check if Face ID is available and has stored credentials
        const availability = await window.M1SSIONFaceID.checkAvailability();
        console.log('🔐 [useFaceIDLogin] Availability:', availability);

        if (!availability.available || !availability.hasStoredCredentials) {
          console.log('🔐 [useFaceIDLogin] Face ID not available or no credentials');
          return;
        }

        // Mark as triggered to prevent re-trigger
        hasTriggeredRef.current = true;
        isProcessingRef.current = true;

        console.log('🔐 [useFaceIDLogin] Triggering Face ID prompt...');
        
        // Trigger Face ID authentication
        const result = await window.M1SSIONFaceID.authenticate();
        
        if (result.success && result.accessToken && result.refreshToken) {
          console.log('✅ [useFaceIDLogin] Face ID SUCCESS - Restoring session...');
          
          // Restore session using BOTH tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: result.accessToken,
            refresh_token: result.refreshToken
          });
          
          if (data.session && !error) {
            console.log('✅ [useFaceIDLogin] Session restored successfully');
            
            toast.success('Login effettuato', {
              description: 'Accesso tramite Face ID'
            });
            
            // Dispatch auth success event
            window.dispatchEvent(new CustomEvent('auth-success', { 
              detail: { timestamp: Date.now(), method: 'faceid' } 
            }));
            
            // Navigate to map
            navigate('/map-3d-tiler');
            onSuccess?.();
          } else {
            console.warn('⚠️ [useFaceIDLogin] Session restore failed:', error?.message);
            
            // Try refreshing with the refresh token
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: result.refreshToken
            });
            
            if (refreshData.session && !refreshError) {
              console.log('✅ [useFaceIDLogin] Session refreshed successfully');
              
              // Update stored tokens with new ones
              if (window.M1SSIONFaceID && refreshData.session.access_token && refreshData.session.refresh_token) {
                window.M1SSIONFaceID.saveTokens(
                  refreshData.session.access_token,
                  refreshData.session.refresh_token
                );
              }
              
              toast.success('Login effettuato', {
                description: 'Accesso tramite Face ID'
              });
              
              window.dispatchEvent(new CustomEvent('auth-success', { 
                detail: { timestamp: Date.now(), method: 'faceid' } 
              }));
              
              navigate('/map-3d-tiler');
              onSuccess?.();
            } else {
              console.error('❌ [useFaceIDLogin] Refresh also failed:', refreshError?.message);
              // Clear invalid credentials
              window.M1SSIONFaceID?.clearCredentials();
              toast.error('Sessione scaduta', {
                description: 'Effettua il login manualmente'
              });
              onFallback?.();
            }
          }
        } else {
          console.log('🔐 [useFaceIDLogin] Face ID cancelled/failed:', result.error);
          // User cancelled or failed - just let them use manual login
          onFallback?.();
        }
      } catch (err) {
        console.error('❌ [useFaceIDLogin] Error:', err);
        onFallback?.();
      } finally {
        isProcessingRef.current = false;
      }
    };

    triggerFaceID();
  }, [isLoginVisible, isNativeiOS, navigate, onSuccess, onFallback]);

  // Reset trigger when login screen is hidden
  useEffect(() => {
    if (!isLoginVisible) {
      hasTriggeredRef.current = false;
    }
  }, [isLoginVisible]);

  return {
    isNativeiOS,
    isProcessing: isProcessingRef.current,
  };
}

/**
 * Save BOTH tokens to Keychain after successful login
 * Call this AFTER successful email/password login
 * 
 * @param accessToken - The access token
 * @param refreshToken - The refresh token
 */
export function saveFaceIDCredentials(accessToken: string, refreshToken: string): void {
  // Only on iOS native
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    if (window.M1SSIONFaceID?.saveTokens) {
      window.M1SSIONFaceID.saveTokens(accessToken, refreshToken);
      console.log('✅ [saveFaceIDCredentials] Both tokens saved for Face ID');
    } else if (window.M1SSIONFaceID?.saveToken) {
      // Fallback to legacy (won't work properly but won't crash)
      console.warn('⚠️ [saveFaceIDCredentials] Using legacy saveToken - session restore may fail');
      window.M1SSIONFaceID.saveToken(accessToken);
    }
  } catch (err) {
    console.warn('⚠️ [saveFaceIDCredentials] Failed to save:', err);
  }
}

/**
 * Clear Face ID credentials (call on logout)
 */
export function clearFaceIDCredentials(): void {
  // Only on iOS native
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    if (window.M1SSIONFaceID) {
      window.M1SSIONFaceID.clearCredentials();
      console.log('✅ [clearFaceIDCredentials] Credentials cleared');
    }
  } catch (err) {
    console.warn('⚠️ [clearFaceIDCredentials] Failed to clear:', err);
  }
}

export default useFaceIDLogin;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
