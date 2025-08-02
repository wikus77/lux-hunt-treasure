// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that a user has an agent code, creating one if necessary
 */
export const ensureAgentCode = async (userId: string): Promise<string | null> => {
  try {
    // First try to get existing agent code
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent code:', error);
      return null;
    }

    if (profile?.agent_code) {
      return profile.agent_code;
    }

    // If no agent code exists, the database trigger should have created one
    // Try again after a brief delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: updatedProfile, error: retryError } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', userId)
      .single();

    if (retryError) {
      console.error('Error on retry fetching agent code:', retryError);
      return null;
    }

    return updatedProfile?.agent_code || null;
  } catch (error) {
    console.error('Exception in ensureAgentCode:', error);
    return null;
  }
};

/**
 * Gets the agent code for a specific user
 */
export const getAgentCodeForUser = async (userId: string): Promise<string | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent code for user:', error);
      return null;
    }

    return profile?.agent_code || null;
  } catch (error) {
    console.error('Exception in getAgentCodeForUser:', error);
    return null;
  }
};