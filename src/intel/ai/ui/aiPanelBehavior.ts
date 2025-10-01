// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AI Panel Behavior - Compose contextual replies

import { generateAnalystReply, routeIntent } from '../engine/analystEngineV2';
import type { AgentContextData } from '../context/agentContext';
import type { ClueItem } from '../context/realtimeClues';

export interface ReplyOptions {
  mode: string;
  userText: string;
  context: AgentContextData;
  clues: ClueItem[];
}

export function composeReply(options: ReplyOptions): string {
  const { userText, context, clues } = options;
  
  // Generate seed for variety
  const seed = Date.now() ^ context.agentCode.charCodeAt(0);
  
  // Use V2 engine
  const reply = generateAnalystReply(userText, context, clues, seed);
  
  // Ensure max 3-6 sentences
  const sentences = reply.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const limited = sentences.slice(0, 6).join('. ') + '.';
  
  return limited;
}
