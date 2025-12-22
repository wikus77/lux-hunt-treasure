// © 2025 Joseph MULÉ – M1SSION™
// @ts-nocheck
// 🔧 v4: Use global cached user to prevent auth request storms

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from "@supabase/supabase-js";

// 🔧 v4: Global cached user shared across all hook instances
let cachedUser: User | null = null;
let cachedUserTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

async function getCachedUser(): Promise<User | null> {
  const now = Date.now();
  if (cachedUser && (now - cachedUserTimestamp) < CACHE_TTL_MS) {
    return cachedUser;
  }
  try {
    const { data } = await supabase.auth.getUser();
    cachedUser = data?.user || null;
    cachedUserTimestamp = now;
    return cachedUser;
  } catch (err) {
    console.warn('⚠️ getCachedUser failed:', err);
    return cachedUser;
  }
}

interface BuzzGrant {
  id: string;
  source: string;
  remaining: number;
  created_at: string;
}

export const useBuzzGrants = () => {
  const [grants, setGrants] = useState<BuzzGrant[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsed, setDailyUsed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // 🔧 v4: In-flight guard to prevent duplicate concurrent requests
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 2000; // Minimum 2s between fetches
  const mountedRef = useRef(true);

  // 🔧 v4: Get user ID once on mount using cached user
  useEffect(() => {
    mountedRef.current = true;
    const getUserId = async () => {
      const user = await getCachedUser();
      if (mountedRef.current && user?.id) {
        setUserId(user.id);
      }
    };
    getUserId();
    return () => { mountedRef.current = false; };
  }, []);

  const fetchGrants = useCallback(async () => {
    // 🔧 v3: Guard against concurrent/rapid fetches
    const now = Date.now();
    if (isFetchingRef.current) {
      console.log('⏸️ useBuzzGrants: fetch already in progress, skipping');
      return;
    }
    if (now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
      console.log('⏸️ useBuzzGrants: too soon since last fetch, skipping');
      return;
    }
    
    if (!userId) {
      console.log('⏸️ useBuzzGrants: no user ID yet, skipping fetch');
      setIsLoading(false);
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchRef.current = now;
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayBuzzUsage, error: buzzError } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (todayBuzzUsage && todayBuzzUsage.buzz_count > 0) {
        setDailyUsed(true);
      } else {
        setDailyUsed(false);
      }

      const { data, error } = await supabase
        .from('buzz_grants')
        .select('id, source, remaining, created_at')
        .eq('user_id', userId)
        .gt('remaining', 0)
        .order('created_at', { ascending: false })
        .limit(10); // 🔧 v3: Limit results

      if (error) throw error;

      setGrants(data || []);
      const total = (data || []).reduce((sum, grant) => sum + grant.remaining, 0);
      setTotalRemaining(total);
    } catch (err) {
      console.error('Error fetching buzz grants:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setGrants([]);
      setTotalRemaining(0);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  const consumeFreeBuzz = async (): Promise<boolean> => {
    if (totalRemaining <= 0) {
      console.log('❌ No free buzz grants remaining');
      return false;
    }

    if (!userId) {
      console.error('❌ No user ID found');
      return false;
    }
    
    try {

      // Find the first grant with remaining buzz
      const grantToUse = grants.find(g => g.remaining > 0);
      if (!grantToUse) {
        console.log('❌ No grant found with remaining buzz');
        return false;
      }

      console.log('🎁 CONSUMING FREE BUZZ GRANT:', grantToUse.id, 'Remaining:', grantToUse.remaining);

      const { error } = await supabase
        .from('buzz_grants')
        .update({ 
          remaining: grantToUse.remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', grantToUse.id);

      if (error) throw error;

      // 🔥 FIX: SAVE CLUE TO DATABASE - Generate clue_id as required
      const uniqueClue = `Cerca dove l'innovazione italiana splende (${new Date().toLocaleTimeString()}) - FREE BUZZ`;
      const clueId = `free_buzz_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log('💾 SAVING FREE BUZZ CLUE TO DATABASE');
      
      const { error: clueError } = await supabase
        .from('user_clues')
        .insert({
          user_id: userId,
          clue_id: clueId, // Required field!
          title_it: "🎁 Indizio BUZZ Gratuito",
          description_it: uniqueClue,
          clue_type: "buzz",
          buzz_cost: 0
        });

      if (clueError) {
        console.error('❌ Error saving free buzz clue:', clueError);
      } else {
        console.log('✅ FREE BUZZ CLUE SAVED TO DATABASE');
      }

      // SAVE NOTIFICATION TOO
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          type: 'buzz',
          title: '🎁 Nuovo Indizio BUZZ Gratuito!',
          message: uniqueClue,
          is_read: false,
          metadata: { free: true, source: 'buzz_grant' }
        });

      if (notifError) {
        console.error('❌ Error saving free buzz notification:', notifError);
      } else {
        console.log('✅ FREE BUZZ NOTIFICATION SAVED');
      }

      // 🔥 TRIGGER REALTIME UPDATE by also updating user_mission_status
      const { error: statusUpdateError } = await supabase
        .from('user_mission_status')
        .upsert({
          user_id: userId,
          clues_found: 1,
          mission_progress_percent: Math.round((1 / 250) * 100),
          updated_at: new Date().toISOString()
        });

      if (statusUpdateError) {
        console.error('❌ Error triggering mission status update:', statusUpdateError);
      } else {
        console.log('✅ MISSION STATUS UPDATE TRIGGERED');
      }

      // Mark daily usage immediately
      setDailyUsed(true);
      
      // Refresh grants after consumption (with delay to avoid request storm)
      setTimeout(() => fetchGrants(), 1000);
      return true;
    } catch (err) {
      console.error('Error consuming free buzz:', err);
      return false;
    }
  };

  // 🔧 v3: Depend on userId and fetchGrants callback
  useEffect(() => {
    if (userId) {
      fetchGrants();
    }
  }, [userId, fetchGrants]);

  return {
    grants,
    totalRemaining,
    isLoading,
    error,
    fetchGrants,
    consumeFreeBuzz,
    hasFreeBuzz: totalRemaining > 0 && !dailyUsed,
    dailyUsed
  };
};