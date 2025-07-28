// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// POST-LOGIN REDIRECT HANDLER - REDIRECT A /mission-intro
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useEffect, useRef } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionIntro = () => {
  const { navigate } = useWouterNavigation();
  const hasRedirectedRef = useRef(false);
  
  // 🚀 REDIRECT IMMEDIATO A /mission-intro
  useEffect(() => {
    console.log('🎬 PostLoginMissionIntro: Inizializzazione redirect');
    
    if (hasRedirectedRef.current) {
      console.log('⚠️ Redirect già eseguito, skip...');
      return;
    }
    
    hasRedirectedRef.current = true;
    
    // Redirect immediato determinístico
    const executeRedirect = () => {
      try {
        console.log('🎯 [POST-LOGIN] Redirecting to /mission-intro');
        navigate('/mission-intro');
        console.log('✅ [SUCCESS] Navigation to mission-intro executed');
      } catch (error) {
        console.error('❌ [ERROR] Navigation failed:', error);
        // Emergency fallback
        window.location.href = '/mission-intro';
      }
    };
    
    // Piccolo delay per stabilità
    setTimeout(executeRedirect, 100);
    
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center"
         style={{ zIndex: 9999 }}>
      <div className="text-white text-lg font-orbitron">
        Caricamento...
      </div>
    </div>
  );
};

export default PostLoginMissionIntro;