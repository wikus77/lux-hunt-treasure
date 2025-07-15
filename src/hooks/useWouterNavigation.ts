// M1SSION™ - Wouter Navigation Hook for Capacitor iOS
// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import { useLocation } from 'wouter';

export const useWouterNavigation = () => {
  const [location, setLocation] = useLocation();

  const navigate = (path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Wouter Navigation:', { from: location, to: path });
    setLocation(path, { replace: options?.replace });
  };

  const goBack = () => {
    // Wouter-compatible back navigation
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/home');
    }
  };

  return {
    navigate,
    goBack,
    currentPath: location,
    isCapacitor: typeof window !== 'undefined' && 
      (window.location.protocol === 'capacitor:' || !!(window as any).Capacitor)
  };
};