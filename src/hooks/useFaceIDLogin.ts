/**
 * M1SSION™ Face ID Login Hook
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * PURPOSE:
 * - Triggers Face ID when login screen is visible
 * - Handles auto-login on Face ID success
 * - Saves credentials after successful manual login
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

// Type for Face ID bridge
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
        token?: string;
        error?: string;
      }>;
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
        
        if (result.success && result.token) {
          console.log('✅ [useFaceIDLogin] Face ID SUCCESS');
          
          // Auto-login with stored token using Supabase
          // The token is stored as a refresh token, use it to get a new session
          const { data, error } = await supabase.auth.setSession({
            access_token: result.token,
            refresh_token: result.token
          });
          
          if (data.session && !error) {
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
            console.warn('⚠️ [useFaceIDLogin] Token login failed, fallback to manual', error);
            // Clear invalid credentials
            window.M1SSIONFaceID?.clearCredentials();
            onFallback?.();
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
 * Save credentials to Keychain after successful login
 * Call this AFTER successful email/password login
 * 
 * @param token - The auth token to save
 */
export function saveFaceIDCredentials(token: string): void {
  // Only on iOS native
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return;
  }

  try {
    if (window.M1SSIONFaceID) {
      window.M1SSIONFaceID.saveToken(token);
      console.log('✅ [saveFaceIDCredentials] Token saved for Face ID');
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
