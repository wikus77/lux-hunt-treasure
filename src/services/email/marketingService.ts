
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
    // First save to your DB
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        campaign: 'website_signup'
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
