/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Google Auth Integration Hook
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    setLoading(true);
    
    try {
      console.log('🔐 Initiating Google Auth sign-in...');
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile'
        }
      });

      if (error) {
        console.error('Google Auth error:', error);
        toast.error('Errore durante l\'accesso con Google', {
          description: error.message
        });
        return { success: false, error: error.message };
      }

      if (data.url) {
        console.log('✅ Google Auth URL generated, redirecting...');
        // The redirect will happen automatically
        toast.success('Reindirizzamento a Google...', {
          description: 'Ti stiamo reindirizzando per completare l\'accesso'
        });
        return { success: true };
      }

      return { success: false, error: 'No redirect URL received' };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Errore imprevisto durante l\'accesso');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    // Google signup uses the same flow as signin
    return signInWithGoogle();
  }, [signInWithGoogle]);

  const handleGoogleCallback = useCallback(async () => {
    try {
      console.log('🔄 Processing Google auth callback...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        toast.error('Errore durante il recupero della sessione');
        return { success: false, error: error.message };
      }

      if (session?.user) {
        console.log('✅ Google auth successful:', session.user.email);
        
        // Check if user profile exists, create if needed
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          console.log('🆕 Creating new profile for Google user...');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
              first_name: session.user.user_metadata?.given_name,
              last_name: session.user.user_metadata?.family_name,
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

        toast.success('🎉 Accesso effettuato con Google!', {
          description: `Benvenuto, ${session.user.user_metadata?.full_name || session.user.email}!`
        });

        return { success: true, user: session.user };
      }

      return { success: false, error: 'No user session found' };
    } catch (error: any) {
      console.error('Google callback error:', error);
      toast.error('Errore durante il completamento dell\'accesso');
      return { success: false, error: error.message };
    }
  }, []);

  return {
    signInWithGoogle,
    signUpWithGoogle,
    handleGoogleCallback,
    loading
  };
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */