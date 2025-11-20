// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Context Builder - Extends NorahContext with AI Gateway features

import { supabase } from '@/integrations/supabase/client';
import { EnhancedContext } from '@/types/ai-gateway.types';

export async function buildEnhancedContext(
  userId: string,
  options?: {
    route?: string;
    geo?: { lat: number; lng: number };
    locale?: string;
    device?: string;
  }
): Promise<EnhancedContext> {
  try {
    // Get base user state via edge function
    const { data: userState } = await supabase.functions.invoke('get-user-state', {
      body: { userId }
    });

    // Get recent messages from norah_messages (optional table)
    let recentMessages = null;
    try {
      const { data } = await supabase
        .from('norah_messages')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      recentMessages = data;
    } catch (err) {
      // Table might not exist, continue without messages
      console.warn('[Enhanced Context] norah_messages not available:', err);
    }

    // Get recent final shots
    const { data: recentShots } = await supabase
      .from('agent_finalshot_attempts')
      .select('created_at, result')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const mappedShots = (recentShots || []).map(shot => ({
      createdAt: shot.created_at,
      result: shot.result
    }));

    // Build enhanced context
    const context: EnhancedContext = {
      userId,
      agentCode: userState?.agentCode || null,
      tier: userState?.tier || 'free',
      cluesFound: userState?.cluesFound || 0,
      buzzCount: userState?.buzzAvailable || 0,
      mapGenerated: false, // TODO: query from user state
      locale: options?.locale || 'it',
      route: options?.route,
      device: options?.device,
      geo: options?.geo,
      recentMessages: (recentMessages || []).reverse(),
      recentFinalShots: mappedShots,
      unreadNotifications: userState?.unreadNotifications || 0
    };

    return context;
  } catch (error) {
    console.error('[Enhanced Context Builder] Error:', error);
    
    // Fallback minimal context
    return {
      userId,
      agentCode: null,
      tier: 'free',
      cluesFound: 0,
      buzzCount: 0,
      mapGenerated: false,
      locale: options?.locale || 'it',
      recentMessages: []
    };
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
