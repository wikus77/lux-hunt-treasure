// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import { useLocation } from 'wouter';
import { useCallback } from 'react';

export const useWouterNavigation = () => {
  const [location, setLocation] = useLocation();


  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    console.log('🧭 Wouter Navigation:', { from: location, to: path });
    setLocation(path, { replace: options?.replace });
    
    // iOS WebView scroll fix
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
