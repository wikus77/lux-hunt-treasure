
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { useAuthContext } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShieldAlert, Shield, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function TestAdminUI() {
  const { isAuthenticated, isLoading, userRole, hasRole, isRoleLoading, logout, getCurrentUser } = useAuthContext();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  // Funzione per verificare e creare il profilo admin se necessario
  const verifyAndFixProfile = async () => {
    if (!isAuthenticated || !getCurrentUser()) return;
    
    setVerifying(true);
    try {
      const user = getCurrentUser();
      console.log("🔍 Verifica profilo per:", user?.email);
      
      // Controlla se esiste un profilo per l'utente corrente
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
        
      if (error) {
        console.error("❌ Errore verifica profilo:", error);
        throw error;
      }
      
      setProfileInfo({ profile });
      
      // Se non esiste un profilo, crealo
      if (!profile && user?.email === 'wikus77@hotmail.it') {
        console.log("⚙️ Creazione profilo amministratore...");
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'admin',
            full_name: 'Amministratore'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("❌ Errore creazione profilo:", insertError);
          throw insertError;
        }
        
        console.log("✅ Profilo admin creato:", newProfile);
        setProfileInfo({ profile: newProfile });
        toast.success("Profilo amministratore creato");
        
        // Ricarica la pagina per aggiornare le informazioni di autenticazione
        setTimeout(() => window.location.reload(), 1500);
        return;
      }
      
      // Se il profilo esiste ma non ha ruolo admin, aggiornalo
      if (profile && profile.role !== 'admin' && user?.email === 'wikus77@hotmail.it') {
        console.log("⚙️ Aggiornamento ruolo a admin...");
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error("❌ Errore aggiornamento ruolo:", updateError);
          throw updateError;
        }
        
        console.log("✅ Ruolo aggiornato a admin:", updatedProfile);
        setProfileInfo({ profile: updatedProfile });
        toast.success("Ruolo aggiornato ad amministratore");
        
        // Ricarica la pagina per aggiornare le informazioni di autenticazione
        setTimeout(() => window.location.reload(), 1500);
        return;
      }
      
      console.log("✅ Profilo verificato:", profile);
      toast.success("Profilo verificato correttamente");
    } catch (err) {
      console.error("❌ Errore durante la verifica/riparazione del profilo:", err);
      toast.error("Errore durante la verifica del profilo");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    // Log authentication and role status
    console.log("🔐 Authentication Status:", {
      isAuthenticated,
      isLoading,
      user: getCurrentUser(),
      userId: getCurrentUser()?.id,
      email: getCurrentUser()?.email,
      userRole,
      isRoleLoading,
      isAdmin: hasRole('admin')
    });
    
    // Special check for admin email
    const isAdminEmail = getCurrentUser()?.email === 'wikus77@hotmail.it';
    
    if (isAuthenticated && !isLoading && !isRoleLoading && !hasRole('admin') && !isAdminEmail) {
      console.log("⛔ Non-admin user attempting to access admin UI:", getCurrentUser()?.email);
      toast.error("Accesso negato: solo gli amministratori possono accedere a questa pagina");
      navigate('/');
    }
    
    // Se l'utente è autenticato ma non abbiamo ancora le informazioni sul ruolo, verifica il profilo
    if (isAuthenticated && !isLoading && !profileInfo) {
      verifyAndFixProfile();
    }
  }, [isAuthenticated, isLoading, userRole, isRoleLoading, hasRole, navigate, getCurrentUser]);
  
  const handleLogout = async () => {
    await logout();
    toast.success("Logout effettuato");
    navigate('/auth-debug');
  };
  
  const isAdminEmail = getCurrentUser()?.email === 'wikus77@hotmail.it';
  
  if (isLoading || isRoleLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="p-6 bg-gray-900/30 border border-gray-700/30 rounded-lg">
          <h2 className="text-xl text-white mb-4">Verifica credenziali in corso...</h2>
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full"></div>
            <p className="text-gray-300">{isRoleLoading ? 'Caricamento ruolo...' : 'Verifica autenticazione...'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white flex items-center justify-between">
        <span className="flex items-center">
          <Shield className="mr-3 text-green-500" />
          Gestione Premi
        </span>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={verifyAndFixProfile}
            disabled={verifying}
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            {verifying ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Verifica...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Verifica profilo
              </>
            )}
          </Button>
          
          {isAuthenticated && (
            <Button 
              onClick={handleLogout}
              variant="destructive" 
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </h1>
      
      {!isAuthenticated ? (
        <div className="p-6 bg-red-900/30 border border-red-500/30 rounded-lg">
          <h2 className="text-xl text-red-300 mb-4 flex items-center">
            <ShieldAlert className="mr-2" /> Accesso non autorizzato
          </h2>
          <p className="text-white mb-4">Devi effettuare il login come amministratore per accedere a questa pagina.</p>
          <Button 
            onClick={() => navigate('/auth-debug')}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Vai al login di debug
          </Button>
        </div>
      ) : !hasRole('admin') && !isAdminEmail ? (
        <div className="p-6 bg-amber-900/30 border border-amber-500/30 rounded-lg">
          <h2 className="text-xl text-amber-300 mb-4 flex items-center">
            <ShieldAlert className="mr-2" /> Ruolo richiesto: Admin
          </h2>
          <p className="text-white mb-4">
            Sei autenticato come {getCurrentUser()?.email}, ma è richiesto il ruolo di amministratore.
          </p>
          <div className="p-4 bg-black/30 rounded-md mb-4 overflow-auto">
            <pre className="text-xs text-gray-300">
              {JSON.stringify({ 
                userId: getCurrentUser()?.id, 
                email: getCurrentUser()?.email,
                role: userRole || "nessun ruolo" 
              }, null, 2)}
            </pre>
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={verifyAndFixProfile}
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova verifica profilo
            </Button>
            <Button 
              onClick={() => navigate('/auth-debug')}
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Riprova login
            </Button>
            <Button 
              onClick={handleLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-5 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h2 className="text-xl text-green-300 mb-2">✅ ACCESSO ADMIN CONFERMATO</h2>
            <p className="text-gray-300 mb-3">
              Autenticato come: <span className="text-white">{getCurrentUser()?.email}</span>
            </p>
            <div className="flex justify-between items-start">
              <p className="text-gray-300">
                Ruolo: <span className="text-white font-medium">{userRole}</span>
              </p>
              {profileInfo && (
                <div className="text-xs text-right">
                  <p className="text-gray-400">Profilo ID: {profileInfo.profile?.id?.substring(0, 8)}...</p>
                </div>
              )}
            </div>
          </div>
          <AdminPrizeManager />
        </div>
      )}
    </div>
  );
}
