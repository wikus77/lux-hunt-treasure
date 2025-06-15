
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { logout, userRole, getCurrentUser } = useAuthContext();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout effettuato con successo");
      navigate('/login');
    } catch (error) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout");
    }
  };
  
  const handleReauthenticate = () => {
    // Clear role from localStorage to force a fresh fetch
    localStorage.removeItem('userRole');
    // Logout and redirect to login
    handleLogout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="text-center mb-8">
        <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Accesso Negato</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-4">
          Non hai i permessi necessari per accedere a questa pagina. Contatta l'amministratore se pensi che sia un errore.
        </p>
        
        {getCurrentUser() && (
          <div className="bg-zinc-800/50 p-4 rounded-lg mb-6 max-w-md mx-auto">
            <p className="text-white text-sm mb-1">Informazioni utente:</p>
            <p className="text-amber-400 text-sm mb-1">ID: {getCurrentUser()?.id}</p>
            <p className="text-amber-400 text-sm">Ruolo corrente: {userRole || 'Nessun ruolo'}</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate('/home')} variant="outline" className="flex items-center gap-2">
          Torna alla Home
        </Button>
        
        <Button 
          onClick={() => navigate(-1)} 
          className="bg-projectx-blue flex items-center gap-2"
        >
          Torna indietro
        </Button>
        
        <Button 
          onClick={handleReauthenticate} 
          className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Riautentica
        </Button>
        
        <Button 
          onClick={handleLogout} 
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
