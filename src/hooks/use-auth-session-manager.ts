
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAuthTokenKey } from '@/lib/supabase/clientUtils';

interface SessionManagerResult {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  forceSessionFromTokens: (accessToken: string, refreshToken?: string) => Promise<boolean>;
  clearSession: () => Promise<void>;
}

export const useAuthSessionManager = (): SessionManagerResult => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced session forcing for developer auto-login with detailed diagnostics
  const forceSessionFromTokens = async (accessToken: string, refreshToken?: string): Promise<boolean> => {
    console.log('🔧 FORCING SESSION FROM TOKENS (Enhanced Diagnostics)...');
    console.log('📊 Input Analysis:', {
      accessTokenProvided: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenProvided: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      tokenFormat: accessToken?.split('.').length === 3 ? 'JWT' : 'Custom'
    });
    
    try {
      // Primary method: Use Supabase's setSession with enhanced validation
      if (refreshToken && accessToken) {
        console.log('🔄 Attempting setSession with both tokens...');
        const sessionData = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        console.log('📊 SetSession Result:', {
          hasError: !!sessionData.error,
          hasData: !!sessionData.data,
          hasSession: !!sessionData.data?.session,
          hasUser: !!sessionData.data?.user,
          errorMessage: sessionData.error?.message
        });
        
        if (!sessionData.error && sessionData.data?.session) {
          console.log('✅ SESSION FORCED SUCCESS via setSession');
          setSession(sessionData.data.session);
          setUser(sessionData.data.session.user);
          
          // Enhanced localStorage backup for persistence
          const sessionBackup = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: sessionData.data.session.expires_at,
            user: sessionData.data.session.user,
            created_at: Date.now(),
            source: 'enhanced_developer_auto_login',
            version: '2.0'
          };
          
          localStorage.setItem(getAuthTokenKey(), JSON.stringify(sessionBackup));
          console.log('💾 Enhanced session backup stored in localStorage');
          
          return true;
        } else {
          console.log('⚠️ setSession failed, error:', sessionData.error);
        }
      }
      
      // Fallback method: Manual session construction with enhanced validation
      console.log('🔄 CONSTRUCTING ENHANCED MANUAL SESSION...');
      
      try {
        // Enhanced JWT payload parsing
        const tokenParts = accessToken.split('.');
        let tokenPayload: any = {};
        
        if (tokenParts.length === 3) {
          try {
            // Properly decode base64url
            const base64Payload = tokenParts[1]
              .replace(/-/g, '+')
              .replace(/_/g, '/');
            const padding = base64Payload.length % 4;
            const paddedPayload = base64Payload + '='.repeat(padding ? 4 - padding : 0);
            
            tokenPayload = JSON.parse(atob(paddedPayload));
            console.log('✅ JWT payload decoded successfully:', {
              sub: tokenPayload.sub,
              email: tokenPayload.email,
              exp: tokenPayload.exp,
              iat: tokenPayload.iat
            });
          } catch (decodeError) {
            console.log('⚠️ JWT decode failed, using fallback payload:', decodeError);
          }
        }
        
        // Enhanced manual session with complete user data structure
        const manualSession: Session = {
          access_token: accessToken,
          refresh_token: refreshToken || `enhanced_refresh_${Date.now()}`,
          expires_in: 3600,
          expires_at: tokenPayload.exp || Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: tokenPayload.sub || `enhanced_user_${Date.now()}`,
            email: tokenPayload.email || 'wikus77@hotmail.it',
            email_confirmed_at: tokenPayload.email_confirmed_at || new Date().toISOString(),
            confirmed_at: tokenPayload.confirmed_at || new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {
              provider: 'enhanced_developer_login',
              providers: ['enhanced_developer_login'],
              ...tokenPayload.app_metadata
            },
            user_metadata: {
              enhanced_auto_login: true,
              login_method: 'developer_session_force',
              ...tokenPayload.user_metadata
            },
            aud: tokenPayload.aud || 'authenticated',
            created_at: tokenPayload.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: tokenPayload.role || 'authenticated'
          }
        };
        
        console.log('✅ ENHANCED MANUAL SESSION CONSTRUCTED');
        
        setSession(manualSession);
        setUser(manualSession.user);
        
        // Store enhanced session data with detailed metadata
        const sessionBackup = {
          ...manualSession,
          created_at: Date.now(),
          source: 'manual_construction_enhanced',
          version: '2.0',
          diagnostics: {
            tokenLength: accessToken.length,
            hasRefreshToken: !!refreshToken,
            jwtDecoded: tokenParts.length === 3,
            timestamp: new Date().toISOString()
          }
        };
        
        localStorage.setItem(getAuthTokenKey(), JSON.stringify(sessionBackup));
        console.log('💾 Enhanced manual session stored with full diagnostics');
        
        return true;
        
      } catch (constructionError) {
        console.error('❌ Enhanced manual session construction failed:', constructionError);
        return false;
      }
      
    } catch (error) {
      console.error('❌ FORCE SESSION CRITICAL ERROR:', error);
      return false;
    }
  };

  const clearSession = async (): Promise<void> => {
    console.log('🧹 Clearing all session data (enhanced)...');
    setSession(null);
    setUser(null);
    localStorage.removeItem(getAuthTokenKey());
    // ⚠️ FIX: DO NOT call signOut() here!
    // The calling code (use-auth.ts) already calls signOut({ scope: 'local' })
    // A second signOut() without scope would REVOKE the refresh token server-side,
    // breaking Face ID auto-login after logout.
    console.log('✅ Session cleared locally (no server signOut - preserves Face ID tokens)');
  };

  // Enhanced session initialization with comprehensive diagnostics
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🔍 INITIALIZING SESSION (Enhanced Diagnostics)...');
      
      try {
        // Method 1: Check for active Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 Supabase session check:', {
          hasError: !!error,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at
        });
        
        if (!error && session && session.user) {
          console.log('✅ ACTIVE SUPABASE SESSION FOUND');
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          return;
        }
        
        // Method 2: Check localStorage for developer session backup
        const storedSession = localStorage.getItem(getAuthTokenKey());
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            console.log('🔄 RESTORING SESSION FROM BACKUP:', {
              userEmail: parsedSession.user?.email,
              source: parsedSession.source,
              version: parsedSession.version,
              hasAccessToken: !!parsedSession.access_token,
              hasUser: !!parsedSession.user
            });
            
            // Check if session is still valid
            const now = Math.floor(Date.now() / 1000);
            const isExpired = parsedSession.expires_at && parsedSession.expires_at <= now;
            
            console.log('📊 Session validation:', {
              expiresAt: parsedSession.expires_at,
              currentTime: now,
              isExpired,
              timeRemaining: parsedSession.expires_at ? parsedSession.expires_at - now : 0
            });
            
            if (!isExpired && parsedSession.user && parsedSession.access_token) {
              console.log('✅ Backup session still valid, restoring...');
              setSession(parsedSession);
              setUser(parsedSession.user);
              
              // Try to refresh the session with Supabase in background
              if (parsedSession.access_token && parsedSession.refresh_token) {
                setTimeout(() => {
                  supabase.auth.setSession({
                    access_token: parsedSession.access_token,
                    refresh_token: parsedSession.refresh_token
                  }).then(result => {
                    console.log('🔄 Background session refresh result:', {
                      hasError: !!result.error,
                      errorMessage: result.error?.message
                    });
                  }).catch(err => console.log('Background session refresh failed:', err));
                }, 1000);
              }
            } else {
              console.log('⚠️ STORED SESSION EXPIRED OR INVALID, clearing...');
              localStorage.removeItem(getAuthTokenKey());
            }
          } catch (parseError) {
            console.error('❌ PARSE STORED SESSION ERROR:', parseError);
            localStorage.removeItem(getAuthTokenKey());
          }
        }
        
      } catch (error) {
        console.error('❌ SESSION INIT ERROR:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Enhanced auth state listener with detailed logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 ENHANCED AUTH STATE CHANGE:', {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email || 'No session',
        timestamp: new Date().toISOString()
      });
      
      if (session && session.user) {
        console.log('📝 Updating session from auth state change...');
        setSession(session);
        setUser(session.user);
        
        // Update localStorage backup with enhanced metadata
        const sessionBackup = {
          ...session,
          created_at: Date.now(),
          source: 'auth_state_change_enhanced',
          version: '2.0',
          event_type: event
        };
        localStorage.setItem(getAuthTokenKey(), JSON.stringify(sessionBackup));
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, clearing enhanced session...');
        await clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    forceSessionFromTokens,
    clearSession
  };
};
