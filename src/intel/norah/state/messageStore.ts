// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Message Store - In-memory + Supabase persistence

import { supabase } from '@/integrations/supabase/client';

export interface NorahMessage {
  role: 'user' | 'norah';
  content: string;
  intent?: string;
  timestamp: number;
}

let messageBuffer: NorahMessage[] = [];
let persistTimeout: NodeJS.Timeout | null = null;

export function addMessage(msg: NorahMessage) {
  messageBuffer.push(msg);
  
  // v4: Keep only last 8 turns (16 messages) for contextual memory
  if (messageBuffer.length > 16) {
    messageBuffer = messageBuffer.slice(-16);
  }

  // Debounced persist
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persistToSupabase(msg);
  }, 1000);
}

export function getMessages(): NorahMessage[] {
  return [...messageBuffer];
}

export function clearMessages() {
  messageBuffer = [];
}

/**
 * PATCH v6.1: Enhanced episodic summary with persistence
 * Episodic summary: generate brief summary of last 6 messages
 * Used for greeting continuity and conversational memory
 */
export function summarizeWindow(): string {
  if (messageBuffer.length < 6) return '';

  const last6 = messageBuffer.slice(-6);
  const userMessages = last6.filter(m => m.role === 'user');
  
  if (userMessages.length === 0) return '';

  // Extract key themes from user messages
  const topics = userMessages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Detect common themes
  if (topics.includes('buzz') && topics.includes('non') && topics.includes('capito')) {
    return 'Ieri eri bloccato su BUZZ';
  }
  if (topics.includes('finalshot') || topics.includes('final shot')) {
    return 'Stavamo parlando di Final Shot';
  }
  if (topics.includes('pattern') || topics.includes('analiz')) {
    return 'Stavi analizzando pattern negli indizi';
  }
  if (topics.includes('indiz') && userMessages.length >= 3) {
    return 'Stavi raccogliendo indizi';
  }
  if (topics.includes('confus') || topics.includes('aiut')) {
    return 'Ti stavo aiutando a orientarti';
  }

  return 'Continuiamo da dove eravamo rimasti';
}

/**
 * PATCH v6.1: Persist episodic summary to Supabase
 * Save summary every 6 messages for session continuity
 */
export async function persistEpisodicSummary(summary: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !summary) return;

    await supabase.from('norah_messages').insert({
      user_id: user.id,
      role: 'norah',
      content: '[EPISODIC_SUMMARY]',
      episodic_summary: summary,
      intent: null,
      context: {}
    });

    console.log('[Norah] Episodic summary persisted:', summary);
  } catch (error) {
    console.error('[Norah] Failed to persist summary:', error);
  }
}

/**
 * PATCH v6.1: Fetch last episodic summary on init
 * Used for contextual greeting after page refresh
 */
export async function fetchLastEpisodicSummary(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return '';

    const { data, error } = await supabase
      .from('norah_messages')
      .select('episodic_summary')
      .eq('user_id', user.id)
      .not('episodic_summary', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return '';

    console.log('[Norah] Fetched last summary:', data.episodic_summary);
    return data.episodic_summary || '';
  } catch (error) {
    console.error('[Norah] Failed to fetch summary:', error);
    return '';
  }
}

async function persistToSupabase(msg: NorahMessage) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('norah_messages').insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      intent: msg.intent,
      context: {}
    });
  } catch (error) {
    console.error('[Norah] Failed to persist message:', error);
  }
}
