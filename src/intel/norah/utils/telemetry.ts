// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH Telemetry - Conversational analytics

import { supabase } from '@/integrations/supabase/client';

export interface TelemetryEvent {
  event: string;
  intent?: string;
  sentiment?: string;
  phase?: string;
  meta?: Record<string, any>;
}

async function getUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function logEvent(e: TelemetryEvent): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.warn('[Telemetry] No user ID, skipping event:', e.event);
      return;
    }

    await supabase.from('norah_events').insert({
      user_id: userId,
      event: e.event,
      intent: e.intent || null,
      sentiment: e.sentiment || null,
      phase: e.phase || null,
      event_type: e.event,
      created_at: new Date().toISOString()
    });

    console.log('[Telemetry] Event logged:', e.event);
  } catch (error) {
    console.error('[Telemetry] Failed to log event:', error);
  }
}

export async function logPillClick(payload: string, phase: string): Promise<void> {
  await logEvent({
    event: 'pill_click',
    phase,
    meta: { payload }
  });
}

export async function logJokeUsed(sentiment: string, jokeText: string): Promise<void> {
  await logEvent({
    event: 'joke_used',
    sentiment,
    meta: { joke: jokeText.substring(0, 100) }
  });
}

export async function logRetentionTrigger(reason: string, clues: number): Promise<void> {
  await logEvent({
    event: 'retention_trigger',
    meta: { reason, clues }
  });
}
