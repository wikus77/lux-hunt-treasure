
import React from 'react';
import { useAuthContext } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Errore durante il logout');
        return;
      }
      toast.success('Logout effettuato con successo');
      navigate('/');
    } catch (error) {
      toast.error('Errore imprevisto durante il logout');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white safe-padding-x pt-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Profilo</h1>
        
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-white/70">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>
          
          <div>
            <label className="text-sm text-white/70">ID Utente</label>
            <p className="text-white text-sm font-mono">{user?.id}</p>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-500/20"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
