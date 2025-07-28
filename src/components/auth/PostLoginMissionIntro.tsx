// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// POST-LOGIN REDIRECT SEMPLIFICATO
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useEffect, useRef } from 'react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

const PostLoginMissionIntro = () => {
  console.log('🎬 [POST-LOGIN] Component initialized');
  
  const { navigate } = useWouterNavigation();
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    console.log('🚀 [POST-LOGIN] useEffect triggered');
    
    if (hasRedirected.current) {
      console.log('⚠️ [POST-LOGIN] Already redirected, skipping');
      return;
    }
    
    hasRedirected.current = true;
    console.log('🎯 [POST-LOGIN] Executing redirect to /mission-intro');
    
    setTimeout(() => {
      try {
        navigate('/mission-intro');
        console.log('✅ [POST-LOGIN] Redirect successful');
      } catch (error) {
        console.error('❌ [POST-LOGIN] Redirect failed:', error);
        window.location.href = '/mission-intro';
      }
    }, 200);
    
  }, [navigate]);

  console.log('🖼️ [POST-LOGIN] Rendering loading screen');

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className="text-white text-lg font-orbitron animate-pulse">
        Inizializzazione M1SSION™...
      </div>
    </div>
  );
};

export default PostLoginMissionIntro;