import { useMemo } from 'react';

export interface DockPosition {
  id: string;
  top: number;
}

interface UseDockLayoutOptions {
  itemHeight?: number;
  gap?: number;
  maxIterations?: number;
}

export const useDockLayout = (
  itemIds: string[],
  options: UseDockLayoutOptions = {}
) => {
  const {
    itemHeight = 36,
    gap = 10,
    maxIterations = 6
  } = options;

  const positions = useMemo(() => {
    const result: DockPosition[] = [];
    
    itemIds.forEach((id, index) => {
      let top = index * (itemHeight + gap);
      let iterations = 0;
      
      // Anti-overlap collision detection with micro-nudge
      while (iterations < maxIterations) {
        const overlaps = result.some(pos => 
          Math.abs(pos.top - top) < itemHeight
        );
        if (!overlaps) break;
        top += 8; // Nudge down
        iterations++;
      }
      
      result.push({ id, top });
    });
    
    return result;
  }, [itemIds, itemHeight, gap, maxIterations]);

  return positions;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
