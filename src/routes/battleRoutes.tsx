/**
 * TRON BATTLE Routes
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import BattleLobby from '@/pages/BattleLobby';
import BattleArena from '@/pages/BattleArena';

export const battleRoutes = [
  {
    path: '/battle',
    element: <BattleLobby />,
  },
  {
    path: '/battle/:battleId',
    element: <BattleArena />,
  },
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
