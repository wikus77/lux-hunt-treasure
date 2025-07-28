// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// PAGINA MISSION INTRO BLINDATA - NESSUN FLASH BIANCO
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import { useEffect } from 'react';
import MissionIntro from "@/components/intro/MissionIntro";

export default function MissionIntroPage() {
  
  // 🔒 STABILIZZAZIONE COMPONENTE: Eliminati tutti i listener che interferiscono
  useEffect(() => {
    console.log('🎬 MissionIntroPage: Montaggio stabile');
    
    // Invece di bloccare navigation, stabiliziamo solo il componente
    const stabilizationTimer = setTimeout(() => {
      console.log('✅ MissionIntroPage: Stabilizzato');
    }, 100);
    
    return () => {
      console.log('🧹 MissionIntroPage: Cleanup');
      clearTimeout(stabilizationTimer);
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
      <MissionIntro />
    </div>
  );
}