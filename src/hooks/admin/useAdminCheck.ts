
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = (redirectOnFail = true) => {
  const { isAuthenticated, hasRole, isRoleLoading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
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
