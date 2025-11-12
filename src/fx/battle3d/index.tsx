// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { lazy } from 'react';

/**
 * 3D Battle FX Components (React Three Fiber)
 * 
 * These components are lazy-loaded to avoid bundling R3F if not needed.
 * Falls back to 2D versions automatically if R3F is unavailable.
 */

export const MissileTrail3D = lazy(() => 
  import('./MissileTrail3D').then(m => ({ default: m.MissileTrail3D }))
);

export const EMPWave3D = lazy(() => 
  import('./EMPWave3D').then(m => ({ default: m.EMPWave3D }))
);

export const ShieldBubble3D = lazy(() => 
  import('./ShieldBubble3D').then(m => ({ default: m.ShieldBubble3D }))
);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
