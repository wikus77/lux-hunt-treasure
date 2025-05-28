
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferralData {
  invitedEmail: string;
  referrerCode: string;
}

/**
 * Creates a new referral record
 */
export const createReferral = async (data: ReferralData): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('referrals')
      .insert([{
        invited_email: data.invitedEmail.toLowerCase().trim(),
        referrer_code: data.referrerCode.trim(),
      }]);
    
    if (error) {
      console.error("Error creating referral:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception creating referral:", error);
    return false;
  }
};

/**
 * Updates a referral status
 */
export const updateReferralStatus = async (invitedEmail: string, status: 'pending' | 'completed' | 'expired'): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('referrals')
      .update({ status })
      .eq('invited_email', invitedEmail.toLowerCase().trim());
    
    if (error) {
      console.error("Error updating referral status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating referral status:", error);
    return false;
  }
};

/**
 * Gets all referrals for a given referrer code
 */
export const getReferralsByCode = async (referrerCode: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from('referrals')
      .select('*')
      .eq('referrer_code', referrerCode.trim());
    
    if (error) {
      console.error("Error fetching referrals:", error);
      toast.error("Errore nel recupero degli inviti", {
        description: "Non è stato possibile ottenere i tuoi referrals."
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception fetching referrals:", error);
    return [];
  }
};
