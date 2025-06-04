
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

  console.log('🏗️ AuthProvider: Rendered with auth state:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasUser: !!auth.user,
    hasSession: !!auth.session,
    userRole,
    isRoleLoading
  });

  // Funzione per creare automaticamente il profilo admin
  const createAdminProfile = async (userId: string, userEmail: string) => {
    console.log("⚠️ AuthProvider: Tentativo di creazione profilo admin per:", userEmail);
    
    try {
      // First try the direct approach
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
        console.error("❌ AuthProvider: Errore nella creazione del profilo admin:", error);
        return false;
      }
      
      console.log("✅ AuthProvider: Profilo admin creato con successo:", newProfile?.role);
      setUserRole(newProfile?.role || 'admin');
      return true;
    } catch (err) {
      console.error("❌ AuthProvider: Exception durante la creazione del profilo admin:", err);
      return false;
    }
  };

  // Fetch user role when auth state changes
  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('🔍 AuthProvider: fetchUserRole called, auth state:', {
        isAuthenticated: auth.isAuthenticated,
        hasUser: !!auth.user,
        userId: auth.user?.id,
        userEmail: auth.user?.email
      });

      // Se non c'è utente autenticato, resetta il ruolo
      if (!auth.isAuthenticated || !auth.user) {
        console.log('👤 AuthProvider: No authenticated user, resetting role');
        setUserRole(null);
        setIsRoleLoading(false);
        return;
      }

      try {
        setIsRoleLoading(true);
        console.log("🔍 AuthProvider: Cerco profilo per user:", auth.user.id, auth.user.email);
        
        // Prima prova con l'ID dell'utente
        const { data: dataById, error: errorById } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', auth.user.id)
          .maybeSingle();

        if (dataById && dataById.role) {
          console.log("✅ AuthProvider: Ruolo utente trovato tramite ID:", dataById.role);
          setUserRole(dataById.role);
          setIsRoleLoading(false);
          setRetryCount(0);
          return;
        }
        
        if (errorById) {
          console.error('❌ AuthProvider: Error fetching user role by ID:', errorById);
        }

        // Se non trova tramite ID, prova con l'email
        if (auth.user.email) {
          const { data: dataByEmail, error: errorByEmail } = await supabase
            .from('profiles')
            .select('role, id')
            .eq('email', auth.user.email)
            .maybeSingle();

          if (dataByEmail && dataByEmail.role) {
            console.log("✅ AuthProvider: Ruolo utente trovato tramite email:", dataByEmail.role);
            setUserRole(dataByEmail.role);
            setIsRoleLoading(false);
            setRetryCount(0);
            return;
          }
          
          if (errorByEmail) {
            console.error('❌ AuthProvider: Error fetching user role by email:', errorByEmail);
          }
        }

        // Se non trova né per ID né per email e l'utente è wikus77@hotmail.it, crea il profilo admin
        if (auth.user.email === 'wikus77@hotmail.it') {
          console.log('🔑 AuthProvider: Admin email detected, creating admin profile');
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
          console.log(`⚠️ AuthProvider: Nessun profilo trovato, ritento (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          
          // Ritentiamo dopo un breve ritardo
          setTimeout(() => {
            fetchUserRole();
          }, 1000);
          return;
        }
        
        // Default fallback dopo tutti i tentativi
        console.log("⚠️ AuthProvider: Nessun profilo trovato dopo multipli tentativi");
        
        // If user is the admin email but no profile exists, force create one as a last resort
        if (auth.user.email === 'wikus77@hotmail.it') {
          console.log('🔑 AuthProvider: Forcing admin role for admin email');
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Exception fetching user role:', error);
        
        // If user is the admin email, force the role as admin even if there's an error
        if (auth.user.email === 'wikus77@hotmail.it') {
          console.log('🔑 AuthProvider: Exception handling - forcing admin role');
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } finally {
        if (retryCount >= maxRetries) {
          setIsRoleLoading(false);
        }
      }
    };

    fetchUserRole();
    
    // Mark auth as initialized after first load
    if (!authInitialized && !auth.isLoading) {
      console.log('✅ AuthProvider: Marking auth as initialized');
      setAuthInitialized(true);
    }
    
  }, [auth.isAuthenticated, auth.user, auth.isLoading, retryCount]);

  // Show loading state on first initialization
  useEffect(() => {
    if (auth.isLoading && !authInitialized) {
      console.log('🔄 AuthProvider: Auth is initializing...');
    } else if (authInitialized) {
      console.log('✅ AuthProvider: Auth initialization complete');
    }
  }, [auth.isLoading, authInitialized]);

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    // Special case for wikus77@hotmail.it - always treated as admin
    if (auth.user?.email === 'wikus77@hotmail.it') {
      const result = role === 'admin';
      console.log(`🔑 AuthProvider: Admin email role check for '${role}':`, result);
      return result;
    }
    const result = userRole === role;
    console.log(`👤 AuthProvider: Role check for '${role}':`, result, 'userRole:', userRole);
    return result;
  };

  // Create the complete context value by combining auth hook values with role information
  const authContextValue: AuthContextType = {
    ...auth,
    userRole,
    hasRole,
    isRoleLoading
  };

  console.log('📊 AuthProvider: Final context value:', {
    isAuthenticated: authContextValue.isAuthenticated,
    isLoading: authContextValue.isLoading,
    userRole: authContextValue.userRole,
    isRoleLoading: authContextValue.isRoleLoading
  });

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
