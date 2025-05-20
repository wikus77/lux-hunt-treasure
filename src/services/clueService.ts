
import { supabase } from "@/integrations/supabase/client";
import { DbClue, UserClue, ClueData } from "@/types/clueTypes";
import { adaptToDbClue } from "@/utils/adaptToDbClue";

/**
 * Fetches all clues for a specific user
 */
export const fetchUserCluesFromApi = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  
  if (!userSession.session) {
    throw new Error('User not authenticated');
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
    return [];
  }
  
  // Type-safe filtering of valid clue IDs
  const validUserClues: UserClue[] = userClueData.filter(
    (uc): uc is UserClue => uc && typeof uc === 'object' && 'clue_id' in uc
  );
  
  const clueIds: string[] = validUserClues.map((uc: UserClue) => uc.clue_id);
  
  if (clueIds.length === 0) {
    return [];
  }
  
  // Get the actual clue details
  const { data: clueData, error: clueError } = await supabase
    .from('clues')
    .select('*')
    .in('id', clueIds);
  
  if (clueError) {
    throw new Error(`Error fetching clue details: ${clueError.message}`);
  }
  
  // Convert the raw response to properly typed DbClue[] objects
  const clues: DbClue[] = (clueData || []).map((raw): DbClue => adaptToDbClue(raw));
  
  return clues;
};

/**
 * Adds a new clue to a user's collection (e.g., when purchasing a Buzz clue)
 */
export const addClueToUser = async (clueId: string, deliveryType: string = 'buzz') => {
  const { data: userSession } = await supabase.auth.getSession();
  
  if (!userSession.session) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('user_clues')
    .insert({
      user_id: userSession.session.user.id,
      clue_id: clueId,
      delivery_type: deliveryType
    });
  
  if (error) {
    throw new Error(`Error adding clue to user: ${error.message}`);
  }
};

/**
 * Fetches a Buzz clue that the user hasn't received yet
 */
export const fetchAvailableBuzzClue = async (weekNumber: number, receivedClueIds: string[]) => {
  // Prepare safe placeholder for empty array condition
  const safeIds: string[] = receivedClueIds.length > 0 
    ? receivedClueIds 
    : ['00000000-0000-0000-0000-000000000000']; // Use UUID placeholder

  // Get a buzz clue that the user hasn't received yet
  const { data: buzzClue, error: buzzClueError } = await supabase
    .from('clues')
    .select('*')
    .eq('type', 'buzz')
    .eq('week', weekNumber)
    .not('id', 'in', safeIds)
    .limit(1)
    .single();
  
  if (buzzClueError || !buzzClue) {
    // Fallback: get any regular clue the user hasn't received yet
    const { data: fallbackClue, error: fallbackError } = await supabase
      .from('clues')
      .select('*')
      .eq('week', weekNumber)
      .not('id', 'in', safeIds)
      .limit(1)
      .single();
      
    if (fallbackError || !fallbackClue) {
      throw new Error('No available clues found');
    }
    
    // Convert the raw response to a properly typed DbClue
    return adaptToDbClue(fallbackClue);
  }
  
  // Convert the raw response to a properly typed DbClue
  return adaptToDbClue(buzzClue);
};

/**
 * Get all clue IDs that a user has already received
 */
export const fetchUserClueIds = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  
  if (!userSession.session) {
    throw new Error('User not authenticated');
  }
  
  // Get all clue IDs that have been sent to this user
  const { data: userClueData, error: userClueError } = await supabase
    .from('user_clues')
    .select('clue_id')
    .eq('user_id', userSession.session.user.id);
  
  if (userClueError) {
    throw new Error(`Error fetching user clues: ${userClueError.message}`);
  }
  
  // Type-safe handling for received clue IDs
  const validUserClues: UserClue[] = Array.isArray(userClueData) 
    ? userClueData.filter((uc): uc is UserClue => 
        uc && typeof uc === 'object' && 'clue_id' in uc)
    : [];
  
  return validUserClues.map((uc: UserClue) => uc.clue_id);
};

/**
 * Count how many clues a user has to determine their current week
 */
export const getCurrentUserWeek = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  
  if (!userSession.session) {
    throw new Error('User not authenticated');
  }
  
  const { data: userClueCount, error: countError } = await supabase
    .from('user_clues')
    .select('id', { count: 'exact' })
    .eq('user_id', userSession.session.user.id);
    
  if (countError) {
    throw new Error(`Error counting user clues: ${countError.message}`);
  }
  
  return Math.floor((userClueCount?.length || 0) / 7) + 1;
};
