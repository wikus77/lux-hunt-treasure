
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import StyledInput from '@/components/ui/styled-input';
import { Mail, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeveloperAccessProps {
  onAccessGranted: () => void;
}

const DeveloperAccess: React.FC<DeveloperAccessProps> = ({ onAccessGranted }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Enhanced mobile detection including Capacitor
    const checkMobile = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      setIsMobile(isMobileDevice);
      
      console.log('DeveloperAccess device check (Capacitor):', { isMobileDevice, isCapacitorApp });
    };
    
    checkMobile();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('Developer login attempt - REAL AUTH ONLY:', { email, isMobile });
    
    // Allow login on mobile devices (including Capacitor)
    if (!isMobile) {
      setError('Accesso disponibile solo da dispositivi mobili');
      setIsLoading(false);
      return;
    }
    
    // REAL SUPABASE AUTHENTICATION for developer
    if (email === 'wikus77@hotmail.it') {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('❌ Supabase auth error:', error);
          setError('Credenziali non valide o errore di autenticazione');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          console.log('✅ Developer authenticated successfully - REAL AUTH:', {
            userId: data.user.id,
            email: data.user.email
          });
          
          toast.success('Accesso sviluppatore autorizzato - REAL AUTH');
          onAccessGranted();
        } else {
          setError('Errore durante l\'autenticazione');
        }
      } catch (authError) {
        console.error('❌ Authentication exception:', authError);
        setError('Errore di connessione durante l\'autenticazione');
      }
    } else {
      setError('Credenziali non valide');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-orbitron text-[#00D1FF] mb-2">Developer Access</h2>
          <p className="text-white/70 text-sm">Accesso sviluppatore - AUTENTICAZIONE REALE</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <StyledInput
            id="developer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            placeholder="Email sviluppatore"
            className="mobile-optimized"
            disabled={isLoading}
          />
          
          <StyledInput
            id="developer-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Key size={16} />}
            placeholder="Password"
            className="mobile-optimized"
            disabled={isLoading}
          />
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full mobile-touch-target bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF]"
            disabled={isLoading}
          >
            {isLoading ? 'Autenticazione...' : 'Accedi - Auth Reale'}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Accesso sviluppatore: autenticazione Supabase reale
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeveloperAccess;
