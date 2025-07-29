// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure Admin Check Hook - Replaces all hardcoded email checks

import { useState, useEffect } from 'react';
import { isSecureAdmin } from '@/utils/security-hardening';
import { useAuthContext } from '@/contexts/auth';

export const useSecureAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuthContext();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const adminStatus = await isSecureAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  return { isAdmin, isLoading };
};

export default useSecureAdminCheck;