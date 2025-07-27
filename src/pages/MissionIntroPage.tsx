// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
// 🔐 Codice blindato – Inserimento animazione solo in fase post-login autorizzata

import PostLoginMissionAnimation from "@/components/auth/PostLoginMissionAnimation";

export default function MissionIntroPage() {
  console.log('📄 [MissionIntroPage] Page mounted');
  return <PostLoginMissionAnimation />;
}