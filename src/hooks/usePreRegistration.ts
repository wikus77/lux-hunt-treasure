// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface PreRegistrationData {
  id: string;
  email: string;
  agent_code: string;
  name: string;
  password_hash: string;
  is_pre_registered: boolean;
  is_verified: boolean;
  created_at: string;
}

export const usePreRegistration = () => {
  const [preRegData, setPreRegData] = useState<PreRegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useUnifiedAuth();

  const checkPreRegistration = async (email?: string) => {
    if (!email && !user?.email) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('pre_registered_users')
        .select('*')
        .eq('email', email || user?.email)
        .single();

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw queryError;
      }

      setPreRegData(data || null);
    } catch (err: any) {
      console.error('Error checking pre-registration:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerPreUser = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('pre_registered_users')
        .insert({
          email: email.toLowerCase(),
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          throw new Error('Email già registrata per l\'accesso anticipato');
        }
        throw insertError;
      }

      setPreRegData(data);
      return data;
    } catch (err: any) {
      console.error('Error in pre-registration:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isPreRegistered = () => {
    return !!preRegData;
  };

  const hasEarlyAccess = () => {
    return preRegData?.is_verified || false;
  };

  const getAccessTime = () => {
    // For now, return default mission start time
    return new Date('2025-08-19T05:00:00Z');
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      checkPreRegistration();
    }
  }, [isAuthenticated, user?.email]);

  return {
    preRegData,
    isLoading,
    error,
    checkPreRegistration,
    registerPreUser,
    isPreRegistered,
    hasEarlyAccess,
    getAccessTime,
  };
};