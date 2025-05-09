
import { supabase } from "@/integrations/supabase/client";
import { EmailRecipient } from "./types";
import { sendEmail } from "./mailjetClient";

/**
 * Subscribe email to marketing list
 * In a production app, you would use Mailjet's Contacts API
 * Here we just simulate the subscription
 */
export const subscribeToMarketingList = async (email: string, name: string) => {
  try {
    // Get the current user ID if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // First save to your DB with proper RLS policies now in place
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        campaign: 'website_signup',
        user_id: userId || null
      });
    
    if (dbError) throw dbError;
    
    // Then you could call the Mailjet Contacts API
    // This would be implemented in a separate Edge Function
    
    return { success: true };
  } catch (error) {
    console.error('Error subscribing to marketing list:', error);
    return { success: false, error };
  }
};

/**
 * Send a marketing email to subscribers
 */
export const sendMarketingEmail = async (
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  campaignName: string
) => {
  return sendEmail('marketing', {
    to: recipients,
    subject,
    htmlContent,
    trackOpens: true,
    trackClicks: true,
    customCampaign: campaignName,
  });
};
