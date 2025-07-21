// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook per gestire lo stato della missione da database

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

        setMissionStatus({
          id: "M001",
          title: "Caccia al Tesoro Urbano",
          state: daysRemaining > 0 ? "ATTIVA" : "SCADUTA",
          startDate: missionStart,
          daysRemaining: daysRemaining,
          totalDays: 30,
          cluesFound: newMissionData.clues_found || 0,
          totalClues: 200,
          progressPercent: newMissionData.mission_progress_percent || 0
        });
      } else {
        // Calculate remaining days based on mission_started_at
        const missionStart = new Date(userMissionData.mission_started_at);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 30 - daysPassed);

        setMissionStatus({
          id: "M001",
          title: "Caccia al Tesoro Urbano",
          state: daysRemaining > 0 ? "ATTIVA" : "SCADUTA",
          startDate: missionStart,
          daysRemaining: daysRemaining,
          totalDays: 30,
          cluesFound: userMissionData.clues_found || 0,
          totalClues: 200,
          progressPercent: userMissionData.mission_progress_percent || 0
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

    // Set up real-time subscription
    const subscription = supabase
      .channel('user_mission_status_changes')
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
