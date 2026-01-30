/**
 * 🔐 M1SSION™ Auth Deep Link Handler
 * Handles OAuth callback deep links for Capacitor native apps
 * 
 * © 2025 Joseph MULÉ – NIYVORA KFT™
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/lib/supabase/clientUtils';

// Custom URL scheme for M1SSION app
const APP_SCHEME = 'm1ssion';

/**
 * Get the correct redirect URL based on platform
 * - Web: Uses origin/auth/callback
 * - Capacitor iOS/Android: Uses Supabase callback (browser handles redirect back to app)
 */
export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    // For native apps, use Supabase hosted callback
    // Supabase will redirect back to app via universal links
    const supabaseUrl = getSupabaseUrl();
    return `${supabaseUrl}/auth/v1/callback`;
  }
  
  // For web
  return `${window.location.origin}/auth/callback`;
}

/**
 * Initialize deep link auth listener
 * Call this once at app startup
 */
export async function initDeepLinkAuth(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('🔐 [DeepLink] Skipping - not a native platform');
    return;
  }
  
  try {
    const { App } = await import('@capacitor/app');
    
    // Listen for app URL open events (deep links)
    App.addListener('appUrlOpen', async (event) => {
      console.log('🔗 [DeepLink] App opened with URL:', event.url);
      
      // Check if this is an auth callback
      if (event.url.includes('auth/callback') || 
          event.url.includes('access_token') || 
          event.url.includes('code=')) {
        
        console.log('🔐 [DeepLink] Processing OAuth callback...');
        
        try {
          // Extract the URL fragment/query params
          const url = new URL(event.url);
          
          // Handle hash fragment (implicit grant)
          if (url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken) {
              console.log('🔐 [DeepLink] Found access token, setting session...');
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (error) {
                console.error('❌ [DeepLink] Session error:', error);
              } else {
                console.log('✅ [DeepLink] Session set successfully');
                // Emit event for app to handle
                window.dispatchEvent(new CustomEvent('auth-deep-link-success', {
                  detail: { user: data.user }
                }));
              }
              return;
            }
          }
          
          // Handle PKCE flow (authorization code)
          const code = url.searchParams.get('code');
          if (code) {
            console.log('🔐 [DeepLink] Found auth code, exchanging...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('❌ [DeepLink] Code exchange error:', error);
            } else {
              console.log('✅ [DeepLink] Session established via PKCE');
              window.dispatchEvent(new CustomEvent('auth-deep-link-success', {
                detail: { user: data.user }
              }));
            }
            return;
          }
          
          console.log('⚠️ [DeepLink] No auth tokens found in URL');
        } catch (error) {
          console.error('❌ [DeepLink] Error processing callback:', error);
        }
      }
    });
    
    console.log('✅ [DeepLink] Auth listener initialized');
  } catch (error) {
    console.error('❌ [DeepLink] Failed to initialize:', error);
  }
}

/**
 * Handle the auth success event from deep link
 * Use this in components that need to react to OAuth success
 */
export function onAuthDeepLinkSuccess(callback: (user: any) => void): () => void {
  const handler = (event: CustomEvent) => {
    callback(event.detail.user);
  };
  
  window.addEventListener('auth-deep-link-success', handler as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('auth-deep-link-success', handler as EventListener);
  };
}

// Export for use in hooks
export { APP_SCHEME };
