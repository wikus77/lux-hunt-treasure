
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

  useEffect(() => {
    // Check if running on mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMobile) return;
    
    if (email === 'wikus77@hotmail.it' && password === '000000') {
      localStorage.setItem('developer_access', 'granted');
      onAccessGranted();
    }
  };

  // Don't show on web browsers
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <StyledInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            placeholder="Email"
            className="mobile-optimized"
          />
          
          <StyledInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Key size={16} />}
            placeholder="Password"
            className="mobile-optimized"
          />
          
          <Button
            type="submit"
            className="w-full mobile-touch-target"
          >
            Access
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DeveloperAccess;
