import React from 'react';
import { EffectComposer, EffectComposerProps } from '@react-three/postprocessing';

/**
 * SafeComposer: wrapper che monta EffectComposer solo se ci sono effetti validi.
 * Previene il crash "Cannot read properties of undefined (reading 'length')"
 * quando children è undefined o tutti i figli sono null/false.
 */
export function SafeComposer({ 
  children, 
  ...props 
}: EffectComposerProps & { children?: React.ReactNode }) {
  // Converti children in array e filtra i valori falsy
  const validChildren = React.Children.toArray(children).filter(Boolean);
  
  // Se non ci sono effetti validi, non montare il Composer
  if (!Array.isArray(validChildren) || validChildren.length === 0) {
    return null;
  }
  
  return (
    <EffectComposer {...props}>
      {validChildren as React.ReactElement[]}
    </EffectComposer>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
