/**
 * Victory / Reward Orchestration — context + provider (daily pilot + V4 real-daily rollout flag)
 *
 * ORDER POLICY: MAJOR (PE fullscreen) → SMALL (M1U) → rank gate release → STATUS (rank modal)
 * @see VictoryOrchestrationListeners — registers capture listeners as first child (before overlay effects).
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { isVictoryOrchestrationConductorEnabled } from '@/config/featureFlags';
import { VictoryOrchestrationListeners } from './VictoryOrchestrationListeners';

export { orchLog } from './logging';

interface VictoryOrchestrationContextValue {
  blockRankUpModal: boolean;
}

const VictoryOrchestrationContext = createContext<VictoryOrchestrationContextValue | null>(null);

export function useVictoryOrchestrationGate(): VictoryOrchestrationContextValue {
  const ctx = useContext(VictoryOrchestrationContext);
  return ctx ?? { blockRankUpModal: false };
}

export function VictoryOrchestrationProvider({ children }: { children: React.ReactNode }) {
  const enabled = isVictoryOrchestrationConductorEnabled();
  const [blockRankUpModal, setBlockRankUpModal] = useState(false);

  const value = useMemo(() => ({ blockRankUpModal }), [blockRankUpModal]);

  return (
    <VictoryOrchestrationContext.Provider value={value}>
      <VictoryOrchestrationListeners enabled={enabled} setBlockRankUpModal={setBlockRankUpModal} />
      {children}
    </VictoryOrchestrationContext.Provider>
  );
}
