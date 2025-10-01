// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AI Panel Behavior - Compose contextual replies (Norah v1.0)

import { routeIntent } from '../brain/intentRouter';
import { composeReply as composeNorahReply } from '../brain/naturalComposer';
import type { AgentContextData } from '../context/agentContext';
import type { ClueItem } from '../context/realtimeClues';
import type { NorahContext } from '@/intel/context/schema';

export interface ReplyOptions {
  mode: string;
  userText: string;
  context: AgentContextData;
  clues: ClueItem[];
}

export function composeReply(options: ReplyOptions): string {
  const { userText, context, clues } = options;
  
  // Build Norah context from agent context
  const norahCtx: NorahContext = {
    agentCode: context.agentCode,
    displayName: context.displayName,
    mission: context.currentWeek 
      ? { id: 'current', name: 'M1SSION', week: context.currentWeek }
      : null,
    clues: clues.map(c => ({
      id: c.id,
      text: c.title || c.description || '',
      created_at: new Date().toISOString()
    })),
    stats: {
      cluesTotal: context.cluesCount,
      recentCount: clues.length,
      buzzToday: 0
    },
    plan: context.planType 
      ? { tier: context.planType as any }
      : null,
    updatedAt: Date.now()
  };
  
  // Route intent
  const intent = routeIntent(userText, norahCtx);
  
  // Compose natural reply
  const reply = composeNorahReply(intent, norahCtx);
  
  return reply;
}
