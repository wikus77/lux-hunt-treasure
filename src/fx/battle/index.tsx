// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { ReactNode, Suspense } from 'react';
import { MissileTrail2D } from './MissileTrail2D';
import { EMPWave2D } from './EMPWave2D';
import { ShieldBubble2D } from './ShieldBubble2D';

export type BattleFXType = 'missile' | 'emp' | 'shield';
export type BattleFXMode = '2d' | '3d' | '3d-auto';

export interface BattleFXConfig {
  type: BattleFXType;
  from?: [number, number];
  to?: [number, number];
  center?: [number, number];
  onEnd?: () => void;
  mode?: BattleFXMode;
}

/**
 * Check if 3D mode is available and should be used
 */
function shouldUse3D(requestedMode: BattleFXMode = '3d-auto'): boolean {
  if (requestedMode === '2d') return false;
  
  // Check ENV override
  const envMode = (import.meta as any).env?.VITE_BATTLE_FX_MODE;
  if (envMode === '2d') {
    console.debug('[BattleFX] 3D disabled via ENV');
    return false;
  }
  
  // For '3d-auto', detect R3F availability
  if (requestedMode === '3d-auto') {
    try {
      // Simple check - R3F requires WebGL
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const available = !!gl;
      console.debug('[BattleFX] 3D auto-detect:', available ? 'enabled' : 'disabled');
      return available;
    } catch (e) {
      console.debug('[BattleFX] 3D detection failed, using 2D');
      return false;
    }
  }
  
  // Explicit '3d' mode requested
  return true;
}

/**
 * Factory function to render battle FX components with 2D/3D support
 * Returns a React node that can be rendered in an overlay container
 * 
 * Example usage:
 * ```tsx
 * const [fx, setFx] = useState<ReactNode | null>(null);
 * 
 * const handleAttack = () => {
 *   setFx(renderBattleFX({
 *     type: 'missile',
 *     from: [attackerLat, attackerLng],
 *     to: [defenderLat, defenderLng],
 *     mode: '3d-auto', // or '2d' or '3d'
 *     onEnd: () => setFx(null)
 *   }));
 * };
 * 
 * return (
 *   <div className="relative">
 *     <MapComponent />
 *     {fx && <div className="absolute inset-0">{fx}</div>}
 *   </div>
 * );
 * ```
 */
export function renderBattleFX(config: BattleFXConfig): ReactNode {
  const use3D = shouldUse3D(config.mode);
  
  console.debug('[BattleFX] Rendering', config.type, 'in', use3D ? '3D' : '2D', 'mode');

  // 3D rendering with lazy loading
  if (use3D) {
    try {
      return (
        <Suspense fallback={render2DFallback(config)}>
          {render3DFX(config)}
        </Suspense>
      );
    } catch (error) {
      console.warn('[BattleFX] 3D render failed, using 2D:', error);
      return render2DFallback(config);
    }
  }

  // 2D rendering (default)
  return render2DFallback(config);
}

function render2DFallback(config: BattleFXConfig): ReactNode {
  switch (config.type) {
    case 'missile':
      if (!config.from || !config.to) {
        console.warn('[BattleFX] Missile requires from and to coordinates');
        return null;
      }
      return <MissileTrail2D fromLatLng={config.from} toLatLng={config.to} onEnd={config.onEnd} />;

    case 'emp':
      if (!config.center) {
        console.warn('[BattleFX] EMP requires center coordinates');
        return null;
      }
      return <EMPWave2D centerLatLng={config.center} onEnd={config.onEnd} />;

    case 'shield':
      if (!config.center) {
        console.warn('[BattleFX] Shield requires center coordinates');
        return null;
      }
      return <ShieldBubble2D targetLatLng={config.center} onEnd={config.onEnd} />;

    default:
      console.warn('[BattleFX] Unknown FX type:', config.type);
      return null;
  }
}

function render3DFX(config: BattleFXConfig): ReactNode {
  // Dynamic import for 3D components
  const { MissileTrail3D, EMPWave3D, ShieldBubble3D } = require('../battle3d');
  
  switch (config.type) {
    case 'missile':
      if (!config.from || !config.to) return null;
      return <MissileTrail3D fromLatLng={config.from} toLatLng={config.to} onEnd={config.onEnd} />;

    case 'emp':
      if (!config.center) return null;
      return <EMPWave3D centerLatLng={config.center} onEnd={config.onEnd} />;

    case 'shield':
      if (!config.center) return null;
      return <ShieldBubble3D targetLatLng={config.center} onEnd={config.onEnd} />;

    default:
      return null;
  }
}

// Re-export individual components for direct use
export { MissileTrail2D, EMPWave2D, ShieldBubble2D };

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
