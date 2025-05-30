
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';

interface AccessControlProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ children, fallback }) => {
  const { isAuthenticated, user } = useAuthContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent;
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  // Se l'utente è autenticato con email sviluppatore, permetti accesso
  if (isAuthenticated && user?.email === 'wikus77@hotmail.it') {
    return <>{children}</>;
  }

  // Se siamo su mobile e non autenticati come sviluppatore, mostra fallback
  if (isMobile && !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Su web, sempre permetti accesso alla landing page
  return <>{children}</>;
};

export default AccessControl;
