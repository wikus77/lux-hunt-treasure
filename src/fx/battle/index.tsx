// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { ReactNode } from 'react';
import { MissileTrail2D } from './MissileTrail2D';
import { EMPWave2D } from './EMPWave2D';
import { ShieldBubble2D } from './ShieldBubble2D';

export type BattleFXType = 'missile' | 'emp' | 'shield';

export interface BattleFXConfig {
  type: BattleFXType;
  from?: [number, number];
  to?: [number, number];
  center?: [number, number];
  onEnd?: () => void;
}

/**
 * Factory function to render battle FX components
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
  switch (config.type) {
    case 'missile':
      if (!config.from || !config.to) {
        console.warn('[Battle FX] Missile requires from and to coordinates');
        return null;
      }
      return <MissileTrail2D fromLatLng={config.from} toLatLng={config.to} onEnd={config.onEnd} />;

    case 'emp':
      if (!config.center) {
        console.warn('[Battle FX] EMP requires center coordinates');
        return null;
      }
      return <EMPWave2D centerLatLng={config.center} onEnd={config.onEnd} />;

    case 'shield':
      if (!config.center) {
        console.warn('[Battle FX] Shield requires center coordinates');
        return null;
      }
      return <ShieldBubble2D targetLatLng={config.center} onEnd={config.onEnd} />;

    default:
      console.warn('[Battle FX] Unknown FX type:', config.type);
      return null;
  }
}

// Re-export individual components for direct use
export { MissileTrail2D, EMPWave2D, ShieldBubble2D };

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
