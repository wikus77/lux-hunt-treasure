// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure Authentication Hook with Rate Limiting & Audit Logging

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail, sanitizePassword, checkClientRateLimit, getClientIP } from '@/utils/input-sanitizer';
import { toast } from 'sonner';

interface SecureAuthState {
  isLoading: boolean;
  error: string | null;
}

export const useSecureAuth = () => {
  const [state, setState] = useState<SecureAuthState>({
    isLoading: false,
    error: null
  });

  const logSecurityEvent = async (action: string, details: any = {}) => {
    try {
      // Log to new security_events table
      await supabase
        .from('security_events')
        .insert({
          event_type: action,
          event_data: details,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      // Fail silently in production to avoid exposure
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to log security event:', error);
      }
    }
  };

  const secureLogin = async (email: string, password: string) => {
    setState({ isLoading: true, error: null });
    
    try {
      // Input sanitization
      const cleanEmail = sanitizeEmail(email);
      const cleanPassword = sanitizePassword(password);
      
      // Client-side rate limiting
      const clientId = getClientIP();
      if (!checkClientRateLimit(`login_${clientId}`, 3, 300000)) { // 3 attempts per 5 minutes
        setState({ isLoading: false, error: 'Troppi tentativi di login. Riprova tra qualche minuto.' });
        toast.error('Troppi tentativi di login');
        return { success: false, error: 'Rate limit exceeded' };
      }
      
      // Simple rate limiting using existing api_rate_limits table
      const { data: rateData } = await supabase
        .from('api_rate_limits')
        .select('request_count, window_start')
        .eq('ip_address', '127.0.0.1') // Placeholder IP
        .eq('endpoint', 'auth_login')
        .gte('window_start', new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .single();
      
      if (rateData && rateData.request_count > 5) {
        await logSecurityEvent('login_rate_limited', { email: cleanEmail });
        setState({ isLoading: false, error: 'Troppi tentativi di login. Riprova più tardi.' });
        toast.error('Account temporaneamente bloccato per sicurezza');
        return { success: false, error: 'Server rate limit exceeded' };
      }
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // Log failed login attempt
        await logSecurityEvent('login_failed', { 
          email: cleanEmail, 
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        setState({ isLoading: false, error: error.message });
        return { success: false, error };
      }

      // Log successful login
      await logSecurityEvent('login_success', { 
        email: cleanEmail,
        timestamp: new Date().toISOString()
      });
      
      setState({ isLoading: false, error: null });
      return { success: true, session: data.session };
      
    } catch (error: any) {
      await logSecurityEvent('login_exception', { 
        email: sanitizeEmail(email),
        error: error.message 
      });
      
      setState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  };

  const secureRegister = async (email: string, password: string, fullName: string) => {
    setState({ isLoading: true, error: null });
    
    try {
      // Input sanitization
      const cleanEmail = sanitizeEmail(email);
      const cleanPassword = sanitizePassword(password);
      const cleanName = fullName.trim().substring(0, 100);
      
      // Client-side rate limiting
      const clientId = getClientIP();
      if (!checkClientRateLimit(`register_${clientId}`, 2, 600000)) { // 2 attempts per 10 minutes
        setState({ isLoading: false, error: 'Troppi tentativi di registrazione. Riprova più tardi.' });
        toast.error('Troppi tentativi di registrazione');
        return { success: false, error: 'Rate limit exceeded' };
      }
      
      // Simple rate limiting check for registration
      const { data: rateData } = await supabase
        .from('api_rate_limits')
        .select('request_count, window_start')
        .eq('ip_address', '127.0.0.1') // Placeholder IP
        .eq('endpoint', 'auth_register')
        .gte('window_start', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .single();
      
      if (rateData && rateData.request_count > 3) {
        await logSecurityEvent('register_rate_limited', { email: cleanEmail });
        setState({ isLoading: false, error: 'Troppi tentativi di registrazione.' });
        return { success: false, error: 'Server rate limit exceeded' };
      }
      
      // Attempt registration
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: cleanName,
            subscription_plan: 'base',
            access_enabled: false,
            status: 'registered_pending'
          }
        }
      });

      if (error) {
        await logSecurityEvent('register_failed', { 
          email: cleanEmail, 
          error: error.message 
        });
        
        setState({ isLoading: false, error: error.message });
        return { success: false, error };
      }

      // Log successful registration
      await logSecurityEvent('register_success', { 
        email: cleanEmail,
        name: cleanName,
        timestamp: new Date().toISOString()
      });
      
      setState({ isLoading: false, error: null });
      return { success: true, data };
      
    } catch (error: any) {
      await logSecurityEvent('register_exception', { 
        email: sanitizeEmail(email),
        error: error.message 
      });
      
      setState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  };

  return {
    ...state,
    secureLogin,
    secureRegister
  };
};