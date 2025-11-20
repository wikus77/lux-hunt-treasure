// @ts-nocheck
/*
 * M1SSION™ Mirror Push Adapter - Zero-Risk Diagnostics
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { supabase } from '@/integrations/supabase/client';

export interface MirrorSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  provider: 'apple' | 'fcm' | 'unknown';
  platform?: string;
  keys_p256dh?: string;
  keys_auth?: string;
  device_info?: Record<string, any>;
  source_table: string;
  source_id: string;
  is_active: boolean;
  created_at: string;
}

export interface MismatchReport {
  user_id: string;
  current_endpoint?: string;
  current_provider?: string;
  mirror_endpoint?: string;
  mirror_provider?: string;
  mismatch_type: 'missing_in_current' | 'missing_in_mirror' | 'match' | 'provider_mismatch' | 'endpoint_mismatch';
}

export interface SyncStatus {
  source_table: string;
  last_synced_at: string;
  records_processed: number;
}

/**
 * Mirror Push Adapter - Read-only utilities for unified endpoint diagnostics
 * Does NOT modify production push flow
 */
export class MirrorPushAdapter {
  /**
   * Get unified subscriptions for a user from mirror system
   */
  static async getUserSubscriptions(userId: string): Promise<MirrorSubscription[]> {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT * FROM mirror_push.subscriptions 
              WHERE user_id = '${userId}' AND is_active = true 
              ORDER BY created_at DESC`
      });

    if (error) throw new Error(`Failed to fetch mirror subscriptions: ${error.message}`);
    return Array.isArray(data) ? data as unknown as MirrorSubscription[] : [];
  }

  /**
   * Get latest subscription per provider for a user
   */
  static async getLatestByProvider(userId: string): Promise<Record<string, MirrorSubscription>> {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT * FROM mirror_push.v_latest_unified WHERE user_id = '${userId}'`
      });

    if (error) throw new Error(`Failed to fetch latest by provider: ${error.message}`);
    
    const result: Record<string, MirrorSubscription> = {};
    if (Array.isArray(data)) {
      data.forEach((sub: any) => {
        result[sub.provider] = sub as MirrorSubscription;
      });
    }
    
    return result;
  }

  /**
   * Get mismatch report for specific user or all users
   */
  static async getMismatchReport(userId?: string): Promise<MismatchReport[]> {
    const sql = userId 
      ? `SELECT * FROM mirror_push.v_mismatch_report WHERE user_id = '${userId}' LIMIT 100`
      : `SELECT * FROM mirror_push.v_mismatch_report LIMIT 100`;

    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) throw new Error(`Failed to fetch mismatch report: ${error.message}`);
    return Array.isArray(data) ? data as unknown as MismatchReport[] : [];
  }

  /**
   * Get sync status for all source tables
   */
  static async getSyncStatus(): Promise<SyncStatus[]> {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT * FROM mirror_push.sync_watermarks ORDER BY last_synced_at DESC`
      });

    if (error) throw new Error(`Failed to fetch sync status: ${error.message}`);
    return Array.isArray(data) ? data as unknown as SyncStatus[] : [];
  }

  /**
   * Run backfill process (admin only)
   */
  static async runBackfill(): Promise<{ success: boolean; processed_count: number; timestamp: string }> {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT mirror_push.backfill_subscriptions() as result`
      });

    if (error) throw new Error(`Failed to run backfill: ${error.message}`);
    return data?.[0]?.result || { success: false, processed_count: 0, timestamp: new Date().toISOString() };
  }

  /**
   * Get provider distribution stats
   */
  static async getProviderStats(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT provider, COUNT(*) as count 
              FROM mirror_push.subscriptions 
              WHERE is_active = true 
              GROUP BY provider`
      });

    if (error) throw new Error(`Failed to fetch provider stats: ${error.message}`);
    
    const stats: Record<string, number> = {};
    if (Array.isArray(data)) {
      data.forEach(({ provider, count }: any) => {
        stats[provider] = parseInt(count);
      });
    }
    
    return stats;
  }

  /**
   * Simulate what-would-send for a user (diagnostic only)
   */
  static async simulateWhatWouldSend(userId: string): Promise<{
    current_system: string[];
    mirror_system: string[];
    would_match: boolean;
  }> {
    // Get current system tokens
    const { data: currentData } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get mirror system endpoints
    const mirrorSubs = await this.getLatestByProvider(userId);
    const mirrorEndpoints = Object.values(mirrorSubs).map(sub => sub.endpoint);

    const currentEndpoints = currentData ? [currentData.token] : [];
    
    return {
      current_system: currentEndpoints,
      mirror_system: mirrorEndpoints,
      would_match: currentEndpoints.length > 0 && 
                   mirrorEndpoints.some(ep => currentEndpoints.includes(ep))
    };
  }

  /**
   * Get comprehensive diagnostic report for a user
   */
  static async getDiagnosticReport(userId: string) {
    const [subscriptions, latestByProvider, mismatchReport, simulation] = await Promise.all([
      this.getUserSubscriptions(userId),
      this.getLatestByProvider(userId),
      this.getMismatchReport(userId),
      this.simulateWhatWouldSend(userId)
    ]);

    return {
      user_id: userId,
      total_subscriptions: subscriptions.length,
      active_providers: Object.keys(latestByProvider),
      latest_by_provider: latestByProvider,
      mismatch_report: mismatchReport[0] || null,
      simulation,
      raw_subscriptions: subscriptions
    };
  }
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */