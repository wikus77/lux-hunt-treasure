// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface PulseState {
  value: number;
  updated_at: string;
}

type PulseCallback = (pulse: PulseState) => void;

class PulseClient {
  private subscribers: Set<PulseCallback> = new Set();
  private channel: any = null;
  private currentValue: number = 0;
  private pollInterval: NodeJS.Timeout | null = null;

  async init() {
    // Try realtime subscription first
    try {
      this.channel = supabase
        .channel('pulse_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'pulse_state',
          },
          (payload) => {
            const newState: PulseState = {
              value: payload.new.value,
              updated_at: payload.new.updated_at,
            };
            this.currentValue = newState.value;
            this.notifySubscribers(newState);
          }
        )
        .subscribe();

      console.log('✅ Pulse realtime channel subscribed');
    } catch (error) {
      console.warn('⚠️ Pulse realtime failed, using polling fallback', error);
      this.startPolling();
    }

    // Initial fetch
    await this.fetchCurrent();
  }

  private async fetchCurrent(): Promise<PulseState | null> {
    try {
      const { data, error } = await supabase
        .from('pulse_state')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      const state: PulseState = {
        value: data.value,
        updated_at: data.updated_at,
      };
      
      this.currentValue = state.value;
      this.notifySubscribers(state);
      return state;
    } catch (error) {
      console.error('❌ Failed to fetch pulse state:', error);
      return null;
    }
  }

  private startPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(() => {
      this.fetchCurrent();
    }, 30000); // Poll every 30s
  }

  private notifySubscribers(state: PulseState) {
    this.subscribers.forEach((callback) => callback(state));
  }

  subscribe(callback: PulseCallback): () => void {
    this.subscribers.add(callback);
    
    // Immediately call with current value if available
    if (this.currentValue > 0) {
      callback({ value: this.currentValue, updated_at: new Date().toISOString() });
    }
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getPulse(): number {
    return this.currentValue;
  }

  // Optimistic UI nudge (client-side only, no DB write)
  optimisticNudge(delta: number = 1) {
    const newValue = Math.min(100, Math.max(0, this.currentValue + delta));
    this.notifySubscribers({
      value: newValue,
      updated_at: new Date().toISOString(),
    });
    
    // Revert after 2s if no real update comes
    setTimeout(() => {
      this.fetchCurrent();
    }, 2000);
  }

  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.subscribers.clear();
  }
}

export const pulseClient = new PulseClient();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
