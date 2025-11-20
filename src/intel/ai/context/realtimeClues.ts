// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Realtime Clues - Subscribe to user_notifications and user_clues
// @ts-nocheck

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClueItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  source: 'clue' | 'notification';
}

export function useRealtimeIntel() {
  const [clues, setClues] = useState<ClueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let notifChannel: any;
    let cluesChannel: any;
    
    const loadInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        // Get recent notifications (last 10 days)
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const { data: notifications } = await supabase
          .from('user_notifications')
          .select('id, title, message, created_at')
          .eq('user_id', user.id)
          .gte('created_at', tenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10) as any;

        // Filter by notification type
        const filteredNotifs = (notifications || []).filter(
          (n: any) => n.notification_type === 'buzz' || n.notification_type === 'buzz_free'
        );

        // Try to get user_clues if table exists
        let userClues: any[] = [];
        try {
          const { data: cluesData } = await supabase
            .from('user_clues')
            .select(`
              id,
              created_at,
              clues!inner(title, description)
            `)
            .eq('user_id', user.id)
            .gte('created_at', tenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);
          
          userClues = cluesData || [];
        } catch {
          // Table might not exist, ignore
        }

        // Combine and format
        const combined: ClueItem[] = [
          ...filteredNotifs.map((n: any) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            created_at: n.created_at,
            source: 'notification' as const
          })),
          ...userClues.map((uc: any) => ({
            id: uc.id,
            title: uc.clues.title,
            description: uc.clues.description,
            created_at: uc.created_at,
            source: 'clue' as const
          }))
        ];

        // Sort by date desc, limit to 10
        combined.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (mounted) {
          setClues(combined.slice(0, 10));
          setLoading(false);
        }

        // Subscribe to realtime updates
        notifChannel = supabase
          .channel('intel-notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              const newItem: ClueItem = {
                id: payload.new.id,
                title: payload.new.title,
                description: payload.new.message,
                created_at: payload.new.created_at,
                source: 'notification'
              };
              setClues(prev => [newItem, ...prev].slice(0, 10));
            }
          )
          .subscribe();

        // Try to subscribe to user_clues if exists
        try {
          cluesChannel = supabase
            .channel('intel-clues')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'user_clues',
                filter: `user_id=eq.${user.id}`
              },
              async (payload: any) => {
                // Fetch clue details
                const { data: clueData } = await supabase
                  .from('clues')
                  .select('title, description')
                  .eq('id', payload.new.clue_id)
                  .single();

                if (clueData) {
                  const newItem: ClueItem = {
                    id: payload.new.id,
                    title: clueData.title,
                    description: clueData.description,
                    created_at: payload.new.created_at,
                    source: 'clue'
                  };
                  setClues(prev => [newItem, ...prev].slice(0, 10));
                }
              }
            )
            .subscribe();
        } catch {
          // Table might not exist
        }
      } catch (error) {
        console.error('[RealtimeIntel] Load error:', error);
        if (mounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
      if (notifChannel) supabase.removeChannel(notifChannel);
      if (cluesChannel) supabase.removeChannel(cluesChannel);
    };
  }, []);

  return { clues, loading };
}
