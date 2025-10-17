// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Server-side telemetry helper - Non-invasive event logging

import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

interface AiEventPayload {
  user_id: string;
  session_id?: string;
  type: string;
  payload_json?: Record<string, any>;
}

// Debounce cache (in-memory, simple implementation)
const eventCache = new Map<string, number>();
const DEBOUNCE_MS = 250;

/**
 * Log AI event to ai_events table with debounce protection
 * Non-throwing: never breaks user flow
 */
export async function logAiEvent(event: AiEventPayload): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Debounce key: user + type
    const debounceKey = `${event.user_id}:${event.type}`;
    const lastEvent = eventCache.get(debounceKey);
    const now = Date.now();

    if (lastEvent && (now - lastEvent) < DEBOUNCE_MS) {
      console.log(`[telemetry] Debounced: ${event.type} for ${event.user_id}`);
      return; // Skip duplicate event within debounce window
    }

    eventCache.set(debounceKey, now);

    // Insert event (no-throw)
    const { error } = await supabase
      .from('ai_events')
      .insert({
        user_id: event.user_id,
        session_id: event.session_id || null,
        event_type: event.type,
        payload: event.payload_json || {}
      });

    if (error) {
      console.error('[telemetry] Insert error (non-fatal):', error);
    } else {
      console.log(`[telemetry] Logged: ${event.type} for ${event.user_id}`);
    }

    // Cleanup old cache entries (prevent memory leak)
    if (eventCache.size > 1000) {
      const entries = Array.from(eventCache.entries());
      entries.sort((a, b) => a[1] - b[1]);
      entries.slice(0, 500).forEach(([key]) => eventCache.delete(key));
    }

  } catch (error) {
    // Never throw - silent fail to protect user flow
    console.error('[telemetry] Exception (non-fatal):', error);
  }
}

/**
 * Bootstrap or get active AI session for user
 */
export async function getOrCreateSession(
  userId: string,
  locale: string = 'it',
  device: string = 'unknown',
  subscriptionTier: string = 'free'
): Promise<string | null> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check for active session (< 1h old)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const { data: existingSession } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('last_active_at', oneHourAgo)
      .order('last_active_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      // Update last_active_at
      await supabase
        .from('ai_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existingSession.id);

      console.log(`[telemetry] Reusing session: ${existingSession.id}`);
      return existingSession.id;
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('ai_sessions')
      .insert({
        user_id: userId,
        locale,
        device,
        subscription_tier: subscriptionTier,
        started_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('[telemetry] Session creation error:', error);
      return null;
    }

    console.log(`[telemetry] Created session: ${newSession.id}`);
    return newSession.id;

  } catch (error) {
    console.error('[telemetry] Session bootstrap error:', error);
    return null;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
