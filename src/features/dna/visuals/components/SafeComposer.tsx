import React from 'react';

/**
 * SafeComposer: Legacy wrapper - deprecated.
 * Use DNAComposerVanilla from @/features/dna/common/DNAComposerVanilla instead.
 * 
 * This component is kept for backwards compatibility but should not be used.
 * It previously wrapped @react-three/postprocessing EffectComposer which caused
 * crashes due to undefined children.length access.
 */
export function SafeComposer({ 
  children
}: { children?: React.ReactNode }) {
  console.warn('[SafeComposer] Deprecated - Use DNAComposerVanilla instead');
  
  // Just render children without wrapping
  return <>{children}</>;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
