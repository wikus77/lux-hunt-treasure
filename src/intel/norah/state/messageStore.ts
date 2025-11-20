// @ts-nocheck
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

// v7.0: Enhanced with persistence tracking
export function addMessage(msg: NorahMessage) {
  messageBuffer.push(msg);
  
  // v4: Keep only last 8 turns (16 messages) for contextual memory
  if (messageBuffer.length > 16) {
    messageBuffer = messageBuffer.slice(-16);
  }

  // v7.0: Immediate persist with result tracking
  persistToSupabase(msg).then(success => {
    if (!success) {
      console.error('[Norah v7.0] Failed to persist message after retries, storing locally');
      // v7.0: Fallback to localStorage for recovery
      const failedMessages = JSON.parse(localStorage.getItem('norah_failed_messages') || '[]');
      failedMessages.push({ ...msg, timestamp: Date.now() });
      localStorage.setItem('norah_failed_messages', JSON.stringify(failedMessages));
    }
  });

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

// v7.0: Enhanced persistence with retry logic and detailed diagnostics
async function persistToSupabase(msg: NorahMessage, retryCount = 0): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[Norah v7.0] Auth error during persist:', authError);
      return false;
    }
    
    if (!user) {
      console.warn('[Norah v7.0] No authenticated user, skipping persist');
      return false;
    }

    console.log('[Norah v7.0] Persisting message:', { 
      user_id: user.id, 
      role: msg.role, 
      content_length: msg.content.length,
      intent: msg.intent,
      attempt: retryCount + 1
    });

    const { data, error } = await supabase.from('norah_messages').insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      intent: msg.intent,
      context: {}
    }).select();

    if (error) {
      console.error('[Norah v7.0] Insert error:', error);
      
      // v7.0: Retry logic (max 2 retries)
      if (retryCount < 2) {
        console.log(`[Norah v7.0] Retrying persist (${retryCount + 1}/2)...`);
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
        return persistToSupabase(msg, retryCount + 1);
      }
      return false;
    }

    console.log('[Norah v7.0] Message persisted successfully:', data);
    return true;
  } catch (error) {
    console.error('[Norah v7.0] Unexpected error during persist:', error);
    
    // v7.0: Retry on unexpected errors
    if (retryCount < 2) {
      console.log(`[Norah v7.0] Retrying after unexpected error (${retryCount + 1}/2)...`);
      await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
      return persistToSupabase(msg, retryCount + 1);
    }
    return false;
  }
}

/**
 * v6.2: Save episodic memory to DB
 */
// v7.0: Enhanced episodic memory with detailed emotional tracking
async function saveEpisodicMemory() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[Norah v7.0] Auth error during episodic save:', authError);
      return;
    }
    
    if (!user) {
      console.warn('[Norah v7.0] No authenticated user for episodic memory');
      return;
    }

    const summary = summarizeWindow();
    if (!summary) return;

    // v7.0: Enhanced emotional detection
    const lastMessages = messageBuffer.slice(-6);
    const hasFrustration = lastMessages.some(m => 
      m.content.toLowerCase().includes('difficile') || 
      m.content.toLowerCase().includes('basta') ||
      m.content.toLowerCase().includes('confuso') ||
      m.content.toLowerCase().includes('non capisco')
    );
    const hasBreakthrough = lastMessages.some(m => 
      m.content.toLowerCase().includes('capito') || 
      m.content.toLowerCase().includes('perfetto') ||
      m.content.toLowerCase().includes('chiaro') ||
      m.content.toLowerCase().includes('grazie')
    );

    const emotionalPeak = hasFrustration ? 'negative' 
      : hasBreakthrough ? 'breakthrough' 
      : 'positive';

    console.log('[Norah v7.0] Saving episodic memory:', {
      user_id: user.id,
      summary,
      emotionalPeak,
      messageCount: lastMessages.length
    });

    const { data, error } = await supabase.from('norah_memory_episodes').insert({
      user_id: user.id,
      summary,
      emotional_peak: emotionalPeak,
      learned_pref: {}
    }).select();

    if (error) {
      console.error('[Norah v7.0] Failed to insert episodic memory:', error);
      return;
    }

    console.log('[Norah v7.0] Episodic memory saved successfully:', data);
    
    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    const { logEpisodeSaved } = await import('@/intel/norah/utils/telemetry');
    await logEpisodeSaved(
      lastMessages.length,
      emotionalPeak !== 'positive'
    );
  } catch (error) {
    console.error('[Norah v7.0] Unexpected error saving episodic memory:', error);
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
