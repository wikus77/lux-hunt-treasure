// Badge visivo del grado agente con stile M1SSION
import { Shield } from 'lucide-react';
import type { AgentRank } from '@/hooks/usePulseEnergy';

interface PulseEnergyBadgeProps {
  rank: AgentRank | null;
  className?: string;
  showCode?: boolean;
}

const PulseEnergyBadge = ({ rank, className = '', showCode = true }: PulseEnergyBadgeProps) => {
  if (!rank) {
    return (
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 ${className}`}
        data-testid="pe-badge-unavailable"
      >
        <Shield className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">Grado Non Disponibile</span>
      </div>
    );
  }

  // Ensure AG-01 is visible by increasing contrast for gray rank
  const isBaseRank = rank.code === 'AG-01';
  const displayColor = isBaseRank ? '#4A90E2' : rank.color; // Blue instead of gray for AG-01

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${className}`}
      style={{
        backgroundColor: `${displayColor}20`,
        borderColor: displayColor,
        boxShadow: `0 0 12px ${displayColor}40`,
        minHeight: '40px' // Increased for better visibility
      }}
      data-testid="pe-badge"
      data-rank-code={rank.code}
    >
      <span className="text-lg" role="img" aria-label="rank symbol">
        {rank.symbol}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-bold leading-tight" style={{ color: displayColor }}>
          {rank.name_it}
        </span>
        {showCode && (
          <span className="text-[10px] font-mono leading-tight" style={{ color: displayColor, opacity: 0.7 }}>
            {rank.code}
          </span>
        )}
      </div>
    </div>
  );
};

export default PulseEnergyBadge;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
