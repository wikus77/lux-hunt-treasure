// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Agent Context V2 - Enhanced with views and better caching
// @ts-nocheck

import { supabase } from '@/integrations/supabase/client';

export interface AgentContextData {
  agentCode: string;
  displayName: string;
  xp: number;
  locale: string;
  timezone: string;
  cluesCount: number;
  planType?: string;
  currentWeek?: number;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Cache management
let cachedContext: AgentContextData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return cachedContext !== null && (Date.now() - cacheTimestamp) < CACHE_TTL_MS;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Main context fetcher with view support
export async function getAgentContext(forceRefresh = false): Promise<AgentContextData> {
  // Return cached if valid and not forcing refresh
  if (!forceRefresh && isCacheValid() && cachedContext) {
    return cachedContext;
  }

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

    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // Try to get from new view first (if available)
    let agentCode = 'AG-UNKNOWN';
    let displayName = 'Agent';
    let planType = 'base';
    let currentWeek = 1;
    
    try {
      const { data: viewProfile } = await supabase
        .from('v_agent_profile')
        .select('agent_code, display_name, plan_type')
        .maybeSingle();
      
      if (viewProfile) {
        agentCode = viewProfile.agent_code || agentCode;
        displayName = viewProfile.display_name || displayName;
        planType = viewProfile.plan_type || planType;
      }
      
      const { data: viewStatus } = await supabase
        .from('v_agent_status')
        .select('current_week')
        .maybeSingle();
      
      if (viewStatus) {
        currentWeek = viewStatus.current_week || currentWeek;
      }
    } catch (viewErr) {
      // View might not exist yet, fallback to direct table query
      console.warn('[AgentContext] View not available, using fallback');
    }

    // Fallback to profiles table if view failed
    if (agentCode === 'AG-UNKNOWN') {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('agent_code, full_name, subscription_plan')
          .eq('id', user.id)
          .maybeSingle();

        agentCode = profile?.agent_code 
          || user.app_metadata?.agent_code 
          || `AG-${user.id.slice(0, 6).toUpperCase()}`;

        displayName = profile?.full_name 
          || user.user_metadata?.name 
          || 'Agent';
        
        planType = profile?.subscription_plan || 'base';
      } catch (profileErr) {
        console.error('[AgentContext] Profile fetch failed:', profileErr);
      }
    }

    // Get clues count (non-blocking, with timeout)
    let cluesCount = 0;
    try {
      const { count } = await Promise.race([
        supabase
          .from('user_clues')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
      cluesCount = count || 0;
    } catch {
      // Silent fail on clues count - not critical
    }

    // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
    // Build and cache context
    cachedContext = {
      agentCode,
      displayName,
      xp: 0,
      locale: user.user_metadata?.locale || 'it',
      timezone: user.user_metadata?.timezone || 'Europe/Rome',
      cluesCount,
      planType,
      currentWeek
    };
    
    cacheTimestamp = Date.now();
    return cachedContext;
    
  } catch (error) {
    console.error('[AgentContext] Critical error:', error);
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

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Cache management functions
export function clearContextCache() {
  cachedContext = null;
  cacheTimestamp = 0;
}

export function refreshContext(): Promise<AgentContextData> {
  return getAgentContext(true);
}
