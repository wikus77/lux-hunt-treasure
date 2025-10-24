/**
 * The Pulse™ — Ritual Orchestrator Wrapper
 * Connects ritual channel to orchestrator component
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useRitualChannel } from './useRitualChannel';
import { RitualOrchestrator } from './RitualOrchestrator';

export function RitualOrchestratorWrapper() {
  const { phase, ritualId } = useRitualChannel({ mode: 'prod' });
  
  return <RitualOrchestrator phase={phase} ritualId={ritualId} mode="prod" />;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
