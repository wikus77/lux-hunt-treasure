
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  campaign?: string | null;
  referrer?: string | null;
}

/**
 * Saves a new newsletter subscriber to the database
 */
export const saveSubscriber = async (subscriber: Omit<NewsletterSubscriber, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    // Add tracking info
    const subscriberData = {
      name: subscriber.name,
      email: subscriber.email,
      campaign: getCampaignFromUrl(),
      referrer: document.referrer || 'direct',
    };
    
    // Check if the email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', subscriber.email)
      .maybeSingle();
    
    if (existingSubscriber) {
      return {
        success: false,
        error: "Questa email è già registrata alla newsletter."
      };
    }
    
    // Insert new subscriber
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert(subscriberData)
      .select();
    
    if (error) {
      console.error("Error saving subscriber:", error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Schedule automated emails
    await scheduleAutomatedEmails(subscriber.email, subscriber.name);
    
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
 */
export const scheduleAutomatedEmails = async (email: string, name = ''): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('schedule-newsletter-emails', {
      body: { email, name }
    });
    
    if (error) {
      console.error("Error invoking schedule-newsletter-emails function:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error scheduling emails:", error);
    return false;
  }
};
