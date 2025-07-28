// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// 🔐 Codice blindato – Inserimento animazione solo in fase post-login autorizzata

import PostLoginMissionIntro from "@/components/auth/PostLoginMissionIntro";

export default function MissionIntroPage() {
  console.log('📄 [MissionIntroPage] ======= MISSION INTRO PAGE MOUNTED =======');
  console.log('📄 [MissionIntroPage] Route: /mission-intro');
  console.log('📄 [MissionIntroPage] Loading PostLoginMissionIntro component');
  return <PostLoginMissionIntro />;
}