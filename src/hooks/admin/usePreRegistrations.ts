
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Interfaccia per i dati delle preregistrazioni
export interface PreRegistration {
  id: string;
  name: string;
  email: string;
  created_at: string;
  referrer: string | null;
  referral_code: string;
  credits: number;
  confirmed: boolean;
  user_id: string | null;
  profiles?: { agent_code: string | null } | null;
  numero_progressivo?: number;
  agent_code?: string | null;
}

// Questa funzione risolve il problema del refetch alla vista modificata
export const fetchPreRegistrations = async () => {
  const { data, error } = await supabase
    .from('pre_registrations')
    .select(`
      id, 
      name, 
      email, 
      created_at, 
      referrer, 
      referral_code, 
      credits, 
      confirmed, 
      user_id,
      user_id
    `)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // Fetch agent codes separately for each user that has a user_id
  const preRegistrationsWithAgentCodes = await Promise.all(
    data.map(async (item, index) => {
      let agentCode = null;
      
      // Only query profiles for items with user_id
      if (item.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('agent_code')
          .eq('id', item.user_id)
          .maybeSingle();
          
        if (!profileError && profileData) {
          agentCode = profileData.agent_code;
        }
      }
      
      return {
        ...item,
        numero_progressivo: index + 1,
        agent_code: agentCode
      };
    })
  );
  
  return preRegistrationsWithAgentCodes;
};

export const usePreRegistrations = () => {
  return useQuery({
    queryKey: ['pre_registrations'],
    queryFn: fetchPreRegistrations
  });
};
