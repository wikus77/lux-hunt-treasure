// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Context Engine - Real-time game state observer

import { supabase } from '@/integrations/supabase/client';
import type { NorahContext, NorahClue, NorahMission, NorahStats, NorahPlan } from './schema';
import { getAgentContext } from '../ai/context/agentContext';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Load complete Norah context from Supabase (READ-ONLY, RLS protected)
export async function loadNorahContext(): Promise<NorahContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return getEmptyContext();
    }

    // Get agent context (includes agentCode, displayName, plan, etc.)
    const agentCtx = await getAgentContext();

    // Parallel queries for efficiency
    const [notifResult] = await Promise.all([
      // Recent notifications for clue and buzz count
      supabase
        .from('user_notifications')
        .select('type, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
    ]);

    // Map notifications to clues format
    const clues: NorahClue[] = (notifResult.data || [])
      .filter(n => n.type === 'clue' || n.type === 'intel_clue')
      .map(c => ({
        id: crypto.randomUUID(),
        text: c.title || '',
        tag: undefined,
        created_at: c.created_at
      }));

    // Count buzz today
    const buzzToday = (notifResult.data || []).filter(n => {
      const isToday = new Date(n.created_at).toDateString() === new Date().toDateString();
      return isToday && (n.type === 'buzz' || n.type === 'buzz_free');
    }).length;

    // Build stats
    const stats: NorahStats = {
      cluesTotal: clues.length,
      recentCount: clues.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      buzzToday
    };

    // Mission info (from agent context)
    const mission: NorahMission | null = agentCtx.currentWeek 
      ? { id: 'current', name: 'M1SSION', week: agentCtx.currentWeek }
      : null;

    // Plan info
    const plan: NorahPlan | null = agentCtx.planType 
      ? { tier: agentCtx.planType as any }
      : null;

    return {
      agentCode: agentCtx.agentCode,
      displayName: agentCtx.displayName,
      mission,
      clues,
      stats,
      plan,
      updatedAt: Date.now()
    };

  } catch (error) {
    console.error('[NorahContext] Failed to load:', error);
    return getEmptyContext();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Subscribe to real-time updates
export function subscribeNorahRealtime(
  onUpdate: (ctx: NorahContext) => void
): () => void {
  const channels: any[] = [];

  try {
    // Subscribe to user_clues changes
    const cluesChannel = supabase
      .channel('norah-clues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_clues'
        },
        async () => {
          // Reload full context on any change
          const newCtx = await loadNorahContext();
          onUpdate(newCtx);
        }
      )
      .subscribe();

    channels.push(cluesChannel);

    // Subscribe to user_notifications for buzz updates
    const notifChannel = supabase
      .channel('norah-notifs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications'
        },
        async () => {
          const newCtx = await loadNorahContext();
          onUpdate(newCtx);
        }
      )
      .subscribe();

    channels.push(notifChannel);

  } catch (error) {
    console.error('[NorahContext] Realtime subscription failed:', error);
  }

  // Cleanup function
  return () => {
    channels.forEach(ch => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        console.warn('[NorahContext] Channel cleanup error:', e);
      }
    });
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
function getEmptyContext(): NorahContext {
  return {
    agentCode: 'AG-UNKNOWN',
    displayName: 'Agent',
    mission: null,
    clues: [],
    stats: { cluesTotal: 0, recentCount: 0, buzzToday: 0 },
    plan: null,
    updatedAt: Date.now()
  };
}
