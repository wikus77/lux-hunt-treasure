// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Analytics SDK - Client-side event tracking with batching, offline queue, retry
//
// Features:
// - Async tracking (non-blocking)
// - Batch sending (configurable interval)
// - Offline queue with localStorage persistence
// - Automatic retry with exponential backoff
// - Session and anonymous ID management
// - PWA / Safari iOS compatible
// - Event versioning for schema evolution
//
// ⚠️ EVENT VERSIONING:
// - Current version: 1
// - Do NOT bump without coordinating with backend schema migration
// - All events are immutable after insertion (DB trigger blocks UPDATE/DELETE)

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════
// EVENT VERSION - Do NOT change without migration plan
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_VERSION = 1;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AnalyticsEventName = 
  // Sessioni / App lifecycle
  | 'app_open'
  | 'session_start'
  | 'session_end'
  | 'app_background'
  | 'app_foreground'
  // Auth
  | 'login_started'
  | 'login_success'
  | 'login_failed'
  | 'signup_started'
  | 'signup_completed'
  | 'logout'
  // Mappa
  | 'map_opened'
  | 'map_pan'
  | 'map_zoom'
  | 'map_area_viewed'
  | 'map_area_entered'
  | 'map_area_exited'
  // Indizi
  | 'clue_viewed'
  | 'clue_unlocked'
  | 'clue_completed'
  | 'clue_shared'
  | 'clue_failed'
  // BUZZ
  | 'buzz_used'
  | 'buzz_insufficient_balance'
  | 'buzz_purchase_prompt_shown'
  | 'wallet_balance_changed'
  | 'reward_received'
  | 'reward_redeemed'
  // Monetizzazione
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'subscription_started'
  | 'subscription_renewed'
  | 'subscription_canceled'
  // Viralità
  | 'share_started'
  | 'share_completed'
  | 'invite_sent'
  | 'invite_accepted'
  // Progressione
  | 'rank_up'
  | 'badge_earned'
  | 'milestone_reached'
  // Errori
  | 'error_shown'
  | 'action_aborted'
  | 'permission_denied'
  | 'location_denied'
  | 'timeout_occurred'
  // WINNERS
  | 'secondary_reward_won'
  | 'final_shot_won'
  | 'final_shot_attempted'
  // Navigation
  | 'route_viewed'
  | 'screen_viewed';

interface AnalyticsEvent {
  event_name: AnalyticsEventName;
  client_ts: string;
  props: Record<string, unknown>;
  dedupe_key?: string;
  route?: string;
}

interface TrackOptions {
  dedupe_key?: string;
  immediate?: boolean;  // Skip batching, send immediately
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  ANON_ID: 'm1_anon_id',
  SESSION_ID: 'm1_session_id',
  QUEUE: 'm1_analytics_queue',
  LAST_FLUSH: 'm1_analytics_last_flush',
};

const CONFIG = {
  BATCH_INTERVAL_MS: 5000,       // Flush every 5 seconds
  MAX_BATCH_SIZE: 20,            // Max events per batch
  MAX_QUEUE_SIZE: 200,           // Max queued events
  QUEUE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  RETRY_MAX: 3,
  RETRY_BASE_MS: 1000,
  SUPABASE_FUNCTION_URL: '/functions/v1/analytics-track',
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

let isInitialized = false;
let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let userId: string | null = null;
let anonId: string | null = null;
let sessionId: string | null = null;

// Platform detection
const getPlatform = (): 'web' | 'pwa' | 'ios' | 'android' => {
  if (typeof window === 'undefined') return 'web';
  
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  if (isPWA) {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('android')) return 'android';
    return 'pwa';
  }
  
  return 'web';
};

// App version from meta tag or env
const getAppVersion = (): string => {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="app-version"]');
    if (meta) return meta.getAttribute('content') || '1.0.0';
  }
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
};

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage not available or full - silent fail
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silent fail
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ID MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getOrCreateAnonId(): string {
  if (anonId) return anonId;
  
  let stored = safeGetItem(STORAGE_KEYS.ANON_ID);
  if (!stored) {
    stored = `anon_${generateId()}`;
    safeSetItem(STORAGE_KEYS.ANON_ID, stored);
  }
  
  anonId = stored;
  return stored;
}

function getOrCreateSessionId(): string {
  if (sessionId) return sessionId;
  
  // Session ID lives in sessionStorage (cleared on tab close)
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  } catch {}
  
  if (!stored) {
    stored = `sess_${generateId()}`;
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, stored);
    } catch {}
  }
  
  sessionId = stored;
  return stored;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function loadQueueFromStorage(): void {
  try {
    const stored = safeGetItem(STORAGE_KEYS.QUEUE);
    if (stored) {
      const parsed = JSON.parse(stored) as { events: AnalyticsEvent[]; timestamp: number };
      
      // Check TTL
      if (Date.now() - parsed.timestamp < CONFIG.QUEUE_TTL_MS) {
        eventQueue = parsed.events.slice(0, CONFIG.MAX_QUEUE_SIZE);
      } else {
        // Queue expired, clear it
        safeRemoveItem(STORAGE_KEYS.QUEUE);
      }
    }
  } catch {
    // Invalid JSON or other error - start fresh
    eventQueue = [];
  }
}

function saveQueueToStorage(): void {
  try {
    if (eventQueue.length > 0) {
      safeSetItem(STORAGE_KEYS.QUEUE, JSON.stringify({
        events: eventQueue.slice(0, CONFIG.MAX_QUEUE_SIZE),
        timestamp: Date.now(),
      }));
    } else {
      safeRemoveItem(STORAGE_KEYS.QUEUE);
    }
  } catch {
    // silent fail
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUSH (SEND TO SERVER)
// ═══════════════════════════════════════════════════════════════════════════

async function sendBatch(events: AnalyticsEvent[], retryCount = 0): Promise<boolean> {
  if (events.length === 0) return true;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Analytics] Missing Supabase config');
    return false;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}${CONFIG.SUPABASE_FUNCTION_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        events,
        session_id: getOrCreateSessionId(),
        anon_id: getOrCreateAnonId(),
        user_id: userId,
        platform: getPlatform(),
        app_version: getAppVersion(),
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        event_version: EVENT_VERSION, // Schema version - do NOT bump without migration
      }),
    });
    
    if (response.ok) {
      return true;
    }
    
    // Retry on 5xx errors
    if (response.status >= 500 && retryCount < CONFIG.RETRY_MAX) {
      const delay = CONFIG.RETRY_BASE_MS * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendBatch(events, retryCount + 1);
    }
    
    return false;
  } catch (error) {
    // Network error - retry
    if (retryCount < CONFIG.RETRY_MAX) {
      const delay = CONFIG.RETRY_BASE_MS * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendBatch(events, retryCount + 1);
    }
    
    console.warn('[Analytics] Send failed after retries:', error);
    return false;
  }
}

async function flush(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  // Take batch from queue
  const batch = eventQueue.splice(0, CONFIG.MAX_BATCH_SIZE);
  
  // Save remaining queue
  saveQueueToStorage();
  
  // Send batch
  const success = await sendBatch(batch);
  
  if (!success) {
    // Put events back in queue for retry later
    eventQueue = [...batch, ...eventQueue].slice(0, CONFIG.MAX_QUEUE_SIZE);
    saveQueueToStorage();
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush().catch(console.warn);
  }, CONFIG.BATCH_INTERVAL_MS);
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize the analytics SDK
 * Call this once on app startup
 */
export function initAnalytics(): void {
  if (isInitialized) return;
  
  isInitialized = true;
  
  // Load any queued events from storage
  loadQueueFromStorage();
  
  // Get/create IDs
  getOrCreateAnonId();
  getOrCreateSessionId();
  
  // Try to get user ID from Supabase session
  supabase.auth.getUser().then(({ data }) => {
    if (data?.user?.id) {
      userId = data.user.id;
    }
  }).catch(() => {});
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    userId = session?.user?.id || null;
  });
  
  // Flush on page visibility change (background)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush().catch(console.warn);
      }
    });
  }
  
  // Flush on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable delivery
      if (eventQueue.length > 0 && navigator.sendBeacon) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        
        if (supabaseUrl && supabaseAnonKey) {
          const blob = new Blob([JSON.stringify({
            events: eventQueue.slice(0, CONFIG.MAX_BATCH_SIZE),
            session_id: getOrCreateSessionId(),
            anon_id: getOrCreateAnonId(),
            user_id: userId,
            platform: getPlatform(),
            app_version: getAppVersion(),
            locale: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            event_version: EVENT_VERSION,
          })], { type: 'application/json' });
          
          navigator.sendBeacon(`${supabaseUrl}${CONFIG.SUPABASE_FUNCTION_URL}`, blob);
        }
      }
    });
  }
  
  // Track session start
  track('session_start', {});
  
  // Flush any pending events from previous session
  if (eventQueue.length > 0) {
    flush().catch(console.warn);
  }
}

/**
 * Track an event
 * Non-blocking, events are batched and sent asynchronously
 */
export function track(
  eventName: AnalyticsEventName, 
  props: Record<string, unknown> = {},
  options: TrackOptions = {}
): void {
  if (!isInitialized) {
    initAnalytics();
  }
  
  const event: AnalyticsEvent = {
    event_name: eventName,
    client_ts: new Date().toISOString(),
    props,
    dedupe_key: options.dedupe_key,
    route: typeof window !== 'undefined' ? window.location.pathname : undefined,
  };
  
  // Add to queue
  eventQueue.push(event);
  
  // Enforce max queue size
  if (eventQueue.length > CONFIG.MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(-CONFIG.MAX_QUEUE_SIZE);
  }
  
  // Save to storage
  saveQueueToStorage();
  
  // Send immediately or schedule
  if (options.immediate) {
    flush().catch(console.warn);
  } else {
    scheduleFlush();
  }
}

/**
 * Track an event with idempotency (only tracked once per dedupe_key)
 */
export function trackOnce(
  eventName: AnalyticsEventName,
  dedupeKey: string,
  props: Record<string, unknown> = {}
): void {
  track(eventName, props, { dedupe_key: dedupeKey });
}

/**
 * Manually flush all pending events
 */
export function flushAnalytics(): Promise<void> {
  return flush();
}

/**
 * Set the user ID (call after login)
 */
export function setAnalyticsUserId(id: string | null): void {
  userId = id;
}

/**
 * Get the anonymous ID
 */
export function getAnonId(): string {
  return getOrCreateAnonId();
}

/**
 * Get the session ID
 */
export function getSessionId(): string {
  return getOrCreateSessionId();
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN VIEW HELPER (for landing pages tracking)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track a screen/page view
 * Use this for landing pages and public pages tracking
 */
export function trackScreen(
  screenName: string,
  props: Record<string, unknown> = {}
): void {
  track('screen_viewed', {
    screen: screenName,
    route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    ...props,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const Analytics = {
  init: initAnalytics,
  track,
  trackOnce,
  trackScreen,
  flush: flushAnalytics,
  setUserId: setAnalyticsUserId,
  getAnonId,
  getSessionId,
  EVENT_VERSION, // Expose for debugging
};

export default Analytics;

