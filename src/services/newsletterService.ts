
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  campaign?: string;
  referrer?: string;
}

/**
 * Saves a new newsletter subscriber to the database
 */
export const saveSubscriber = async (subscriber: Omit<NewsletterSubscriber, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    // Add tracking info
    const subscriberData = {
      ...subscriber,
      campaign: getCampaignFromUrl(),
      referrer: document.referrer || 'direct',
    };
    
    // Check if the email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', subscriber.email)
      .single();
    
    if (existingSubscriber) {
      return {
        success: false,
        error: "Questa email è già registrata alla newsletter."
      };
    }
    
    // Insert new subscriber
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriberData])
      .select();
    
    if (error) {
      console.error("Error saving subscriber:", error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error("Exception saving subscriber:", error);
    return {
      success: false,
      error: error.message || "Si è verificato un errore imprevisto."
    };
  }
};

/**
 * Gets campaign parameter from URL if present
 */
const getCampaignFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('campaign');
};

/**
 * Schedules the automated emails for the subscriber
 * This would be implemented as a server-side function
 */
export const scheduleAutomatedEmails = async (email: string): Promise<boolean> => {
  try {
    // This is just a placeholder. In a real implementation,
    // you would call a Supabase Edge Function or other backend API
    // to schedule the emails at the appropriate times.
    console.log("Scheduling automated emails for:", email);
    
    // Example call to a hypothetical Supabase Edge Function
    /*
    const { error } = await supabase.functions.invoke('schedule-newsletter-emails', {
      body: { email }
    });
    
    return !error;
    */
    
    return true;
  } catch (error) {
    console.error("Error scheduling emails:", error);
    return false;
  }
};
