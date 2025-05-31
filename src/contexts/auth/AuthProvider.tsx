import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { useAuth } from '@/hooks/use-auth';
import { AuthContextType } from './types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
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
        console.error("❌ Errore nella creazione del profilo admin:", error);
        
        // If the direct approach fails, try using the RPC function
        try {
          // Call the edge function as a fallback
          const result = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-admin-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
            },
            body: JSON.stringify({
              userId,
              email: userEmail
            })
          });
          
          if (!result.ok) {
            throw new Error("Failed to create admin profile via edge function");
          }
          
          const data = await result.json();
          console.log("✅ Profilo admin creato tramite funzione:", data);
          setUserRole('admin');
          return true;
        } catch (edgeError) {
          console.error("❌ Errore nella creazione del profilo tramite funzione:", edgeError);
          return false;
        }
      }
      
      console.log("✅ Profilo admin creato con successo:", newProfile?.role);
      setUserRole(newProfile?.role || 'admin');
      return true;
    } catch (err) {
      console.error("❌ Exception durante la creazione del profilo admin:", err);
      return false;
    }
  };

  // Special handling for developer access
  useEffect(() => {
    const handleDeveloperAccess = () => {
      if (auth.isAuthenticated && auth.user?.email === 'joseph@m1ssion.com') {
        // Check if we're on landing page and redirect to home
        if (window.location.pathname === '/') {
          console.log('Developer detected on landing page, redirecting to /home');
          navigate('/home');
        }
      }
    };

    handleDeveloperAccess();
  }, [auth.isAuthenticated, auth.user, navigate]);

  // Fetch user role when auth state changes - NON FORZARE REDIRECT
  useEffect(() => {
    const fetchUserRole = async () => {
      // Se non c'è utente autenticato, NON fare nulla - lascia che vedano la landing
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
        
        // If user is the admin email but no profile exists, force create one as a last resort
        if (auth.user.email === 'wikus77@hotmail.it') {
          setUserRole('admin');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ Exception fetching user role:', error);
        
        // If user is the admin email, force the role as admin even if there's an error
        if (auth.user.email === 'wikus77@hotmail.it') {
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
    // Special case for wikus77@hotmail.it - always treated as admin
    if (auth.user?.email === 'wikus77@hotmail.it') {
      return role === 'admin';
    }
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
