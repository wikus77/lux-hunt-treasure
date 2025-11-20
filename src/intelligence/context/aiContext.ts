// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Intelligence Context Engine - Agent-aware state management

import { supabase } from '@/integrations/supabase/client';

export interface AgentContext {
  agentCode: string;
  displayName: string;
  level: number;
  xp: number;
  cluesCount: number;
  lastClueAt: string | null;
  week: number;
  restrictions: string[];
}

// Simple reactive store without external dependencies
type ContextListener = (ctx: AgentContext | null) => void;
const listeners: ContextListener[] = [];
let currentContext: AgentContext | null = null;

/**
 * Get current agent context from database or fallback to client data
 */
export async function getAgentContext(): Promise<AgentContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        agentCode: 'AG-GUEST',
        displayName: 'Guest',
        level: 1,
        xp: 0,
        cluesCount: 0,
        lastClueAt: null,
        week: 1,
        restrictions: []
      };
    }

    // Fallback to profiles + clues count (view may not exist yet)
    const { data: profile } = await supabase
      .from('profiles')
      .select('agent_code, full_name')
      .eq('id', user.id)
      .single();

    const { count } = await supabase
      .from('user_clues')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const week = calculateCurrentWeek();
    const context: AgentContext = {
      agentCode: profile?.agent_code || 'AG-0000',
      displayName: profile?.full_name || 'Agent',
      level: 1,
      xp: 0,
      cluesCount: count || 0,
      lastClueAt: null,
      week,
      restrictions: []
    };

    // Update stored context and notify listeners
    currentContext = context;
    listeners.forEach(listener => listener(context));
    
    return context;
    
  } catch (error) {
    console.error('Failed to fetch agent context:', error);
    return {
      agentCode: 'AG-ERROR',
      displayName: 'Agent',
      level: 1,
      xp: 0,
      cluesCount: 0,
      lastClueAt: null,
      week: 1,
      restrictions: []
    };
  }
}

/**
 * Calculate current mission week
 */
function calculateCurrentWeek(): number {
  const gameStart = new Date('2025-01-20');
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - gameStart.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.max(1, Math.ceil(daysDiff / 7));
  return Math.min(week, 4); // Cap at 4 weeks cycle
}

/**
 * Subscribe to context updates
 */
export function subscribeToContext(callback: ContextListener) {
  listeners.push(callback);
  // Immediately call with current value if available
  if (currentContext) {
    callback(currentContext);
  }
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Get current context value (sync)
 */
export function getCurrentContext(): AgentContext | null {
  return currentContext;
}

/**
 * Force refresh context
 */
export async function refreshContext(): Promise<AgentContext> {
  const ctx = await getAgentContext();
  currentContext = ctx;
  listeners.forEach(listener => listener(ctx));
  return ctx;
}
