// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v6.3: Norah Message Store - Episodic Memory with async greeting

import { supabase } from '@/integrations/supabase/client';

let episodicMemoryCache: string | null = null;
let episodicMemoryFetched = false;

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

  // v6.2: Check if we should save episodic memory (every 6 messages)
  if (messageBuffer.length % 6 === 0 && messageBuffer.length > 0) {
    saveEpisodicMemory();
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

/**
 * v6.2: Save episodic memory to DB
 */
async function saveEpisodicMemory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const summary = summarizeWindow();
    if (!summary) return;

    // Detect emotional peak
    const lastMessages = messageBuffer.slice(-6);
    const hasFrustration = lastMessages.some(m => 
      m.content.toLowerCase().includes('difficile') || 
      m.content.toLowerCase().includes('basta')
    );
    const hasBreakthrough = lastMessages.some(m => 
      m.content.toLowerCase().includes('capito') || 
      m.content.toLowerCase().includes('perfetto')
    );

    const emotionalPeak = hasFrustration ? 'negative' 
      : hasBreakthrough ? 'breakthrough' 
      : 'positive';

    await supabase.from('norah_memory_episodes').insert({
      user_id: user.id,
      summary,
      emotional_peak: emotionalPeak,
      learned_pref: {}
    });

    console.log('[Norah] Episodic memory saved:', summary);
    
    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // v6.6: Log episode saved telemetry
    const { logEpisodeSaved } = await import('@/intel/norah/utils/telemetry');
    await logEpisodeSaved(
      lastMessages.length,
      emotionalPeak !== 'positive'
    );
  } catch (error) {
    console.error('[Norah] Failed to save episodic memory:', error);
  }
}

/**
 * v6.3: Fetch last episodic memory for greeting with timeout protection
 */
export async function fetchLastEpisode(): Promise<string | null> {
  try {
    if (episodicMemoryFetched && episodicMemoryCache) {
      return episodicMemoryCache;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // v6.3: Add timeout protection (300ms)
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 300);
    });

    const fetchPromise = supabase
      .from('norah_memory_episodes')
      .select('summary, emotional_peak')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const result = await Promise.race([fetchPromise, timeoutPromise]);

    if (!result || result === null) {
      episodicMemoryFetched = true;
      return null;
    }

    const { data, error } = result as any;

    if (error || !data) {
      episodicMemoryFetched = true;
      return null;
    }

    episodicMemoryCache = data.summary;
    episodicMemoryFetched = true;
    return data.summary;
  } catch {
    episodicMemoryFetched = true;
    return null;
  }
}

/**
 * v6.3: Reset episodic cache (useful for testing)
 */
export function resetEpisodicCache() {
  episodicMemoryCache = null;
  episodicMemoryFetched = false;
}
