// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// SEQUENZA POST-LOGIN STABILIZZATA - NESSUN FLASH BIANCO
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

import PostLoginMissionIntro from "@/components/auth/PostLoginMissionIntro";

export default function MissionIntroPage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden z-50">
      <PostLoginMissionIntro />
    </div>
  );
}