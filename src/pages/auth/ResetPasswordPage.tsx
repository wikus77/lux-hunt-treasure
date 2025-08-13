// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
// Password Reset Page for Supabase Auth Recovery

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

const ResetPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check if user is in password recovery mode
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Reset page session:', session);
      setSession(session);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change in reset page:', event, session);
        if (event === 'PASSWORD_RECOVERY') {
          setSession(session);
          toast.info('Inserisci la nuova password');
        }
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Inserisci entrambe le password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le password non corrispondono');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password reset error:', error);
        toast.error('Errore nel reset della password: ' + error.message);
      } else {
        toast.success('Password aggiornata con successo!');
        setTimeout(() => {
          setLocation('/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-b from-background/50 to-black">
      <div className="max-w-md w-full p-6 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-cyan mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Inserisci la tua nuova password
          </p>
        </div>

        {session ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Nuova password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background/20 border-white/20"
                required
                minLength={8}
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Conferma password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background/20 border-white/20"
                required
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Caricamento del link di recovery...
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/login')}
            >
              Torna al Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;