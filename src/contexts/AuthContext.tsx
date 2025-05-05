
import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/use-auth';

// Definizione del tipo per il contesto
interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  logout: () => Promise<void>;
  getCurrentUser: () => any;
  getAccessToken: () => string | null;
}

// Creazione del contesto con un valore di default vuoto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizzato per usare il contesto
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext deve essere usato all\'interno di un AuthProvider');
  }
  
  return context;
};
