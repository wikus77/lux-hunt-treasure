/**
 * RedirectComponent — Simple redirect helper for Wouter
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface RedirectProps {
  to: string;
  replace?: boolean;
}

export const Redirect = ({ to, replace = true }: RedirectProps) => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation(to, { replace });
  }, [to, replace, setLocation]);
  
  return null;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
