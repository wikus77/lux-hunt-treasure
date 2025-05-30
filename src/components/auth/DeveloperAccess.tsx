
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import StyledInput from '@/components/ui/styled-input';
import { Mail, Key } from 'lucide-react';

interface DeveloperAccessProps {
  onAccessGranted: () => void;
}

const DeveloperAccess: React.FC<DeveloperAccessProps> = ({ onAccessGranted }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Enhanced mobile detection including Capacitor
    const checkMobile = () => {
      const isCapacitorApp = !!(window as any).Capacitor;
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent) || isCapacitorApp;
      setIsMobile(isMobileDevice);
      
      console.log('DeveloperAccess device check:', { isMobileDevice, isCapacitorApp });
    };
    
    checkMobile();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Login attempt:', { email, isMobile });
    
    // Allow login on mobile devices (including Capacitor)
    if (!isMobile) {
      setError('Accesso disponibile solo da dispositivi mobili');
      return;
    }
    
    // DEVELOPER ACCESS: Check for exact developer credentials
    if (email === 'wikus77@hotmail.it' && password === '000000') {
      // Grant complete access for developer
      localStorage.setItem('developer_access', 'granted');
      localStorage.setItem('developer_user', 'true');
      localStorage.setItem('full_access_granted', 'true');
      console.log('Developer access granted - Full access enabled');
      onAccessGranted();
    } else {
      setError('Credenziali non valide');
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-orbitron text-[#00D1FF] mb-2">Developer Access</h2>
          <p className="text-white/70 text-sm">Accesso riservato allo sviluppatore</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <StyledInput
            id="developer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            placeholder="Email"
            className="mobile-optimized"
          />
          
          <StyledInput
            id="developer-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Key size={16} />}
            placeholder="Password"
            className="mobile-optimized"
          />
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full mobile-touch-target bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF]"
          >
            Accedi
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DeveloperAccess;
