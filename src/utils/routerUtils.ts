// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Router utilities to replace react-router-dom functionality

import React from 'react';
import { useLocation } from 'wouter';

// Navigate function replacement
export const useNavigateWouter = () => {
  const [, setLocation] = useLocation();
  
  return (path: string) => {
    setLocation(path);
  };
};

// Location hook replacement
export const useLocationWouter = () => {
  const [location] = useLocation();
  
  return {
    pathname: location,
    search: window.location.search,
    hash: window.location.hash,
    state: null
  };
};

// Link component replacement
export const LinkWouter = ({ 
  to, 
  children, 
  className,
  ...props 
}: { 
  to: string; 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) => {
  const [, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation(to);
  };
  
  return React.createElement(
    'a',
    { href: to, onClick: handleClick, className, ...props },
    children
  );
};

// Navigate component replacement

export const NavigateWouter = ({ to, replace = false }: { to: string; replace?: boolean }) => {
  const [, setLocation] = useLocation();
  
  React.useEffect(() => {
    if (replace) {
      window.history.replaceState(null, '', to);
    } else {
      setLocation(to);
    }
  }, [to, replace, setLocation]);
  
  return null;
};

export default useNavigateWouter;