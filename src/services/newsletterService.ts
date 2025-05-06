
import { supabase } from "@/integrations/supabase/client";

export interface NewsletterSubscriber {
  name: string;
  email: string;
  campaign?: string;
  referrer?: string;
}

export const saveSubscriber = async (subscriber: NewsletterSubscriber): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([subscriber]);
    
    if (error) {
      if (error.code === '23505') {
        return { success: false, error: "Questa email è già registrata alla newsletter" };
      }
      console.error("Error saving subscriber:", error);
      return { success: false, error: "Si è verificato un errore nel salvare l'iscrizione" };
    }
    
    // Send confirmation email
    const { error: emailError } = await supabase.functions.invoke('send-newsletter-confirmation', {
      body: { name: subscriber.name, email: subscriber.email }
    });
    
    if (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // We still consider the signup successful even if email fails
    }
    
    return { success: true };
  } catch (err) {
    console.error("Newsletter service error:", err);
    return { success: false, error: "Si è verificato un errore. Riprova più tardi." };
  }
};

export const getSubscribersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error counting subscribers:", error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error("Newsletter count error:", err);
    return 0;
  }
};
