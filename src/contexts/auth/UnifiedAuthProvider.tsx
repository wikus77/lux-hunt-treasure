
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedAuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    checkSession();
    return () => listener?.subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!user?.id && !!session?.access_token;

  return (
    <UnifiedAuthContext.Provider value={{ session, user, isAuthenticated }}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuthContext = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) throw new Error('useUnifiedAuthContext deve essere usato all’interno di UnifiedAuthProvider');
  return context;
};
