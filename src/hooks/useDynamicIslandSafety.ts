
import { useUnifiedAuthContext } from '@/contexts/auth/UnifiedAuthProvider';

export function useDynamicIslandSafety() {
  const { user, session, isAuthenticated } = useUnifiedAuthContext();

  const isActive = !!user && !!session && isAuthenticated === true;

  return {
    isActive,
    user,
    session,
    isAuthenticated,
  };
}
