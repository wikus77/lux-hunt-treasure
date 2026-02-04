/**
 * M1SSION™ Face ID Hook (iOS Native Bridge)
 * © 2026 Joseph MULÉ – NIYVORA KFT – ALL RIGHTS RESERVED
 * 
 * USAGE:
 * This hook provides Face ID functionality for iOS native app.
 * It does NOT modify existing login - only adds optional biometric layer.
 * 
 * Web/PWA: Returns { available: false } - no changes to behavior
 * iOS Native: Provides Face ID authentication
 * 
 * IMPORTANT: This hook is OPTIONAL and NON-INVASIVE.
 * Login form remains unchanged.
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Type definitions for the native bridge
interface FaceIDAvailability {
  available: boolean;
  biometryType: 'faceID' | 'touchID' | 'opticID' | 'biometric' | 'none';
  hasStoredCredentials: boolean;
}

interface FaceIDAuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

// Type for the global window object with M1SSIONFaceID
declare global {
  interface Window {
    M1SSIONFaceID?: {
      checkAvailability: () => Promise<FaceIDAvailability>;
      authenticate: () => Promise<FaceIDAuthResult>;
      saveToken: (token: string) => void;
      clearCredentials: () => void;
    };
  }
}

export interface UseFaceIDReturn {
  // State
  isAvailable: boolean;
  biometryType: FaceIDAvailability['biometryType'];
  hasStoredCredentials: boolean;
  isAuthenticating: boolean;
  
  // Actions
  checkAvailability: () => Promise<FaceIDAvailability>;
  authenticate: () => Promise<FaceIDAuthResult>;
  saveTokenForFaceID: (token: string) => void;
  clearFaceIDCredentials: () => void;
}

/**
 * Hook for Face ID / Touch ID authentication on iOS
 * 
 * @returns Face ID state and methods
 */
export function useFaceID(): UseFaceIDReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<FaceIDAvailability['biometryType']>('none');
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if we're in iOS native context
  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Check availability on mount
  useEffect(() => {
    if (!isNativeiOS) return;

    // Wait for bridge to be available
    const checkBridge = async () => {
      // Give the native bridge time to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (window.M1SSIONFaceID) {
        try {
          const result = await window.M1SSIONFaceID.checkAvailability();
          setIsAvailable(result.available);
          setBiometryType(result.biometryType);
          setHasStoredCredentials(result.hasStoredCredentials);
          console.log('✅ [useFaceID] Availability:', result);
        } catch (err) {
          console.warn('⚠️ [useFaceID] Check failed:', err);
        }
      }
    };

    checkBridge();
  }, [isNativeiOS]);

  // Check availability (can be called manually)
  const checkAvailability = useCallback(async (): Promise<FaceIDAvailability> => {
    if (!isNativeiOS || !window.M1SSIONFaceID) {
      return { available: false, biometryType: 'none', hasStoredCredentials: false };
    }

    try {
      const result = await window.M1SSIONFaceID.checkAvailability();
      setIsAvailable(result.available);
      setBiometryType(result.biometryType);
      setHasStoredCredentials(result.hasStoredCredentials);
      return result;
    } catch (err) {
      console.error('❌ [useFaceID] checkAvailability error:', err);
      return { available: false, biometryType: 'none', hasStoredCredentials: false };
    }
  }, [isNativeiOS]);

  // Authenticate with Face ID
  const authenticate = useCallback(async (): Promise<FaceIDAuthResult> => {
    if (!isNativeiOS || !window.M1SSIONFaceID) {
      return { success: false, error: 'not_native' };
    }

    if (!isAvailable || !hasStoredCredentials) {
      return { success: false, error: 'no_credentials' };
    }

    setIsAuthenticating(true);

    try {
      const result = await window.M1SSIONFaceID.authenticate();
      console.log('✅ [useFaceID] Auth result:', result.success);
      return result;
    } catch (err) {
      console.error('❌ [useFaceID] authenticate error:', err);
      return { success: false, error: 'bridge_error' };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isNativeiOS, isAvailable, hasStoredCredentials]);

  // Save token for future Face ID logins (call after successful login)
  const saveTokenForFaceID = useCallback((token: string) => {
    if (!isNativeiOS || !window.M1SSIONFaceID) return;

    try {
      window.M1SSIONFaceID.saveToken(token);
      setHasStoredCredentials(true);
      console.log('✅ [useFaceID] Token saved for Face ID');
    } catch (err) {
      console.error('❌ [useFaceID] saveToken error:', err);
    }
  }, [isNativeiOS]);

  // Clear credentials (call on logout)
  const clearFaceIDCredentials = useCallback(() => {
    if (!isNativeiOS || !window.M1SSIONFaceID) return;

    try {
      window.M1SSIONFaceID.clearCredentials();
      setHasStoredCredentials(false);
      console.log('✅ [useFaceID] Credentials cleared');
    } catch (err) {
      console.error('❌ [useFaceID] clearCredentials error:', err);
    }
  }, [isNativeiOS]);

  return {
    isAvailable,
    biometryType,
    hasStoredCredentials,
    isAuthenticating,
    checkAvailability,
    authenticate,
    saveTokenForFaceID,
    clearFaceIDCredentials,
  };
}

export default useFaceID;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
