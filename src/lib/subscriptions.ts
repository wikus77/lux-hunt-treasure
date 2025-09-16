// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Subscription management utilities - ZERO fallback to "Titanium"

export interface ActiveSubscriptionResult {
  hasActive: boolean;
  plan: string | null;
}

/**
 * Determina se l'utente ha un abbonamento attivo e quale piano
 * NON usa fallback hardcoded - se non c'è plan attivo ritorna null
 */
export async function getActiveSubscription(supabase: any, userId?: string): Promise<ActiveSubscriptionResult> {
  if (!userId) {
    return { hasActive: false, plan: null };
  }

  try {
    // Query abbonamenti attivi (status='active' OR is_active=true)
    // Nota: plan_tier non esiste nel DB, usiamo solo tier e plan
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, status, tier, is_active, created_at')
      .eq('user_id', userId)
      .or('status.eq.active,is_active.eq.true')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('[getActiveSubscription] Error:', error);
      return { hasActive: false, plan: null };
    }

    if (!data) {
      return { hasActive: false, plan: null };
    }

    // Estrai il nome del piano (tier)
    const planName = data.tier || null;
    
    return {
      hasActive: true,
      plan: planName
    };
  } catch (error) {
    console.error('[getActiveSubscription] Exception:', error);
    return { hasActive: false, plan: null };
  }
}

/**
 * Helper per verificare solo se ha un abbonamento attivo (compatibilità)
 */
export async function hasActiveSubscription(supabase: any, userId?: string): Promise<boolean> {
  const result = await getActiveSubscription(supabase, userId);
  return result.hasActive;
}