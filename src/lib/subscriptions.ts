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
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export async function getActiveSubscription(supabase: any, userId: string): Promise<ActiveSubscriptionResult> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id,tier,status,created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[subs] getActiveSubscription error', error); // log diagnostico
    return { hasActive: false, plan: null as null | string };
  }
  return { hasActive: !!data, plan: (data?.tier ?? null) as null | string };
}

/**
 * Helper per verificare solo se ha un abbonamento attivo (compatibilità)
 */
export async function hasActiveSubscription(supabase: any, userId?: string): Promise<boolean> {
  const result = await getActiveSubscription(supabase, userId);
  return result.hasActive;
}