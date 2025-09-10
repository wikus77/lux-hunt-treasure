/**
 * © 2025 Joseph MULÉ – M1SSION™ Interest Signals Tracking
 * CLIENT-SIDE: Track user interests, queue events, batch-send to backend
 * NO UI/UX changes - purely background telemetry
 */

import { supabase } from '@/integrations/supabase/client';

// Type definitions
export type TrackingSection = 'Map' | 'Intel' | 'Notice' | 'Rewards' | 'BuzzMap';

export interface InterestEvent {
  type: 'view' | 'click' | 'dwell' | 'favorite';
  section?: TrackingSection;
  category?: string;
  meta?: Record<string, string | number>;
  ts: string; // ISO timestamp
  device: string;
  keywords: string[];
}

export interface FavoriteEntity {
  type: 'mission' | 'reward' | 'brand';
  id: string;
}

// Event queue management
class InterestSignalsQueue {
  private events: InterestEvent[] = [];
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private isOnline = true;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupFlushTimer();
    this.setupVisibilityHandler();
    this.setupOnlineHandler();
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getDeviceHint(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    
    if (isStandalone && /iPhone|iPad|iPod/i.test(userAgent)) {
      return 'ios_pwa';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'safari';
    } else if (/Chrome/i.test(userAgent)) {
      return 'chrome';
    } else {
      return 'desktop';
    }
  }

  private extractKeywords(): string[] {
    if (typeof window === 'undefined') return [];
    
    const keywords: string[] = [];
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    
    // Extract from route
    if (pathname.includes('map')) keywords.push('map');
    if (pathname.includes('intel')) keywords.push('intel');
    if (pathname.includes('reward')) keywords.push('reward');
    if (pathname.includes('mission')) keywords.push('mission');
    
    // Extract from query params
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((value, key) => {
      if (key === 'q' || key === 'search') {
        keywords.push(...value.split(' ').slice(0, 2)); // Max 2 keywords from search
      }
    });
    
    return keywords.slice(0, 3); // Top 3 keywords max
  }

  private setupFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 10000); // Flush every 10 seconds
  }

  private setupVisibilityHandler(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  private setupOnlineHandler(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.retryCount = 0;
      this.flush();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  track(event: Omit<InterestEvent, 'ts' | 'device' | 'keywords'>): void {
    try {
      const fullEvent: InterestEvent = {
        ...event,
        ts: new Date().toISOString(),
        device: this.getDeviceHint(),
        keywords: this.extractKeywords()
      };

      this.events.push(fullEvent);

      // Log only if debug enabled
      if (import.meta.env.VITE_DIAG === '1') {
        console.log('📊 Interest tracked:', fullEvent.type, fullEvent.section || fullEvent.category);
      }

      // Flush immediately if queue is getting large
      if (this.events.length >= 20) {
        this.flush();
      }
    } catch (error) {
      // Never throw, fail silently
      if (import.meta.env.VITE_DIAG === '1') {
        console.warn('Interest tracking failed:', error);
      }
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0 || !this.isOnline || this.retryCount >= this.maxRetries) {
      return;
    }

    const eventsToSend = [...this.events];
    this.events = []; // Clear queue immediately

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        if (import.meta.env.VITE_DIAG === '1') {
          console.warn('📊 Interest flush: No authenticated user');
        }
        return;
      }

      const payload = {
        user_id: user.id,
        session_id: this.sessionId,
        events: eventsToSend
      };

      // Try RPC first, fallback to direct insert
      let rpcError: any = null;
      try {
        const { error } = await (supabase as any).rpc('interest_track', payload);
        rpcError = error;
      } catch (e) {
        rpcError = e;
      }
      
      if (rpcError) {
        // Fallback: direct table insert (less efficient but works)
        try {
          const { error: insertError } = await (supabase as any)
            .from('interest_signals')
            .insert(
              eventsToSend.map(event => ({
                user_id: user.id,
                session_id: this.sessionId,
                ts: event.ts,
                type: event.type,
                section: event.section || null,
                category: event.category || null,
                meta: event.meta || {},
                device: event.device,
                keywords: event.keywords
              }))
            );

          if (insertError) {
            throw insertError;
          }
        } catch (fallbackError) {
          throw fallbackError;
        }
      }

      this.retryCount = 0;

      if (import.meta.env.VITE_DIAG === '1') {
        console.log('📊 Interest flush: Sent', eventsToSend.length, 'events');
      }
    } catch (error) {
      this.retryCount++;
      
      // Re-queue events on failure with exponential backoff
      this.events.unshift(...eventsToSend);
      
      const backoffDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
      setTimeout(() => this.flush(), backoffDelay);

      if (import.meta.env.VITE_DIAG === '1') {
        console.warn('📊 Interest flush failed, retry', this.retryCount, '/', this.maxRetries, error);
      }
    }
  }

  // Diagnostic helpers
  queueSize(): number {
    return this.events.length;
  }

  flushNow(): Promise<void> {
    return this.flush();
  }
}

// Global queue instance
const queue = new InterestSignalsQueue();

// Public API
export function trackView(section: TrackingSection): void {
  queue.track({ type: 'view', section });
}

export function trackClick(category: string, meta?: Record<string, string | number>): void {
  queue.track({ type: 'click', category, meta });
}

export function trackDwell(section: string, ms: number): void {
  queue.track({ 
    type: 'dwell', 
    section: section as TrackingSection, 
    meta: { duration_ms: ms } 
  });
}

export function trackFavorite(entity: FavoriteEntity): void {
  queue.track({ 
    type: 'favorite', 
    category: entity.type, 
    meta: { entity_id: entity.id } 
  });
}

// Diagnostic exports
export const diagnostics = {
  queueSize: () => queue.queueSize(),
  flushNow: () => queue.flushNow(),
  sessionId: () => queue['sessionId']
};

// Global diagnostic helper (only in debug mode)
if (typeof window !== 'undefined' && import.meta.env.VITE_DIAG === '1') {
  (window as any).__M1_SIG__ = diagnostics;
}