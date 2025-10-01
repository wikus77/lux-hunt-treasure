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

export async function composeReply(options: ReplyOptions): Promise<string> {
  const { userText } = options;
  
  try {
    // Build Norah context from Supabase
    const norahCtx = await buildNorahContext();
    
    // Route intent
    const { intent } = routeIntent(userText);
    
    // Generate natural reply
    const reply = generateReply(intent, norahCtx, userText);
    
    return reply;
  } catch (error) {
    console.error('[NORAH] Reply generation failed:', error);
    return 'Errore di comunicazione. Riprova tra poco.';
  }
}
