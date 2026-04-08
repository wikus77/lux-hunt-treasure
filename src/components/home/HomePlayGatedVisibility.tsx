/**
 * Hides scroll block while Home play gate is idle (GIOCA not yet tapped).
 * Keeps nodes mounted (`hidden`) so DCL scroll targets / hooks stay valid.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import React from 'react';
import { useHomePlaySurface } from '@/contexts/HomePlaySurfaceContext';

type DivProps = React.ComponentProps<'div'>;

export function HomePlayGatedVisibility({
  className,
  'aria-hidden': ariaHiddenProp,
  ...rest
}: DivProps): React.ReactElement {
  const { playGateEnabled, surfaceActive } = useHomePlaySurface();
  const gatedHidden = playGateEnabled && !surfaceActive;
  const merged = [className, gatedHidden ? 'hidden' : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div
      {...rest}
      className={merged}
      aria-hidden={gatedHidden ? true : ariaHiddenProp}
    />
  );
}
