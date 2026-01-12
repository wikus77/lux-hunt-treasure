/**
 * Battle Defense Manager - Global component that listens for incoming battle attacks
 * Renders BattleDefenseModal when an attack notification is received
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useBattleDefenseNotification } from '@/hooks/useBattleDefenseNotification';
import { BattleDefenseModal } from './BattleDefenseModal';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export function BattleDefenseManager() {
  const { user } = useUnifiedAuth();
  const userId = user?.id || null;

  const {
    incomingBattle,
    showDefenseModal,
    closeDefenseModal,
  } = useBattleDefenseNotification(userId);

  if (!userId || !incomingBattle) return null;

  return (
    <BattleDefenseModal
      isOpen={showDefenseModal}
      onClose={closeDefenseModal}
      battleId={incomingBattle.battleId}
      attackerName={incomingBattle.attackerName}
      attackerAgentCode={incomingBattle.attackerAgentCode}
      attackerWeaponPower={incomingBattle.attackerWeaponPower}
      stakeAmount={incomingBattle.stakeAmount}
      stakeType={incomingBattle.stakeType}
      userId={userId}
    />
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

