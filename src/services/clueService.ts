
import { supabase } from "@/integrations/supabase/client";
import { DbClue, UserClue } from "@/types/clueTypes";
import { adaptToDbClue } from "@/utils/adaptToDbClue";

export const fetchUserCluesFromApi = async (): Promise<DbClue[]> => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error('User not authenticated');

  const { data: userClueData, error: userClueError } = await supabase
    .from('user_clues')
    .select('clue_id')
    .eq('user_id', userSession.session.user.id)
    .order('created_at', { ascending: false });

  if (userClueError) throw new Error(`Error fetching user clues: ${userClueError.message}`);
  if (!userClueData || userClueData.length === 0) return [];

  const validUserClues: UserClue[] = userClueData.filter(
    (uc): uc is UserClue => uc && typeof uc === 'object' && 'clue_id' in uc
  );

  const clueIds: string[] = validUserClues.map((uc) => uc.clue_id);
  if (clueIds.length === 0) return [];

  const { data: clueData, error: clueError } = await supabase
    .from('clues')
    .select('*')
    .in('id', clueIds);

  if (clueError) throw new Error(`Error fetching clue details: ${clueError.message}`);

  // Breaking the type inference chain with explicit typing
  const rawClues = (clueData ?? []) as any[];
  const clues: DbClue[] = rawClues.map((raw): DbClue => adaptToDbClue(raw));

  return clues;
};

export const addClueToUser = async (clueId: string, deliveryType: string = 'buzz') => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error('User not authenticated');

  const { error } = await supabase.from('user_clues').insert({
    user_id: userSession.session.user.id,
    clue_id: clueId,
    delivery_type: deliveryType
  });

  if (error) throw new Error(`Error adding clue to user: ${error.message}`);
};

export const fetchAvailableBuzzClue = async (
  weekNumber: number,
  receivedClueIds: string[]
): Promise<DbClue> => {
  const safeIds: string[] = receivedClueIds.length > 0
    ? receivedClueIds
    : ['00000000-0000-0000-0000-000000000000'];

  const { data: buzzClue, error: buzzClueError } = await supabase
    .from('clues')
    .select('*')
    .eq('type', 'buzz')
    .eq('week', weekNumber)
    .not('id', 'in', safeIds)
    .limit(1)
    .single();

  if (!buzzClue || buzzClueError) {
    const { data: fallbackClue, error: fallbackError } = await supabase
      .from('clues')
      .select('*')
      .eq('week', weekNumber)
      .not('id', 'in', safeIds)
      .limit(1)
      .single();

    if (!fallbackClue || fallbackError) {
      throw new Error('No available clues found');
    }

    // Breaking the type inference chain with explicit typing
    return adaptToDbClue(fallbackClue as any);
  }

  // Breaking the type inference chain with explicit typing
  return adaptToDbClue(buzzClue as any);
};

export const fetchUserClueIds = async (): Promise<string[]> => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error('User not authenticated');

  const { data: userClueData, error: userClueError } = await supabase
    .from('user_clues')
    .select('clue_id')
    .eq('user_id', userSession.session.user.id);

  if (userClueError) throw new Error(`Error fetching user clues: ${userClueError.message}`);

  const validUserClues: UserClue[] = Array.isArray(userClueData)
    ? userClueData.filter((uc): uc is UserClue => uc && typeof uc === 'object' && 'clue_id' in uc)
    : [];

  return validUserClues.map((uc) => uc.clue_id);
};

export const getCurrentUserWeek = async (): Promise<number> => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error('User not authenticated');

  const { data: userClueCount, error: countError } = await supabase
    .from('user_clues')
    .select('id', { count: 'exact' })
    .eq('user_id', userSession.session.user.id);

  if (countError) throw new Error(`Error counting user clues: ${countError.message}`);

  return Math.floor((userClueCount?.length || 0) / 7) + 1;
};
