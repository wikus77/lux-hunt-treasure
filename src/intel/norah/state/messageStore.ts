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

  // v6.9: CRITICAL FIX - Immediate persist (no debounce to prevent data loss)
  persistToSupabase(msg);

  // v6.8: Check if we should save episodic memory (every 5 messages)
  if (messageBuffer.length % 5 === 0 && messageBuffer.length > 0) {
    saveEpisodicMemory();
  }
}

export function getMessages(): NorahMessage[] {
  return [...messageBuffer];
}

export function clearMessages() {
  messageBuffer = [];
}

/**
 * v6.8: Episodic summary: generate brief summary of last 5 messages
 * Used for greeting continuity and conversational memory
 */
export function summarizeWindow(): string {
  if (messageBuffer.length < 5) return '';

  const last5 = messageBuffer.slice(-5);
  const userMessages = last5.filter(m => m.role === 'user');
  
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
 * v6.8: Fetch last episodic memory for greeting with timeout protection
 * Returns { summary: string } object for compatibility with useNorah
 */
export async function fetchLastEpisode(options?: { timeoutMs?: number }): Promise<{ summary: string } | null> {
  try {
    if (episodicMemoryFetched && episodicMemoryCache) {
      return { summary: episodicMemoryCache };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // v6.8: Configurable timeout (default 300ms)
    const timeoutMs = options?.timeoutMs || 300;
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    const fetchPromise = supabase
      .from('norah_memory_episodes')
      .select('summary, emotional_peak, created_at')
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

    // v6.8: Check if episode is recent (<14 days)
    const episodeDate = new Date(data.created_at);
    const daysSince = (Date.now() - episodeDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince > 14) {
      episodicMemoryFetched = true;
      return null;
    }

    episodicMemoryCache = data.summary;
    episodicMemoryFetched = true;
    return { summary: data.summary };
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
