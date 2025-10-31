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
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 ${className}`}>
        <Shield className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">Grado Non Disponibile</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${className}`}
      style={{
        backgroundColor: `${rank.color}20`,
        borderColor: rank.color,
        boxShadow: `0 0 12px ${rank.color}40`
      }}
    >
      <span className="text-lg" role="img" aria-label="rank symbol">
        {rank.symbol}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-bold leading-tight" style={{ color: rank.color }}>
          {rank.name_it}
        </span>
        {showCode && (
          <span className="text-[10px] text-gray-400 font-mono leading-tight">
            {rank.code}
          </span>
        )}
      </div>
    </div>
  );
};

export default PulseEnergyBadge;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
