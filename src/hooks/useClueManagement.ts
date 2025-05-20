
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { ClueData } from '@/types/clueTypes';
import { 
  fetchUserCluesFromApi, 
  fetchAvailableBuzzClue, 
  fetchUserClueIds, 
  getCurrentUserWeek,
  addClueToUser
} from '@/services/clueService';
import { formatClueForDisplay } from '@/utils/clueFormatters';

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
      
      const clueData = await fetchUserCluesFromApi();
      
      // Transform the clues based on user's language
      const formattedClues: ClueData[] = clueData.map((dbClue) => 
        formatClueForDisplay(dbClue, language)
      );
      
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
      // Determine user's current week based on existing clues
      const weekNumber = await getCurrentUserWeek();
      
      // Get all clue IDs that have been sent to this user
      const receivedClueIds = await fetchUserClueIds();
      
      // Get a buzz clue that the user hasn't received yet
      const buzzClueData = await fetchAvailableBuzzClue(weekNumber, receivedClueIds);
      
      // Mark clue as sent to user
      await addClueToUser(buzzClueData.id, 'buzz');
      
      // Add notification
      const clueTitle = buzzClueData[`title_${language}` as keyof typeof buzzClueData] as string || buzzClueData.title_it || '';
      const clueDescription = buzzClueData[`description_${language}` as keyof typeof buzzClueData] as string || buzzClueData.description_it || '';
      
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
