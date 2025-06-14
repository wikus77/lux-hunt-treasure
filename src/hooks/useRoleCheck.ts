import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

export function useRoleCheck() {
  const { userRole, hasRole, isRoleLoading } = useUnifiedAuth();
  const [isQaUser, setIsQaUser] = useState<boolean>(false);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSpecialUser, setIsSpecialUser] = useState<boolean>(false);
  
  useEffect(() => {
    // Check roles once role loading is complete
    if (!isRoleLoading) {
      const qaCheck = hasRole('qa');
      const devCheck = hasRole('developer');
      const adminCheck = hasRole('admin');
      
      setIsQaUser(qaCheck);
      setIsDeveloper(devCheck);
      setIsAdmin(adminCheck);
      setIsSpecialUser(qaCheck || devCheck || adminCheck);
    }
  }, [hasRole, isRoleLoading]);
  
  // Helper function to exclude QA users from data
  const filterQaUsers = useCallback((data: any[]) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Filter out QA users based on common properties
      if (item.email === 'qa@mission.dev') return false;
      if (item.agent_code === 'AG-QA001') return false;
      if (item.user_id === '11111111-1111-1111-1111-111111111111') return false;
      if (item.id === '11111111-1111-1111-1111-111111111111') return false;
      
      // Keep all other users
      return true;
    });
  }, []);
  
  return {
    isQaUser,
    isDeveloper,
    isAdmin,
    isSpecialUser,
    filterQaUsers
  };
}
