// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Agent Context - Retrieve and cache agent info

import { supabase } from '@/integrations/supabase/client';

export interface AgentContextData {
  agentCode: string;
  displayName: string;
  xp: number;
  locale: string;
  timezone: string;
  cluesCount: number;
}

let cachedContext: AgentContextData | null = null;

export async function getAgentContext(): Promise<AgentContextData> {
  // Return cached if available
  if (cachedContext) return cachedContext;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        agentCode: 'AG-GUEST',
        displayName: 'Guest Agent',
        xp: 0,
        locale: 'it',
        timezone: 'Europe/Rome',
        cluesCount: 0
      };
    }

    // Try to get agent_code from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('agent_code, full_name')
      .eq('id', user.id)
      .single();

    // Fallback to app_metadata if no profile
    const agentCode = profile?.agent_code 
      || user.app_metadata?.agent_code 
      || `AG-${user.id.slice(0, 6).toUpperCase()}`;

    const displayName = profile?.full_name 
      || user.user_metadata?.name 
      || 'Agent';

    // Get clues count (non-blocking)
    let cluesCount = 0;
    try {
      const { count } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      cluesCount = count || 0;
    } catch {
      // Silent fail on clues count
    }

    cachedContext = {
      agentCode,
      displayName,
      xp: 0, // Can be extended later
      locale: user.user_metadata?.locale || 'it',
      timezone: user.user_metadata?.timezone || 'Europe/Rome',
      cluesCount
    };

    return cachedContext;
  } catch (error) {
    console.error('[AgentContext] Error:', error);
    return {
      agentCode: 'AG-ERROR',
      displayName: 'Agent',
      xp: 0,
      locale: 'it',
      timezone: 'Europe/Rome',
      cluesCount: 0
    };
  }
}

export function clearContextCache() {
  cachedContext = null;
}
