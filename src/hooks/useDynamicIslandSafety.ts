
import { useUnifiedAuthContext } from '@/contexts/auth/UnifiedAuthProvider';

export const useDynamicIslandSafety = () => {
  const { user, session, isAuthenticated } = useUnifiedAuthContext();

  const isBuzzSafe = !!user?.id && !!session?.access_token && isAuthenticated === true;

  return {
    user,
    session,
    isAuthenticated,
    isBuzzSafe,
  }
};
