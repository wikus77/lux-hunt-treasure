
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { useAuthContext } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestAdminUI() {
  const { isAuthenticated, isLoading, userRole, hasRole, isRoleLoading, logout, user, getCurrentUser } = useAuthContext();
  const navigate = useNavigate();

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
  }, [isAuthenticated, isLoading, userRole, isRoleLoading, getCurrentUser, hasRole]);
  
  const handleLogout = async () => {
    await logout();
    toast.success("Logout effettuato");
    navigate('/auth-debug');
  };
  
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
        <span>Gestione Premi</span>
        {isAuthenticated && (
          <Button 
            onClick={handleLogout}
            variant="destructive" 
            size="sm"
            className="ml-4"
          >
            Logout
          </Button>
        )}
      </h1>
      
      {!isAuthenticated ? (
        <div className="p-6 bg-red-900/30 border border-red-500/30 rounded-lg">
          <h2 className="text-xl text-red-300 mb-4">Accesso non autorizzato</h2>
          <p className="text-white mb-4">Devi effettuare il login come amministratore per accedere a questa pagina.</p>
          <Button 
            onClick={() => navigate('/auth-debug')}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Vai al login di debug
          </Button>
        </div>
      ) : !hasRole('admin') ? (
        <div className="p-6 bg-amber-900/30 border border-amber-500/30 rounded-lg">
          <h2 className="text-xl text-amber-300 mb-4">Ruolo richiesto: Admin</h2>
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
            <p className="text-gray-300">
              Ruolo: <span className="text-white font-medium">{userRole}</span>
            </p>
          </div>
          <AdminPrizeManager />
        </div>
      )}
    </div>
  );
}
