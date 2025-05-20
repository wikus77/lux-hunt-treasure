
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { supabase } from '@/integrations/supabase/client';

export default function TestAdminUI() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🟢 Rendering attivo");
    
    // Check if the user is authenticated and has admin role
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check auth status
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("🔑 Session check: No session");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      console.log("🔑 Session check: Session found");
      console.log("🔑 User ID:", sessionData.session?.user?.id || "None");
      
      // Check user role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (profileError || profileData?.role !== 'admin') {
        console.log("👮‍♂️ Role check failed or not admin:", profileError?.message || "Not admin role");
        setIsAuthenticated(false);
      } else {
        console.log("👮‍♂️ Admin role confirmed");
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth event:", event);
      console.log("🔑 User ID:", session?.user?.id || "None");
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-check auth when user signs in or token is refreshed
        checkAuth();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-white">Verifica autenticazione...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Gestione Premi</h1>
      
      {!isAuthenticated ? (
        <div className="p-6 bg-red-900/30 border border-red-500/30 rounded-lg">
          <h2 className="text-xl text-red-300 mb-4">Accesso non autorizzato</h2>
          <p className="text-white mb-4">Devi effettuare il login come amministratore per accedere a questa pagina.</p>
          <button 
            onClick={() => navigate('/auth-debug')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Vai al login di debug
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6" style={{ padding: "20px", backgroundColor: "#111", color: "#0f0" }}>
            <h2 className="text-xl">✅ COMPONENTI FUNZIONANO</h2>
            <p>Interfaccia di gestione premi attiva</p>
          </div>
          <AdminPrizeManager />
        </div>
      )}
    </div>
  );
}
