
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Funzione per creare automaticamente il profilo admin
  const createAdminProfile = async (userId: string, userEmail: string) => {
    console.log("⚠️ Tentativo di creazione profilo admin per:", userEmail);
    
    try {
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          role: 'admin',
          full_name: 'Admin User'
        })
        .select('role')
        .single();
        
      if (error) {
        console.error("❌ Errore nella creazione del profilo admin:", error);
        return false;
      }
      
      console.log("✅ Profilo admin creato con successo:", newProfile?.role);
      setUserRole(newProfile?.role || 'admin');
      return true;
    } catch (err) {
      console.error("❌ Exception durante la creazione del profilo admin:", err);
      return false;
    }
  };

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
        console.log("🔍 Cerco profilo per user:", auth.user.id, auth.user.email);
        
        // Prima prova con l'ID dell'utente
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', auth.user.id)
          .maybeSingle();

        if (dataById && dataById.role) {
          console.log("✅ Ruolo utente trovato tramite ID:", dataById.role);
          setUserRole(dataById.role);
          setIsRoleLoading(false);
          setRetryCount(0);
          return;
        }
        
        if (errorById) {
          console.error('❌ Error fetching user role by ID:', errorById);
        }

        // Se non trova tramite ID, prova con l'email
        if (auth.user.email) {
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('profiles')
            .select('role, id')
            .eq('email', auth.user.email)
            .maybeSingle();

          if (dataByEmail && dataByEmail.role) {
            console.log("✅ Ruolo utente trovato tramite email:", dataByEmail.role);
            setUserRole(dataByEmail.role);
            setIsRoleLoading(false);
            setRetryCount(0);
            return;
          }
          
          if (errorByEmail) {
            console.error('❌ Error fetching user role by email:', errorByEmail);
          }
        }

        // Se non trova né per ID né per email e l'utente è wikus77@hotmail.it, crea il profilo admin
        if (auth.user.email === 'wikus77@hotmail.it') {
          const success = await createAdminProfile(auth.user.id, auth.user.email);
          if (success) {
            setIsRoleLoading(false);
            setRetryCount(0);
            return;
          }
        }
        
        // Se siamo qui, non abbiamo trovato alcun profilo
        // Incrementiamo il numero di tentativi e proviamo di nuovo se non abbiamo superato il limite
        if (retryCount < maxRetries) {
          console.log(`⚠️ Nessun profilo trovato, ritento (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          
          // Ritentiamo dopo un breve ritardo
          setTimeout(() => {
            fetchUserRole();
          }, 1000);
          return;
        }
        
        // Default fallback dopo tutti i tentativi
        console.log("⚠️ Nessun profilo trovato dopo multipli tentativi");
        setUserRole(null);
      } catch (error) {
        console.error('❌ Exception fetching user role:', error);
        setUserRole(null);
      } finally {
        if (retryCount >= maxRetries) {
          setIsRoleLoading(false);
        }
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
      console.log('🔄 Auth is initializing...');
    } else if (authInitialized) {
      console.log('✅ Auth initialization complete');
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
