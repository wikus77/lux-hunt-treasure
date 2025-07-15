
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { useNavigateCompat } from "@/hooks/useNavigateCompat";

export const useAdminCheck = (redirectOnFail = true) => {
  const { isAuthenticated, hasRole, isRoleLoading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigateCompat();
  
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
