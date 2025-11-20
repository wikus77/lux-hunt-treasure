// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';

interface Prize {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  quantity: number | null;
  claimed: number | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Clue {
  id: string;
  prize_id: string | null;
  clue_text: string;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export const usePrizeData = () => {
  // Stub: Simplified prize data - no legacy columns
  const [prizes] = useState<Prize[]>([]);
  const [clues] = useState<Clue[]>([]);
  const [loading] = useState(false);

  const fetchPrizes = async () => {
    console.log('usePrizeData: fetchPrizes stub');
  };

  const unlockClue = async () => {
    console.log('usePrizeData: unlockClue stub');
    return false;
  };

  return {
    prizes,
    clues,
    loading,
    fetchPrizes,
    unlockClue
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
