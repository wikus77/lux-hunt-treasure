// © 2025 Joseph MULÉ – M1SSION™ – Push Center Subscriptions Tab
// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WebPushRow {
  id: string;
  user_id: string;
  endpoint: string;
  platform: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  token: string | null;
}

interface Subscription {
  id: string;
  user_id: string;
  endpoint: string;
  platform: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('webpush_subscriptions')
        .select('id, user_id, endpoint, platform, is_active, created_at, updated_at, token')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const rows = (data || []) as WebPushRow[];
      const mapped: Subscription[] = rows.map(r => ({
        id: r.id,
        user_id: r.user_id,
        endpoint: r.endpoint,
        platform: r.platform,
        is_active: r.is_active,
        created_at: r.created_at,
        updated_at: r.updated_at
      }));

      setSubscriptions(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Latest Subscriptions ({subscriptions.length})
        </h3>
        <Button onClick={fetchSubscriptions} size="sm" variant="outline" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-auto max-h-[500px] border border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 sticky top-0">
            <tr>
              <th className="text-left p-3 text-gray-400 font-medium">Created</th>
              <th className="text-left p-3 text-gray-400 font-medium">User ID</th>
              <th className="text-left p-3 text-gray-400 font-medium">Platform</th>
              <th className="text-left p-3 text-gray-400 font-medium">Endpoint</th>
              <th className="text-left p-3 text-gray-400 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="p-3 text-gray-300">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-gray-300 font-mono text-xs">
                  {sub.user_id.slice(0, 8)}...
                </td>
                <td className="p-3 text-gray-300 text-xs">
                  {sub.platform}
                </td>
                <td className="p-3 text-gray-400 font-mono text-xs truncate max-w-xs">
                  ...{sub.endpoint.slice(-30)}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    sub.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
