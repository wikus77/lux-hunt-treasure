
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { toast } from 'sonner';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We get the base authentication functionality from our useAuth hook
  const auth = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch user role when auth state changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!auth.isAuthenticated || !auth.user) {
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        
        // Prima prova con l'ID dell'utente
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .maybeSingle();

        if (dataById) {
          console.log("Ruolo utente trovato tramite ID:", dataById.role);
          setUserRole(dataById.role);
          setIsRoleLoading(false);
          return;
        }
        
        if (errorById) {
          console.error('Error fetching user role by ID:', errorById);
        }

        // Se non trova tramite ID, prova con l'email
        if (auth.user.email) {
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', auth.user.email)
            .maybeSingle();

          if (dataByEmail) {
            console.log("Ruolo utente trovato tramite email:", dataByEmail.role);
            setUserRole(dataByEmail.role);
            setIsRoleLoading(false);
            return;
          }
          
          if (errorByEmail) {
            console.error('Error fetching user role by email:', errorByEmail);
          }
        }

        // Se non trova né per ID né per email e l'utente è wikus77@hotmail.it, crea il profilo admin
        if (auth.user.email === 'wikus77@hotmail.it') {
          console.log("Creazione automatica profilo admin per:", auth.user.email);
          
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: auth.user.id,
              email: auth.user.email,
              role: 'admin',
              full_name: 'Admin User'
            })
            .select('role')
            .maybeSingle();
            
          if (insertError) {
            console.error("Errore creazione profilo admin:", insertError);
          } else {
            console.log("Profilo admin creato con successo:", newProfile?.role);
            setUserRole(newProfile?.role || 'admin');
            setIsRoleLoading(false);
            return;
          }
        }
        
        // Default fallback
        setUserRole(null);
      } catch (error) {
        console.error('Exception fetching user role:', error);
        setUserRole(null);
      } finally {
        setIsRoleLoading(false);
      }
    };

    fetchUserRole();
    
    // Mark auth as initialized after first load
    if (!authInitialized && !auth.isLoading) {
      setAuthInitialized(true);
    }
    
  }, [auth.isAuthenticated, auth.user, auth.isLoading]);

  // Show loading state on first initialization
  useEffect(() => {
    if (auth.isLoading && !authInitialized) {
      console.log('Auth is initializing...');
    } else if (authInitialized) {
      console.log('Auth initialization complete');
    }
  }, [auth.isLoading, authInitialized]);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  // Create the complete context value by combining auth hook values with role information
  const authContextValue: AuthContextType = {
    ...auth,
    userRole,
    hasRole,
    isRoleLoading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
