/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Apple Auth Integration Hook
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface AppleAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export const useAppleAuth = () => {
  const [loading, setLoading] = useState(false);

  // Check if Apple Sign In is available
  const isAppleSignInAvailable = useCallback(() => {
    // Check for iOS Safari or macOS Safari
    const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // Apple Sign In is available on Apple devices with Safari
    // or on any device that supports the Apple ID sign-in web API
    return isAppleDevice || typeof window !== 'undefined';
  }, []);

  const signInWithApple = useCallback(async (): Promise<AppleAuthResult> => {
    if (!isAppleSignInAvailable()) {
      toast.error('Sign in with Apple non è supportato su questo dispositivo');
      return { success: false, error: 'Apple Sign In not supported' };
    }

    setLoading(true);
    
    try {
      console.log('🍎 Initiating Apple Auth sign-in...');
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
          scopes: 'name email'
        }
      });

      if (error) {
        console.error('Apple Auth error:', error);
        toast.error('Errore durante l\'accesso con Apple', {
          description: error.message
        });
        return { success: false, error: error.message };
      }

      if (data.url) {
        console.log('✅ Apple Auth URL generated, redirecting...');
        // The redirect will happen automatically
        toast.success('Reindirizzamento ad Apple...', {
          description: 'Ti stiamo reindirizzando per completare l\'accesso'
        });
        return { success: true };
      }

      return { success: false, error: 'No redirect URL received' };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      toast.error('Errore imprevisto durante l\'accesso con Apple');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [isAppleSignInAvailable]);

  const signUpWithApple = useCallback(async (): Promise<AppleAuthResult> => {
    // Apple signup uses the same flow as signin
    return signInWithApple();
  }, [signInWithApple]);

  const handleAppleCallback = useCallback(async () => {
    try {
      console.log('🔄 Processing Apple auth callback...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        toast.error('Errore durante il recupero della sessione');
        return { success: false, error: error.message };
      }

      if (session?.user) {
        console.log('✅ Apple auth successful:', session.user.email);
        
        // Check if user profile exists, create if needed
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          console.log('🆕 Creating new profile for Apple user...');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || 
                         (session.user.user_metadata?.name ? 
                          `${session.user.user_metadata.name.firstName || ''} ${session.user.user_metadata.name.lastName || ''}`.trim() :
                          null),
              first_name: session.user.user_metadata?.name?.firstName,
              last_name: session.user.user_metadata?.name?.lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail the auth process for profile creation errors
          } else {
            console.log('✅ Profile created successfully');
          }
        }

        toast.success('🎉 Accesso effettuato con Apple!', {
          description: `Benvenuto!`
        });

        return { success: true, user: session.user };
      }

      return { success: false, error: 'No user session found' };
    } catch (error: any) {
      console.error('Apple callback error:', error);
      toast.error('Errore durante il completamento dell\'accesso');
      return { success: false, error: error.message };
    }
  }, []);

  return {
    signInWithApple,
    signUpWithApple,
    handleAppleCallback,
    isAppleSignInAvailable,
    loading
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */