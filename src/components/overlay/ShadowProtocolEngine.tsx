// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ - Engine Component
// Wrapper component per useEntityEventEngine che deve essere dentro AuthProvider

import { useEntityEventEngine } from '@/hooks/useEntityEventEngine';

/**
 * ShadowProtocolEngine
 * 
 * Componente wrapper che attiva il motore eventi Shadow Protocol.
 * DEVE essere posizionato dentro AuthProvider per funzionare correttamente.
 * Non renderizza nulla, solo attiva il hook.
 */
export function ShadowProtocolEngine(): null {
  useEntityEventEngine();
  return null;
}

export default ShadowProtocolEngine;


