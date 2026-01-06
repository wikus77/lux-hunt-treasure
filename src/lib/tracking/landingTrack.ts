// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Lightweight landing page tracking helper

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('m1_session_id');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('m1_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track landing page event
 * @param eventName - One of the allowed event names
 * @param data - Optional event data (max 10 keys)
 */
export async function trackLandingEvent(
  eventName: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const sessionId = getSessionId();
  
  // Dispatch custom event for any local listeners (always works)
  window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
    detail: { action: eventName, ...data, sessionId } 
  }));

  // Send to Supabase edge function
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/track_event`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          event_name: eventName,
          event_data: data,
          session_id: sessionId,
          path: window.location.pathname,
          referrer: document.referrer
        })
      });
    } catch {
      // Silent fail - tracking should never break user experience
    }
  }
}

/**
 * Allowed event names for reference
 */
export const LANDING_EVENTS = {
  CTA_PRIMARY_CLICK: 'landing_cta_primary_click',
  MINITEST_CHOICE: 'landing_minitest_choice',
  PREMIUM_TOGGLE_OPEN: 'landing_premium_toggle_open',
  PLAN_SELECT: 'landing_plan_select',
  SPECTATOR_CLICK: 'landing_spectator_click',
  INSTALL_CLICK: 'landing_install_click',
  SPECTATOR_PAGE_VIEW: 'spectator_page_view',
  SPECTATOR_LOCKED_CLICK: 'spectator_locked_click',
  SPECTATOR_JOIN_CLICK: 'spectator_join_click',
} as const;

