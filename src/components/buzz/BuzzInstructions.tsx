// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Instructions Component
import React from 'react';

interface BuzzStats {
  today_count: number;
  total_count: number;
  areas_unlocked: number;
  credits_spent: number;
}

interface BuzzInstructionsProps {
  stats: BuzzStats | null;
  isBlocked: boolean;
  getCurrentBuzzCostM1U: (dailyCount: number) => number;
}

export const BuzzInstructions: React.FC<BuzzInstructionsProps> = ({
  stats,
  isBlocked,
  getCurrentBuzzCostM1U
}) => {
  return (
    <div className="text-center space-y-2 z-30 max-w-md px-4">
      <div className="text-lg text-muted-foreground">
        Premi il pulsante per inviare un segnale e scoprire nuovi indizi. Ogni Buzz ti aiuta a trovare indizi nascosti.
      </div>
      {stats && !isBlocked && (
        <>
          <div className="text-lg text-muted-foreground">
            BUZZ oggi: <span className="font-bold text-primary">{stats.today_count}/50</span>
          </div>
          {stats.today_count < 50 && (
            <div className="text-sm text-muted-foreground">
              Prossimo: <span className="font-semibold">{getCurrentBuzzCostM1U(stats.today_count + 1)} M1U</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
