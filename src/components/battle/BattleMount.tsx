// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { BattleHUD } from './BattleHUD';

interface BattleMountProps {
  sessionId?: string | null;
  onClose?: () => void;
}

/**
 * BattleMount - Neutral mount point for Battle HUD
 * 
 * This component provides a safe integration point for the Battle HUD
 * without automatically mounting it anywhere in the protected map structure.
 * 
 * Usage:
 * ```tsx
 * import { BattleMount } from '@/components/battle/BattleMount';
 * 
 * function MyPage() {
 *   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
 *   
 *   return (
 *     <div className="relative">
 *       <YourMapOrContent />
 *       <BattleMount sessionId={activeSessionId} onClose={() => setActiveSessionId(null)} />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param sessionId - Optional battle session ID to display HUD for
 * @param onClose - Optional callback when HUD is closed
 */
export function BattleMount({ sessionId, onClose }: BattleMountProps) {
  if (!sessionId) {
    console.debug('[BattleMount] No active session');
    return null;
  }

  console.debug('[BattleMount] Rendering HUD for session:', sessionId);
  
  return <BattleHUD sessionId={sessionId} onClose={onClose} />;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
