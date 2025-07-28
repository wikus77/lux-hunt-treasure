// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// PAGINA MISSION INTRO BLINDATA - NESSUN FLASH BIANCO
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useEffect } from 'react';
import PostLoginMissionIntro from "@/components/auth/PostLoginMissionIntro";

export default function MissionIntroPage() {
  
  // 🔒 CRITICAL: Previeni navigation conflicts durante animazione
  useEffect(() => {
    console.log('🎬 MissionIntroPage: Montaggio pagina intro');
    
    // Block browser back button durante animazione
    const handlePopState = (event: PopStateEvent) => {
      console.log('⚠️ Block back button durante M1SSION intro');
      event.preventDefault();
      history.pushState(null, '', '/mission-intro');
    };
    
    // Aggiungi listener
    window.addEventListener('popstate', handlePopState);
    
    // Forza stato corrente nella history
    history.replaceState(null, '', '/mission-intro');
    
    return () => {
      console.log('🧹 MissionIntroPage: Cleanup');
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black overflow-hidden"
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <PostLoginMissionIntro />
    </div>
  );
}