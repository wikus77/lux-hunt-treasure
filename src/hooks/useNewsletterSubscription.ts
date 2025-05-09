
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriberData {
  name: string;
  email: string;
  referrer?: string;
  campaign?: string;
}

export const useNewsletterSubscription = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const subscribeToNewsletter = async (subscriber: SubscriberData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated and add their ID
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { 
            name: subscriber.name,
            email: subscriber.email,
            referrer: subscriber.referrer || null,
            campaign: subscriber.campaign || 'landing_page',
            user_id: userId || null // Add user ID if authenticated
          }
        ]);

      if (error) {
        console.error("Error saving subscriber:", error);
        
        // Check if it's a duplicate entry error
        if (error.code === '23505') {
          toast.info("Sei già iscritto alla newsletter!", {
            description: "Continueremo a tenerti aggiornato sul lancio di M1SSION."
          });
          return true; // Still consider it a success for the UI flow
        }
        
        throw error;
      }

      // Send confirmation email through edge function
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'welcome',
            email: subscriber.email,
            name: subscriber.name,
            subject: 'Benvenuto in M1SSION',
            data: {
              launchDate: '19 Giugno 2025'
            }
          }
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We don't throw here to avoid preventing the subscription from completing
      }

      console.log("Subscriber saved successfully:", data);
      setIsSubmitted(true);
      return true;
    } catch (error) {
      console.error("Failed to save subscriber:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getSubscribersCount = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Failed to get subscribers count:", error);
      return 0;
    }
  };
  
  return {
    subscribeToNewsletter,
    getSubscribersCount,
    isSubmitting,
    isSubmitted,
    setIsSubmitted
  };
};
