// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Context Builder - Agent-aware state

import { supabase } from '@/integrations/supabase/client';

export interface IntelContext {
  agentCode: string;
  week: number;
  userClues: Array<{ 
    id: string; 
    title: string; 
    text: string; 
    created_at: string 
  }>;
  totals: { 
    found: number; 
    today: number; 
    premium: number 
  };
  locationApprox?: string;
}

/**
 * Build intelligence context from current user state (read-only)
 */
export async function buildContext(): Promise<IntelContext> {
  try {
    // Get current user and agent code
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        agentCode: 'AG-GUEST',
        week: 1,
        userClues: [],
        totals: { found: 0, today: 0, premium: 0 }
      };
    }

    // Get agent code from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', user.id)
      .single();

    const agentCode = profile?.agent_code || 'AG-UNKNOWN';

    // Try view first, fallback to direct query
    let userClues: any[] = [];
    
    const { data: viewData, error: viewError } = await supabase
      .from('v_user_intel_clues')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!viewError && viewData) {
      userClues = viewData.map(c => ({
        id: c.id,
        title: c.title,
        text: c.description || '',
        created_at: c.created_at
      }));
    }

    // Calculate current week (approx)
    const gameStart = new Date('2025-01-20');
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - gameStart.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.max(1, Math.ceil(daysDiff / 7));

    // Calculate totals
    const today = new Date().toISOString().split('T')[0];
    const todayClues = userClues.filter(c => 
      c.created_at.startsWith(today)
    ).length;

    return {
      agentCode,
      week: Math.min(week, 4), // Cap at 4 weeks cycle
      userClues,
      totals: {
        found: userClues.length,
        today: todayClues,
        premium: 0 // Not tracking premium status here
      }
    };
  } catch (error) {
    console.error('Failed to build intel context:', error);
    return {
      agentCode: 'AG-ERROR',
      week: 1,
      userClues: [],
      totals: { found: 0, today: 0, premium: 0 }
    };
  }
}
