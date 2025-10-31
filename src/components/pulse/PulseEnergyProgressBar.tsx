// Progress bar verso il prossimo grado con PE rimanente
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import type { AgentRank } from '@/hooks/usePulseEnergy';

interface PulseEnergyProgressBarProps {
  currentRank: AgentRank | null;
  nextRank: AgentRank | null;
  progressPercent: number;
  currentPE: number;
  className?: string;
}

const PulseEnergyProgressBar = ({ 
  currentRank, 
  nextRank, 
  progressPercent, 
  currentPE,
  className = '' 
}: PulseEnergyProgressBarProps) => {
  // Max rank reached
  if (!nextRank) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Pulse Energy Totale</span>
          <span className="text-sm font-bold text-cyan-400">{currentPE.toLocaleString('it-IT')} PE</span>
        </div>
        <div className="p-3 rounded-md bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-bold">GRADO MASSIMO RAGGIUNTO</span>
          </div>
        </div>
      </div>
    );
  }

  const peNeeded = nextRank.pe_min - currentPE;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Pulse Energy</span>
        <span className="text-sm font-bold text-cyan-400">{currentPE.toLocaleString('it-IT')} PE</span>
      </div>
      
      <Progress 
        value={progressPercent} 
        className="h-2 bg-gray-800"
      />
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {currentRank?.name_it || 'Attuale'}
        </span>
        <span className="text-cyan-400 font-medium">
          {peNeeded.toLocaleString('it-IT')} PE per {nextRank.name_it}
        </span>
      </div>
    </div>
  );
};

export default PulseEnergyProgressBar;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
