/**
 * TRON BATTLE Routes
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { lazy } from 'react';
import { FEATURES } from '@/config/features';

const BattleLobby = FEATURES.BATTLES_ENABLED 
  ? lazy(() => import('@/pages/BattleLobby'))
  : lazy(() => import('@/pages/ComingSoon'));

const BattleArena = FEATURES.BATTLES_ENABLED
  ? lazy(() => import('@/pages/BattleArena'))
  : lazy(() => import('@/pages/ComingSoon'));

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
