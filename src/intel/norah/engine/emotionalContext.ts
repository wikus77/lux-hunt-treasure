// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v7.0: Emotional Context Engine - Sentiment History & Adaptive Tone

import { supabase } from '@/integrations/supabase/client';

export interface EmotionalContext {
  currentSentiment: 'frustrated' | 'confused' | 'rushed' | 'neutral' | 'excited';
  recentEmotions: Array<{ sentiment: string; timestamp: number }>;
  hasRecentFrustration: boolean;
  hasRecentBreakthrough: boolean;
  emotionalTrend: 'improving' | 'declining' | 'stable';
}

const emotionalHistory: Array<{ sentiment: string; timestamp: number }> = [];

/**
 * v7.0: Track emotional state across conversation
 */
export function trackEmotion(sentiment: string): void {
  emotionalHistory.push({
    sentiment,
    timestamp: Date.now()
  });

  // Keep only last 10 emotional states
  if (emotionalHistory.length > 10) {
    emotionalHistory.shift();
  }
}

/**
 * v7.0: Get emotional context for adaptive responses
 */
export function getEmotionalContext(): EmotionalContext {
  const now = Date.now();
  const recentWindow = 5 * 60 * 1000; // 5 minutes
  
  const recentEmotions = emotionalHistory.filter(
    e => now - e.timestamp < recentWindow
  );

  const hasRecentFrustration = recentEmotions.some(
    e => e.sentiment === 'frustrated' || e.sentiment === 'confused'
  );

  const hasRecentBreakthrough = recentEmotions.some(
    e => e.sentiment === 'excited'
  );

  // Detect emotional trend
  let emotionalTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentEmotions.length >= 3) {
    const last3 = recentEmotions.slice(-3);
    const negativeCount = last3.filter(e => 
      e.sentiment === 'frustrated' || e.sentiment === 'confused'
    ).length;
    
    if (negativeCount >= 2) {
      emotionalTrend = 'declining';
    } else if (last3[last3.length - 1].sentiment === 'excited') {
      emotionalTrend = 'improving';
    }
  }

  const currentSentiment = recentEmotions.length > 0 
    ? (recentEmotions[recentEmotions.length - 1].sentiment as any)
    : 'neutral';

  return {
    currentSentiment,
    recentEmotions,
    hasRecentFrustration,
    hasRecentBreakthrough,
    emotionalTrend
  };
}

/**
 * v7.0: Get adaptive empathy prefix based on emotional context
 */
export function getAdaptiveEmpathy(context: EmotionalContext): string {
  if (context.emotionalTrend === 'declining' && context.hasRecentFrustration) {
    return 'Capisco che possa sembrare complesso. Andiamo step by step. ';
  }

  if (context.hasRecentBreakthrough) {
    return 'Ottimo lavoro! Continua così. ';
  }

  if (context.currentSentiment === 'confused') {
    return 'Ok, facciamo chiarezza insieme. ';
  }

  if (context.currentSentiment === 'rushed') {
    return 'Veloce e chiaro: ';
  }

  return '';
}

/**
 * v7.0: Get celebration message for breakthroughs
 */
export function getCelebrationMessage(achievement: string): string {
  const celebrations = [
    `🎯 Fantastico! ${achievement}`,
    `💪 Grande! ${achievement}`,
    `✨ Perfetto! ${achievement}`,
    `🔥 Ottimo lavoro! ${achievement}`,
    `⭐ Bravissimo! ${achievement}`
  ];
  
  return celebrations[Math.floor(Math.random() * celebrations.length)];
}

/**
 * v7.0: Persist emotional context to DB for long-term learning
 */
export async function persistEmotionalContext(userId: string, context: EmotionalContext): Promise<void> {
  try {
    await supabase.from('norah_events').insert({
      user_id: userId,
      event: 'emotional_context',
      sentiment: context.currentSentiment,
      meta: {
        trend: context.emotionalTrend,
        has_frustration: context.hasRecentFrustration,
        has_breakthrough: context.hasRecentBreakthrough
      }
    });
  } catch (error) {
    console.error('[EmotionalContext v7.0] Failed to persist:', error);
  }
}
