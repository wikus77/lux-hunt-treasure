
import { useUnifiedAuthContext } from '@/contexts/auth/UnifiedAuthProvider';

export function useDynamicIslandSafety() {
  const { user, session, isAuthenticated } = useUnifiedAuthContext();

  const isActive = !!user && !!session && isAuthenticated === true;
  
  // Add the missing isBuzzSafe property that useDynamicIsland.ts expects
  const isBuzzSafe = {
    isSafe: isActive && !!session && !user?.user_metadata?.banned
  };

  return {
    isActive,
    user,
    session,
    isAuthenticated,
    isBuzzSafe,
  };
}
