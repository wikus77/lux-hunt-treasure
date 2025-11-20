// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyEvent {
  id: string;
  type: 'memory_hack' | 'daily_spin' | 'xp_bonus' | 'badge_unlock';
  title: string;
  description: string;
  isActive: boolean;
  triggerCondition: string;
  weekNumber: number;
  probability: number;
}

export class WeeklyEventsManager {
  private static events: WeeklyEvent[] = [
    {
      id: 'memory_hack_challenge',
      type: 'memory_hack',
      title: 'Sfida Memory Hack',
      description: 'Completa il gioco Memory Hack per sbloccare bonus XP',
      isActive: true,
      triggerCondition: 'random_weekly',
      weekNumber: 1,
      probability: 0.3
    },
    {
      id: 'daily_spin_bonus',
      type: 'daily_spin',
      title: 'Ruota della Fortuna Bonus',
      description: 'Doppi premi dalla ruota quotidiana',
      isActive: true,
      triggerCondition: 'daily_login',
      weekNumber: 2,
      probability: 0.25
    },
    {
      id: 'xp_multiplier',
      type: 'xp_bonus',
      title: 'Moltiplicatore XP x2',
      description: 'Doppi punti esperienza per le prossime 2 ore',
      isActive: true,
      triggerCondition: 'buzz_action',
      weekNumber: 3,
      probability: 0.2
    },
    {
      id: 'surprise_badge',
      type: 'badge_unlock',
      title: 'Badge Sorpresa',
      description: 'Sblocca un badge esclusivo settimanale',
      isActive: true,
      triggerCondition: 'mission_complete',
      weekNumber: 4,
      probability: 0.15
    }
  ];

  static getCurrentWeek(): number {
    const startDate = new Date('2025-01-20'); // M1SSION™ start date
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return ((diffWeeks - 1) % 4) + 1; // Cycle 1-4
  }

  static getActiveEventsForWeek(weekNumber: number): WeeklyEvent[] {
    return this.events.filter(event => 
      event.isActive && event.weekNumber === weekNumber
    );
  }

  static shouldTriggerRandomEvent(eventType: string): boolean {
    const currentWeek = this.getCurrentWeek();
    const event = this.events.find(e => e.type === eventType && e.weekNumber === currentWeek);
    
    if (!event) return false;
    
    return Math.random() < event.probability;
  }

  static async triggerEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const event = this.events.find(e => e.id === eventId);
      if (!event) return false;

      // Log event trigger to user_logs table for now
      const { error } = await supabase
        .from('user_logs')
        .insert({
          user_id: userId,
          action: 'weekly_event_triggered',
          details: {
            event_id: eventId,
            event_type: event.type,
            week_number: this.getCurrentWeek(),
            triggered_at: new Date().toISOString()
          }
        });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  static async getEventHistory(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('user_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'weekly_event_triggered')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Debug method to force trigger events (for testing)
  static forceDebugEvent(eventId: string, userId: string): Promise<boolean> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Debug events only available in development');
      return Promise.resolve(false);
    }
    
    return this.triggerEvent(eventId, userId);
  }

  // Get all available events for admin/debug purposes
  static getAllEvents(): WeeklyEvent[] {
    return [...this.events];
  }

  // Check if user has triggered specific event this week
  static async hasTriggeredEventThisWeek(userId: string, eventId: string): Promise<boolean> {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      
      const { data, error } = await supabase
        .from('user_logs')
        .select('id, details')
        .eq('user_id', userId)
        .eq('action', 'weekly_event_triggered')
        .gte('created_at', weekStart.toISOString())
        .limit(1);

      if (error) {
        return false;
      }

      // Check if any of the logs match our event_id
      return data?.some(log => 
        log.details && 
        typeof log.details === 'object' && 
        'event_id' in log.details && 
        log.details.event_id === eventId
      ) || false;
    } catch (error) {
      return false;
    }
  }
}

export default WeeklyEventsManager;