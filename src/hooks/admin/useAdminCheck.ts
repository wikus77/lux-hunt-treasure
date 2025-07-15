
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { useWouterNavigation } from '../useWouterNavigation';

export const useAdminCheck = (redirectOnFail = true) => {
  const { isAuthenticated, hasRole, isRoleLoading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { navigate } = useWouterNavigation();
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isRoleLoading) {
        const admin = isAuthenticated && hasRole('admin');
        setIsAdmin(admin);
        
        if (redirectOnFail && !admin) {
          navigate('/access-denied');
        }
      }
    };
    
    checkAdminRole();
  }, [isAuthenticated, hasRole, isRoleLoading, redirectOnFail, navigate]);
  
  return { isAdmin, isRoleLoading };
};
