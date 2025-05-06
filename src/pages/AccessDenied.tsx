
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="text-center mb-8">
        <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Accesso Negato</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Non hai i permessi necessari per accedere a questa pagina. Contatta l'amministratore se pensi che sia un errore.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => navigate('/home')} variant="outline">
          Torna alla Home
        </Button>
        <Button onClick={() => navigate(-1)} className="bg-projectx-blue">
          Torna indietro
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
