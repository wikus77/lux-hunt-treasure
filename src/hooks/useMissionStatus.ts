// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook per gestire lo stato della missione da database
// @ts-nocheck

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface MissionStatus {
  id: string;
  title: string;
  state: "ATTIVA" | "COMPLETATA" | "SCADUTA";
  startDate: Date;
  daysRemaining: number;
  totalDays: number;
  cluesFound: number;
  totalClues: number;
  progressPercent: number;
}

export const useMissionStatus = () => {
  const [missionStatus, setMissionStatus] = useState<MissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadMissionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🔥 FIXED: Read from current_mission_data (the actual mission config table)
      // This is where the admin panel saves mission configurations
      const { data: activeMissionData, error: missionFetchError } = await supabase
        .from('current_mission_data')
        .select('id, mission_name, mission_status, mission_started_at, mission_ends_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Silently handle expected errors (no rows, table issues)
      if (missionFetchError && 
          missionFetchError.code !== 'PGRST116' && 
          missionFetchError.code !== '406' &&
          missionFetchError.code !== '42P01') {
        console.error('Error loading active mission:', missionFetchError);
      }

      const missionId = activeMissionData?.id || "M001";
      const missionTitle = activeMissionData?.mission_name || "MISSIONE IN CORSO";

      // 🔥 CRITICAL FIX: Get REAL clues count from MULTIPLE sources
      // Source 1: user_clues table (official clues)
      const { count: userCluesCount, error: cluesError } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (cluesError) {
        console.error('❌ Error loading user_clues count:', cluesError);
      }

      // Source 2: user_notifications with type='buzz' (BUZZ clues)
      const { count: buzzNotificationsCount, error: notifError } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'buzz');

      if (notifError) {
        console.error('❌ Error loading buzz notifications count:', notifError);
      }

      // Source 3: buzz_map_actions (BUZZ MAP clues - count by clue_count)
      const { data: buzzMapActions, error: buzzMapError } = await supabase
        .from('buzz_map_actions')
        .select('clue_count')
        .eq('user_id', user.id);

      if (buzzMapError) {
        console.error('❌ Error loading buzz_map_actions:', buzzMapError);
      }

      const buzzMapCluesCount = buzzMapActions?.reduce((sum, a) => sum + (a.clue_count || 0), 0) || 0;

      // 🎯 USE THE HIGHEST COUNT as the real count (to avoid undercounting)
      const realCluesCount = Math.max(
        userCluesCount || 0,
        buzzNotificationsCount || 0,
        buzzMapCluesCount
      );

      console.log('📊 [useMissionStatus] CLUE COUNTS FROM ALL SOURCES:', {
        user_clues: userCluesCount || 0,
        buzz_notifications: buzzNotificationsCount || 0,
        buzz_map_actions: buzzMapCluesCount,
        USING_MAX: realCluesCount
      });

      const actualProgress = Math.round((realCluesCount / 250) * 100);

      console.log('🔥 REAL CLUES COUNT FROM DATABASE:', {
        realCluesCount: realCluesCount,
        actualProgress: actualProgress,
        timestamp: new Date().toISOString()
      });

      // Fetch user mission status from database
      const { data: userMissionData, error: missionError } = await supabase
        .from('user_mission_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (missionError && missionError.code !== 'PGRST116') { // Ignore "no rows returned" error
        console.error('Error loading mission status:', missionError);
        setError('Errore nel caricamento dello stato missione');
        return;
      }

      // If no mission status exists, create one with current date
      if (!userMissionData) {
        const { data: newMissionData, error: insertError } = await supabase
          .from('user_mission_status')
          .insert({
            user_id: user.id,
            clues_found: 0,
            mission_progress_percent: 0,
            mission_started_at: new Date().toISOString(),
            mission_days_remaining: 30,
            buzz_counter: 0,
            map_radius_km: null,
            map_area_generated: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating mission status:', insertError);
          setError('Errore nella creazione dello stato missione');
          return;
        }

        // Use the newly created data
        const missionStart = new Date(newMissionData.mission_started_at);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 30 - daysPassed);

        // 🔥 AUTO-UPDATE mission status with real clues count
        const { error: updateError } = await supabase
          .from('user_mission_status')
          .update({
            clues_found: realCluesCount,
            mission_progress_percent: actualProgress
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('❌ Error updating mission status:', updateError);
        }

        setMissionStatus({
          id: missionId,
          title: missionTitle,
          state: daysRemaining > 0 ? "ATTIVA" : "SCADUTA",
          startDate: missionStart,
          daysRemaining: daysRemaining,
          totalDays: 30,
          cluesFound: realCluesCount,
          totalClues: 250,
          progressPercent: actualProgress
        });
      } else {
        // Calculate remaining days based on mission_started_at
        const missionStart = new Date(userMissionData.mission_started_at);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 30 - daysPassed);

        // 🔥 AUTO-UPDATE mission status with real clues count
        if ((userMissionData.clues_found || 0) !== realCluesCount) {
          const { error: updateError } = await supabase
            .from('user_mission_status')
            .update({
              clues_found: realCluesCount,
              mission_progress_percent: actualProgress
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('❌ Error updating mission status:', updateError);
          }
        }

        setMissionStatus({
          id: missionId,
          title: missionTitle,
          state: daysRemaining > 0 ? "ATTIVA" : "SCADUTA",
          startDate: missionStart,
          daysRemaining: daysRemaining,
          totalDays: 30,
          cluesFound: realCluesCount,
          totalClues: 250,
          progressPercent: actualProgress
        });
      }

    } catch (err) {
      console.error('Error in loadMissionStatus:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    loadMissionStatus();

    // Set up real-time subscription for ALL clue-related tables
    const subscription = supabase
      .channel('mission_status_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_clues',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 user_clues changed, reloading mission status...');
          loadMissionStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Only reload for buzz notifications
          if ((payload.new as any)?.type === 'buzz' || (payload.old as any)?.type === 'buzz') {
            console.log('🔄 BUZZ notification changed, reloading mission status...');
            loadMissionStatus();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buzz_map_actions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 buzz_map_actions changed, reloading mission status...');
          loadMissionStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mission_status',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 Mission status changed, reloading...');
          loadMissionStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Update mission status every minute to keep countdown accurate
  useEffect(() => {
    if (!missionStatus) return;

    const interval = setInterval(() => {
      const missionStart = missionStatus.startDate;
      const now = new Date();
      const daysPassed = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - daysPassed);

      if (daysRemaining !== missionStatus.daysRemaining) {
        setMissionStatus(prev => prev ? {
          ...prev,
          daysRemaining: daysRemaining,
          state: daysRemaining > 0 ? "ATTIVA" : "SCADUTA"
        } : null);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [missionStatus]);

  return {
    missionStatus,
    loading,
    error,
    reload: loadMissionStatus
  };
};
