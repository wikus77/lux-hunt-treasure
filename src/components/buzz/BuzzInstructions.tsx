// by Joseph Mulé – M1SSION™ – BUZZ Instructions Component
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
  getCurrentBuzzPrice: (dailyCount: number) => number;
}

export const BuzzInstructions: React.FC<BuzzInstructionsProps> = ({
  stats,
  isBlocked,
  getCurrentBuzzPrice
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
              Prossimo: <span className="font-semibold">€{getCurrentBuzzPrice(stats.today_count + 1).toFixed(2)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};