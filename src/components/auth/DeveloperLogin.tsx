
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Smartphone } from 'lucide-react';

const DeveloperLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect if running on mobile device
    const userAgent = navigator.userAgent;
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  const handleDeveloperLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica credenziali sviluppatore
    if (email !== 'wikus77@hotmail.it' || password !== '000000') {
      toast.error('Accesso riservato agli sviluppatori');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Errore di autenticazione');
        return;
      }

      toast.success('Accesso sviluppatore autorizzato');
      navigate('/home');
    } catch (error) {
      toast.error('Errore di connessione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center mobile-safe-content">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 mobile-container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
            {isMobile ? (
              <Smartphone className="w-8 h-8 text-cyan-400" />
            ) : (
              <Lock className="w-8 h-8 text-cyan-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mobile-title">
            Accesso Sviluppatore
          </h1>
          <p className="text-gray-400 mt-2 mobile-text">
            {isMobile ? 'Modalità test iPhone attiva' : 'Accesso riservato'}
          </p>
        </div>

        <form onSubmit={handleDeveloperLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border-gray-700/50 text-white mobile-touch-target"
              placeholder="Email sviluppatore"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border-gray-700/50 text-white mobile-touch-target"
              placeholder="Password sviluppatore"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-semibold mobile-button mobile-touch-target"
          >
            {isLoading ? 'Verifica in corso...' : 'Accedi come Sviluppatore'}
          </Button>
        </form>

        {isMobile && (
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <p className="text-cyan-400 text-sm text-center mobile-text">
              Modalità test iPhone - Tutte le funzionalità attive
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors mobile-text"
          >
            ← Torna alla homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperLogin;
