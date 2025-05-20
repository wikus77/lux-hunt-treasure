
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { adaptToClue } from '@/utils/adaptToClue';
import { Clue } from '@/types/Clue';

// Define the structure of clue data from the database
interface DbClue {
  id: string;
  location_label: string;
  week: number;
  title_it: string;
  title_en: string | null;
  title_fr: string | null;
  description_it: string;
  description_en: string | null;
  description_fr: string | null;
  region_hint_it?: string | null;
  region_hint_en?: string | null;
  region_hint_fr?: string | null;
  city_hint_it?: string | null;
  city_hint_en?: string | null;
  city_hint_fr?: string | null;
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

interface UserClue {
  clue_id: string;
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
        .select('clue_id')
        .eq('user_id', userSession.session.user.id)
        .order('created_at', { ascending: false });
      
      if (userClueError) {
        throw new Error(`Error fetching user clues: ${userClueError.message}`);
      }
      
      if (!userClueData || userClueData.length === 0) {
        setClues([]);
        setLoading(false);
        return;
      }
      
      // Type-safe filtering of valid clue IDs
      const validUserClues = userClueData.filter(
        (uc): uc is UserClue => uc && typeof uc === 'object' && 'clue_id' in uc
      );
      
      const clueIds: string[] = validUserClues.map(uc => uc.clue_id);
      
      if (clueIds.length === 0) {
        setClues([]);
        setLoading(false);
        return;
      }
      
      // Get the actual clue details
      const { data: clueData, error: clueError } = await supabase
        .from('clues')
        .select('*')
        .in('id', clueIds);
      
      if (clueError) {
        throw new Error(`Error fetching clue details: ${clueError.message}`);
      }
      
      // Transform the clues based on user's language
      // Use explicit type for the database result
      const formattedClues: ClueData[] = (clueData as unknown as DbClue[])
        .map((dbClue: DbClue): ClueData => ({
          id: dbClue.id,
          title: dbClue[`title_${language}` as keyof DbClue] as string || dbClue.title_it || '',
          description: dbClue[`description_${language}` as keyof DbClue] as string || dbClue.description_it || '',
          region_hint: dbClue[`region_hint_${language}` as keyof DbClue] as string | undefined || dbClue.region_hint_it || undefined,
          city_hint: dbClue[`city_hint_${language}` as keyof DbClue] as string | undefined || dbClue.city_hint_it || undefined,
          location: {
            lat: dbClue.lat,
            lng: dbClue.lng,
            label: dbClue.location_label
          },
          week: dbClue.week,
          is_final_week: dbClue.is_final_week
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
      
      // Type-safe handling for received clue IDs
      const validUserClues = Array.isArray(userClueData) 
        ? userClueData.filter((uc): uc is UserClue => 
            uc && typeof uc === 'object' && 'clue_id' in uc)
        : [];
      
      const receivedClueIds: string[] = validUserClues.map(uc => uc.clue_id);
      
      // Get a buzz clue that the user hasn't received yet
      let buzzClueData: DbClue | null = null;
      
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
        
        buzzClueData = fallbackClue as unknown as DbClue;
      } else {
        buzzClueData = buzzClue as unknown as DbClue;
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
      const clueTitle = buzzClueData[`title_${language}` as keyof DbClue] as string || buzzClueData.title_it || '';
      const clueDescription = buzzClueData[`description_${language}` as keyof DbClue] as string || buzzClueData.description_it || '';
      
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
