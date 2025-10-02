// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AI Panel Behavior - Using NORAH Engine

import { routeIntent } from '@/intel/norah/engine/intentRouter';
import { buildNorahContext } from '@/intel/norah/engine/contextBuilder';
import { generateReply } from '@/intel/norah/engine/replyGenerator';

export interface ReplyOptions {
  mode: string;
  userText: string;
  context?: any;
  clues?: any[];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.7
export async function composeReply(options: ReplyOptions): Promise<string> {
  const { userText } = options;
  
  try {
    // Generate natural reply with unified signature (1 arg)
    const reply = await generateReply(userText);
    
    return reply;
  } catch (error) {
    console.error('[NORAH] Reply generation failed:', error);
    return 'Errore di comunicazione. Riprova tra poco.';
  }
}
