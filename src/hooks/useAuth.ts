// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// Simple Auth Hook - Wrapper for AuthContext

import { useAuthContext } from '@/contexts/auth';

export const useAuth = () => {
  return useAuthContext();
};