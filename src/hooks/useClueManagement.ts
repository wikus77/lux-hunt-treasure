
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export interface Clue {
  id: string;
  location_label: string;
  week: number;
  title_it: string;
  title_en: string;
  title_fr: string;
  description_it: string;
  description_en: string;
  description_fr: string;
  region_hint_it?: string;
  region_hint_en?: string;
  region_hint_fr?: string;
  city_hint_it?: string;
  city_hint_en?: string;
  city_hint_fr?: string;
  is_final_week: boolean;
  lat: number;
  lng: number;
  created_at: string;
  type: string;
}

export interface ClueData {
  id: string;
  title: string;
  description: string;
  region_hint?: string;
  city_hint?: string;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
  week: number;
  is_final_week: boolean;
}

export const useClueManagement = (language: string = 'it') => {
  const [clues, setClues] = useState<ClueData[]>([]);
  const [activeClue, setActiveClue] = useState<ClueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Fetch all clues for the current user
  const fetchUserClues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: userSession } = await supabase.auth.getSession();
      
      if (!userSession.session) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      // Get all clue IDs that have been sent to this user
      const { data: userClueData, error: userClueError } = await supabase
        .from('user_clues')
        .select('clue_id, sent_at')
        .eq('user_id', userSession.session.user.id)
        .order('sent_at', { ascending: false });
      
      if (userClueError) {
        throw new Error(`Error fetching user clues: ${userClueError.message}`);
      }
      
      if (!userClueData || userClueData.length === 0) {
        setClues([]);
        setLoading(false);
        return;
      }
      
      // Get the actual clue details
      const clueIds = userClueData.map((uc: any) => uc.clue_id);
      const { data: clueData, error: clueError } = await supabase
        .from('clues')
        .select('*')
        .in('id', clueIds);
      
      if (clueError) {
        throw new Error(`Error fetching clue details: ${clueError.message}`);
      }
      
      // Transform the clues based on user's language
      const formattedClues: ClueData[] = clueData.map((clue: any) => ({
        id: clue.id,
        title: clue[`title_${language}`] || clue.title_it || clue.title || '',
        description: clue[`description_${language}`] || clue.description_it || clue.description || '',
        region_hint: clue[`region_hint_${language}`] || clue.region_hint_it || undefined,
        city_hint: clue[`city_hint_${language}`] || clue.city_hint_it || undefined,
        location: {
          lat: clue.lat,
          lng: clue.lng,
          label: clue.location_label
        },
        week: clue.week,
        is_final_week: clue.is_final_week
      }));
      
      setClues(formattedClues);
      
      // Set the most recent clue as active
      if (formattedClues.length > 0) {
        setActiveClue(formattedClues[0]);
      }
      
    } catch (err) {
      console.error('Error in useClueManagement:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [language]);
  
  // Receive a Buzz clue when a payment is completed
  const receiveBuzzClue = useCallback(async () => {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      
      if (!userSession.session) {
        throw new Error('User not authenticated');
      }
      
      // Determine user's current week based on existing clues
      const { data: userClueCount, error: countError } = await supabase
        .from('user_clues')
        .select('id', { count: 'exact' })
        .eq('user_id', userSession.session.user.id);
        
      if (countError) {
        throw new Error(`Error counting user clues: ${countError.message}`);
      }
      
      const weekNumber = Math.floor((userClueCount?.length || 0) / 7) + 1;
      
      // Get all clue IDs that have been sent to this user
      const { data: userClueData, error: userClueError } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', userSession.session.user.id);
      
      if (userClueError) {
        throw new Error(`Error fetching user clues: ${userClueError.message}`);
      }
      
      const receivedClueIds = userClueData?.map((uc: any) => uc.clue_id) || [];
      
      // Get a buzz clue that the user hasn't received yet
      let buzzClueData;
      
      const { data: buzzClue, error: buzzClueError } = await supabase
        .from('clues')
        .select('*')
        .eq('type', 'buzz')
        .eq('week', weekNumber)
        .not('id', 'in', receivedClueIds.length > 0 ? receivedClueIds : ['00000000-0000-0000-0000-000000000000'])
        .limit(1)
        .single();
      
      if (buzzClueError || !buzzClue) {
        // Fallback: get any regular clue the user hasn't received yet
        const { data: fallbackClue, error: fallbackError } = await supabase
          .from('clues')
          .select('*')
          .eq('week', weekNumber)
          .not('id', 'in', receivedClueIds.length > 0 ? receivedClueIds : ['00000000-0000-0000-0000-000000000000'])
          .limit(1)
          .single();
          
        if (fallbackError || !fallbackClue) {
          throw new Error('No available clues found');
        }
        
        buzzClueData = fallbackClue;
      } else {
        buzzClueData = buzzClue;
      }
      
      // Mark clue as sent to user
      await supabase
        .from('user_clues')
        .insert({
          user_id: userSession.session.user.id,
          clue_id: buzzClueData.id,
          delivery_type: 'buzz'
        });
      
      // Add notification
      const clueTitle = buzzClueData.title || buzzClueData[`title_${language}`] || '';
      const clueDescription = buzzClueData.description || buzzClueData[`description_${language}`] || '';
      
      addNotification({
        title: `🎯 ${clueTitle}`,
        description: clueDescription
      });
      
      toast.success('New clue received!', {
        description: 'Check your notifications to view your new clue.'
      });
      
      // Refresh clues list
      fetchUserClues();
      
    } catch (err) {
      console.error('Error in receiveBuzzClue:', err);
      toast.error('Error receiving clue', {
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  }, [fetchUserClues, language, addNotification]);

  useEffect(() => {
    fetchUserClues();
  }, [fetchUserClues]);

  return {
    clues,
    activeClue,
    setActiveClue,
    loading,
    error,
    fetchUserClues,
    receiveBuzzClue
  };
};
