
import { supabase } from "@/integrations/supabase/client";
import { sendRegistrationEmail } from "./email/registrationEmailService";

export interface NewsletterSubscriptionData {
  name: string;
  email: string;
  campaign?: string;
  referrer?: string;
}

export const saveSubscriber = async (data: NewsletterSubscriptionData): Promise<void> => {
  try {
    // First, check if user already exists
    const { data: existingSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', data.email)
      .limit(1);
    
    if (existingSubscribers && existingSubscribers.length > 0) {
      console.log("Email already registered to newsletter:", data.email);
      
      // Still send the confirmation email
      await sendRegistrationEmail({
        email: data.email,
        name: data.name,
        formType: "newsletter"
      });
      
      return;
    }
    
    // Insert new subscriber
    const { error } = await supabase.from('newsletter_subscribers').insert([
      {
        name: data.name,
        email: data.email,
        campaign: data.campaign || 'website',
        referrer: data.referrer
      }
    ]);
    
    if (error) {
      throw error;
    }
    
    // Send confirmation email
    await sendRegistrationEmail({
      email: data.email,
      name: data.name,
      formType: "newsletter"
    });
    
    console.log("New subscriber added to newsletter:", data.email);
  } catch (error) {
    console.error("Error saving newsletter subscriber:", error);
    throw error;
  }
};
