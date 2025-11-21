// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Follow-Up Resolver v5 - Handles continuation queries

import type { NorahContext } from './contextBuilder';
import { nextBestAction, type NorahPhase } from './dialogueManager';
import { detectSentiment } from './sentiment';

/**
 * Check if input is a follow-up/continuation query
 */
export function isFollowUp(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const lower = input.toLowerCase().trim();

  // Common continuation patterns
  const followUpPatterns = [
    /^e\s+(poi|dopo|adesso|ora)\??$/i,
    /^e\s+poi\s+che\s+faccio\??$/i,
    /^e\s+adesso\??$/i,
    /^e\s+ora\??$/i,
    /^poi\??$/i,
    /^dopo\??$/i,
    /^next\??$/i,
    /^ok\s+e\s+poi\??$/i,
    /^ok\s+e\s+adesso\??$/i,
    /^what\s+next\??$/i,
    /^e\s+dopo\s+cosa\??$/i,
    /^cosa\s+faccio\s+adesso\??$/i,
    /^che\s+faccio\s+ora\??$/i
  ];

  for (const pattern of followUpPatterns) {
    if (pattern.test(lower)) {
      console.log('[FollowUp] Detected continuation query');
      return true;
    }
  }

  // Single word continuations
  const singleWordContinuations = ['poi', 'dopo', 'next', 'adesso', 'ora'];
  if (singleWordContinuations.includes(lower)) {
    console.log('[FollowUp] Detected single-word continuation');
    return true;
  }

  return false;
}

/**
 * Generate follow-up response with Next Best Action
 */
export function generateFollowUpReply(
  ctx: NorahContext,
  phase: NorahPhase,
  userInput: string
): string {
  const sentiment = detectSentiment(userInput);
  const nba = nextBestAction(ctx, phase, sentiment);
  const agentName = ctx?.agent?.username || ctx?.agent?.code || 'Agente';

  // Friendly intro - v6: più naturale
  const intros = [
    `Ok ${agentName}, ecco il prossimo passo:`,
    `Bene! Il prossimo step è questo:`,
    `Perfetto, procediamo così:`,
    `Ok, ecco cosa fare adesso:`,
    `Chiaro, passiamo a:`
  ];

  const closers = [
    '\n\nVai così!',
    '\n\nProcedi pure.',
    '\n\nFammi sapere come va.',
    '\n\nCi siamo!',
    '\n\nSei sulla strada giusta.'
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];
  const closer = closers[Math.floor(Math.random() * closers.length)];

  // Format steps as bullet list
  const stepsList = nba.steps
    .map((step, idx) => `${idx + 1}. ${step}`)
    .join('\n');

  return `${intro}\n\n**${nba.title}**\n\n${stepsList}${closer}`;
}
